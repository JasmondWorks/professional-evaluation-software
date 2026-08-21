# Bulk upload

Spreadsheet upload for any record type. Describe your columns once and you get
the template, the header check, the preview, the deduplication, the per-row
validation and the result report.

The employee upload is the reference implementation. Read
`specs/employees.ts` and `app/api/addEmployee/bulk/route.ts` alongside this.

## The pieces

| File | What it does |
| --- | --- |
| `columns.ts` | Header matching, near-miss suggestions, template generation. Knows nothing about any entity. |
| `spec.ts` | The `BulkUploadSpec` type: everything one upload knows about itself. |
| `specs/*.ts` | One spec per upload. Shared by browser and server. |
| `app/components/bulk-upload/BulkUploadModal.tsx` | The single modal. Give it a spec. |
| `app/api/_lib/bulkUpload.ts` | `runBulkUpload()`: the server-side row loop. |

## Adding a new upload

### 1. Write the spec

`app/lib/bulk-upload/specs/departments.ts`:

```ts
import { z } from 'zod';
import type { BulkUploadSpec } from '../spec';

export const departmentSchema = z.object({
  name: z.string().min(2),
  faculty_college: z.string().min(2),
  org: z.string().min(1),
});

export const departmentUploadSpec: BulkUploadSpec = {
  id: 'departments',
  entity: { singular: 'department', plural: 'departments' },
  columns: [
    { key: 'name', label: 'Department', required: true, example: 'Mechanical Engineering',
      aliases: ['department', 'department name'] },
    { key: 'faculty_college', label: 'Faculty', required: true, example: 'Engineering',
      aliases: ['faculty', 'college'] },
  ],
  schema: departmentSchema,
  dedupeKey: 'name',
  endpoint: '/api/departments/bulk',
  clientContext: { org: 'preview' },
};
```

`clientContext` exists because most schemas require `org`, which the server
always takes from the verified token. The browser supplies a placeholder purely
so validation can run; the value is discarded.

`aliases` are worth the two minutes. They are what turns "your file is missing
`faculty_college`" into "did you mean `faculty_college`?" when somebody wrote
`Faculty`.

### 2. Add the route

```ts
export async function POST(req: Request) {
  const auth = authorize(tokenFromRequest(req), { anyOf: ['can_access_employee_data'] });
  if (!auth.ok) return auth.response;
  const org = String(auth.user.org);

  const body = await req.json();

  return runBulkUpload<DepartmentInput>({
    rows: body?.rows,
    schema: departmentUploadSpec.schema,
    context: { org },                       // from the token, never the file
    dedupeKey: departmentUploadSpec.dedupeKey,
    create: async (row) => {
      const existing = await prisma.department.findFirst({ where: { name: row.name, org } });
      if (existing) return { status: 'skipped', reason: 'Already exists.', key: row.name };
      await prisma.department.create({ data: row });
      return { status: 'created', key: row.name };
    },
  });
}
```

`create` must not throw. Return `{ status: 'failed', reason }` instead, or one
bad row takes the whole request down.

The **GET** on the same route feeds the preview. Both keys are optional:

```ts
return NextResponse.json({
  existing: names.map((n) => n.toLowerCase()),   // marks rows "already registered"
  reference: { faculties: [...] },               // for referenceChecks
});
```

### 3. Open the modal

```tsx
const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Create multiple departments</Button>

<BulkUploadModal
  spec={departmentUploadSpec}
  isOpen={open}
  setIsOpen={setOpen}
  onCompleted={() => refreshList()}
/>
```

## What the modal does, in order

1. **Header check, before any row is shown.** A file missing required columns is
   refused outright and the missing ones are named. Showing rows from a file that
   cannot be submitted only invites a pointless scroll.
2. **Unrecognised headers** are reported with a suggested correction where one is
   close, and ignored otherwise.
3. **Two headers meaning one column** is an error, not a silent pick.
4. **Row validation** with the spec's schema — the same one the server runs.
5. **Reference checks**, e.g. a role that does not exist in this organization.
6. **Duplicates within the file** on `dedupeKey`: the first is kept, the rest are
   listed with their row numbers.
7. **Records that already exist** are marked, not silently merged.
8. **A summary**: rows read, ready, duplicates removed, already registered, with
   errors. Plus a filter for just the rows needing attention.
9. **Submit** is blocked while nothing is ready, using the `aria-disabled`
   pattern from AGENTS.md so the reason appears rather than the button going dead.
10. **A result view**: created, skipped and failed with reasons, and the failed
    rows downloadable as a CSV with an appended `error` column.

## Rules worth keeping

**Validate on both sides with one schema.** The modal is convenience. Anyone can
post straight to the endpoint, so `runBulkUpload` re-validates everything. Because
both read `spec.schema`, the preview cannot promise something the server refuses.

**Never take scope from the file.** `org` comes from the verified token via
`context`. A column called `org` in the spreadsheet is ignored.

**No single transaction.** One bad row must not roll back forty-nine good ones.

**Skipped is not failed.** "Already registered" means nothing is wrong with the
file. "Date of birth is invalid" means the uploader must change something. They
read differently in the result, so classify them correctly.

**Row numbers are spreadsheet row numbers.** The header is row 1, so the first
data row is row 2. `runBulkUpload` already does this; do not renumber.

**Side effects go in `after`.** Credential emails for the employee upload run
there, sequentially, once every row is decided, so a provider rate limit cannot
abort creation that already succeeded.

## Limits

CSV only. XLSX needs the `xlsx` package, which is a heavy dependency and a
decision worth making deliberately rather than by default.

500 rows per upload, enforced on both sides. Raise `maxRows` on the spec if a
particular upload needs more, and set the same value on the route.
