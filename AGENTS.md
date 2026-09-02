# AGENTS.md — Working conventions for this project

Guidance for AI agents (and humans) contributing to the PES (Professional
Evaluation Software) codebase. Keep this file short and additive.

## UI / UX constraints

> **Design system:** this project follows a single design language — see
> [DESIGN.md](DESIGN.md) for the tokens, shared components (`app/components/ui/`),
> and patterns to use for any new or changed UI. The running record of the design
> overhaul (what changed and why) lives in [UI_OVERHAUL.md](UI_OVERHAUL.md); when you
> make further UI changes, append a dated entry there, and update DESIGN.md if you
> add or change a token, component, or pattern.

### Disabled controls must always explain themselves
A button (or any control) that is disabled MUST tell the user **why**, right next
to it — never leave a bare greyed-out control with no context. Use one of:

- an **info icon** with a tooltip/title, and/or
- a short **message card** or inline helper line beside/under the control
  stating the reason and, ideally, what to do to enable it.

This applies especially where the reason is non-obvious (a workflow gate, a
missing prerequisite, a permission, an empty queue). Examples in this repo:
- "Run ANOVA & Generate Report" — blocked until a setting is computed, theme/
  feeling data is collected, and all submissions are approved (shows the reason).
- "Approve entire division" — when nothing is awaiting approval, show a card
  saying so rather than a silent disabled button.

Rule of thumb: **if a user could reasonably ask "why can't I click this?", the
answer must already be on the screen.**

### Blocked controls look disabled but stay clickable
A control the user cannot usefully use yet MUST look unavailable, but must still
receive the click. Use the muted styling and `aria-disabled="true"`, never the
`disabled` attribute, and have the handler run validation and surface what is
missing.

A truly `disabled` button swallows the click, so a user who cannot see what is
wrong gets no answer when they press it. Letting the press through means the
form can say "Enter a score for Punctuality and two other rows", which is the
only thing that moves them forward.

```tsx
// Wrong: the click never lands, so the user learns nothing.
<Button disabled={!isValid} onClick={save}>Save form</Button>

// Right: reads as unavailable, still explains itself when pressed.
<Button
  aria-disabled={!isValid}
  className={!isValid ? "opacity-50" : undefined}
  onClick={() => (isValid ? save() : revealValidationErrors())}
>
  Save form
</Button>
```

Pair this with the rule above: the reason should already be on screen, and
pressing it should point at the specific field still to be filled.

Reserve the real `disabled` attribute for controls that are inert for reasons the
user cannot act on at all, such as a form locked after submission.

### Nothing may look machine-generated
Everything a client or user reads (UI copy, docs, specs, reports, artifacts) must
read as though a person wrote it. Avoid the tells:

- **Em dashes.** Use a comma, colon, full stop, or rewrite the sentence.
- **Emphasis sprayed everywhere.** If half a paragraph is bold, nothing is
  emphasised. Reserve bold for the rare word that genuinely carries the sentence,
  and let headings, tables and structure do the rest.
- **Contrastive filler:** "not just X, but Y", "it isn't A, it's B".
- **Triadic padding:** "precise, restrained and immaculate" where one word works.
- **Empty intensifiers:** "critically", "notably", "seamlessly", "robust",
  "leverage", "delve", "comprehensive".
- **Openers that restate the heading** before saying anything new.
- **Emoji as section markers**, and decorative numbering (01 / 02 / 03) on things
  that are not an actual sequence. Numbering is fine when order carries meaning.

Same rule in visual design. Avoid the current generated-design cluster: warm
cream grounds with a serif display and terracotta accent, near-black with one
acid-green pop, purple-to-blue gradient heroes, Inter or Space Grotesk chosen by
default, `rounded-lg` on everything, accent bars on rounded cards, and centred
everything. Make deliberate choices instead, and follow [DESIGN.md](DESIGN.md).

Write from the reader's side of the screen: name things as people recognise them,
use active voice, and say what happened plainly.

### Every page has a title (and an optional subtitle)
Every page MUST show a clear **title** at the top so the user always knows where
they are, and an **optional subtitle** only when a short line of context helps
(what the page is for / what to do). Match the established pattern (see
`app/(admin)/models/page.tsx`): a bold `h1` title, and a muted subtitle beneath
it when useful. Don't add a subtitle just to fill space — omit it if the title
already says everything.

## Project stage: pre-launch

**This application has not launched. There are no real customers and no
production data.** The Vercel "production" deployment and the Neon database it
points at are a demo environment the client tests in. Everything in them is
seed or test data.

So do not stop to ask permission for the things that would normally need it.
Proceed and report what you did:

- **Run migrations on any database, including Neon.** Destructive statements
  (`TRUNCATE`, `DROP COLUMN`, `DROP TABLE`) are fine. Still check the live state
  first and use `prisma migrate resolve --applied` where a migration's effect
  already exists, because re-running it wastes time and can fail the queue.
- **Deploy.** Commit, merge into `dev`, push. `dev` is the production branch.
- **Change the schema** whenever the model requires it, and write the migration.
- **Delete superseded code, routes and pages** once something replaces them.
  Leaving two implementations of the same feature reachable is worse than
  removing the old one.
- **Reset or reseed data** to get a flow into a testable state.

Judgement still applies to a few things, so ask before:

- rotating or replacing secrets and API keys,
- deleting the Neon project, the Vercel project, or a git branch someone else
  is working on,
- removing the client's own uploaded documents from the repo,
- force-pushing over anyone else's commits.

### Nothing is done until it is on `jasmond/dev`

Vercel builds `jasmond/dev`. Work that sits anywhere else is not deployed, and
the client cannot see it however many times they sign in.

So before reporting anything as done, shipped, live or deployed, confirm it:

```bash
git fetch jasmond && git log --oneline -1 jasmond/dev
```

The commit you expect must be the one printed. Say which commit you confirmed.

A push is not proof. It can be rejected by a repository ruleset (`GH013`,
"Changes must be made through a pull request"), by a permission prompt, or by a
credential problem, and the failure is easy to skim past when the next task is
already underway. A pull request that has been opened but not merged does not
count either, and neither does a feature branch.

If the work cannot reach `jasmond/dev`, say so plainly and say what is blocking
it. An unmerged pull request reported as a finished feature costs the client a
round of testing against a deployment that does not contain it, which is worse
than saying "written, not yet deployed".

**Revisit this section the moment a real organization onboards.** From then on
the deployed database holds other people's staff records, and the caution above
becomes mandatory again rather than optional.

## Data / correctness constraints

- **Organization isolation:** every query is scoped by `org`. No data may leak
  between organizations. Staff counts/listings must be identical for all users
  of the same org and consistent across every page (single source of truth =
  the `pesuser` roster, org-scoped).
- **Stress evaluation:** never mix cycles — scope Form 5 data to the effective
  settings cycle. Faculty stress = mean of its departments; organization stress
  = mean of its faculties. See project memory `stress-eval-rules`.
- **Database queries:** NEVER use raw SQL queries (`$queryRaw`, `$queryRawUnsafe`, or `$executeRaw`) unless absolutely necessary (e.g., for DDL schema migrations like `ALTER TABLE`). Always leverage the power of the Prisma ORM methods (like `findMany`, `create`, `updateMany`) for all CRUD operations to ensure type-safety, relationship cascades, and automatic protection against SQL injection.

## API route security constraints

Every file under `app/api/**/route.ts` is a public URL. Next.js does not protect
it, the sidebar does not protect it, and `middleware.ts` does not protect it —
that file matches page paths only, and gates on a `role` **cookie**, which the
browser sends and the browser can set. An unguarded route handler is reachable by
anyone on the internet with `curl`.

### Every route handler starts by asking who the caller is

Before the first database call, every `GET`/`POST`/`PATCH`/`DELETE` handler must
establish identity from a **cryptographically verified** token:

```ts
import { authorize, tokenFromRequest } from '@/app/api/_lib/authGuard';

export async function POST(req: NextRequest) {
  const auth = authorize(tokenFromRequest(req), {});   // {} = any signed-in user
  if (!auth.ok) return auth.response;

  const org = auth.user.org ? String(auth.user.org) : null;   // ← the ONLY org
  …
}
```

Use `authorize(token, { anyOf: ['can_…'] })` or `{ roles: [...] }` when the route
needs more than a signed-in user. Routes under `app/api/admin/` use
`consoleViewer()` from `app/api/admin/_scope.ts` instead, which additionally
separates the platform operator (`super-admin`) from an organization admin
(`admin`) — **these are different tiers**; see `app/components/utils/roles.ts`.

The four exceptions, and there are no others: `login`, `signup`, `resetPassword`
(request leg), and provider webhooks — which authenticate by **signature**, as
`paystack/webhook` does with HMAC SHA-512. If a route is deliberately public,
say so in a comment at the top with the reason.

### The org must come from the token, never from the request

This is the rule that has been broken most often here, and it is subtle because
the resulting code *looks* correct — the query is scoped by `org`, it is just
scoped by an `org` the caller chose. Three routes were once fixed by a commit
titled "scope … to org to prevent data leakage" and remained fully readable
across tenants afterwards, because the org still arrived in the request body.

```ts
// Wrong — every one of these is attacker-controlled.
const { org } = await req.json();
const org = new URL(req.url).searchParams.get('org');
const org = jwtDecode<{ org: string }>(token).org;   // decode ≠ verify
const org = params.org;                              // from the URL path

// Right — a claim on a token whose signature was checked.
const auth = authorize(tokenFromRequest(req), {});
if (!auth.ok) return auth.response;
const org = String(auth.user.org);
```

`jwt.decode()` / `jwtDecode()` **read** a token without checking its signature.
They are fine in client components displaying the user's own name; using either
one on the server, for anything the answer depends on, means the server accepts a
token the attacker wrote by hand. Server side: `jwt.verify`, always, via
`verifyToken()`.

Where an org, user id, or department genuinely must come from the URL (the
`app/api/admin/orgs/[org]/*` console routes), compare it against the verified
claim and refuse the mismatch — and prefer **404 over 403**, since a 403 confirms
that the other tenant's record exists.

### Never sign or verify with an inline fallback secret

```ts
// Wrong: one unset variable silently downgrades the app to a secret that is
// published in this repository.
jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-change-in-production')
```

Use the helper in `app/lib/jwt.ts`, which throws instead. Never write a literal
secret; `app/api/admin/login` shipped signing with `'oti'`.

### Never return a password column

`prisma.pesuser.findMany()` with no `select` returns `password`, `resettoken` and
`resettokenexpiry`. Always name the columns. For the console routes, reuse
`PUBLIC_USER_COLUMNS` from `app/api/admin/_scope.ts`.

### Store credentials hashed, and compare them one way

Passwords are written with `bcrypt.hash(...)` and checked with `bcrypt.compare`.
Never write a literal into the column (`password: "default_password"` shipped
here), and never fall back to `password === user.password` when the stored value
does not look like a hash — that keeps legacy plaintext rows working as valid
credentials forever, which is exactly why they never get migrated.

### No route may run DDL, and no debug route ships

`app/api/runMigration` executed `ALTER TABLE` on an unauthenticated `GET`. Schema
changes go through `prisma/migrations/` (see [CLAUDE.md](CLAUDE.md)), never a
route handler. Routes named `debug*`, and anything that exists to introspect the
app rather than serve it, do not belong in `app/api/`.

### Before you finish a task that touched `app/api/`

```bash
# Any handler with no identity check is a finding, not a style preference.
# Match the CALL, not the bare word: `authorize` also matches `authorizedBy`,
# which is a study field, and that false pass hid an unguarded route once.
grep -rLE 'authorize\(|verifyToken\(|tokenFromRequest\(|viewerFrom\(|consoleViewer\(|jwt.verify\(|Deliberately public' \
  app/api --include=route.ts

# Server-side use of an unverified token.
grep -rn 'jwtDecode\|jwt\.decode' app/api

# Attacker-supplied scoping.
grep -rn 'body\.org\|searchParams.get("org")\|params\.org' app/api
```

New entries in any of these lists must be justified in the commit message or
fixed. **Do not copy the shape of a neighbouring route to decide this.** Most of
`app/api/` was inherited from the client's original codebase, where no route
checked anything; matching the surrounding idiom reproduces the vulnerability,
and that is how it spread into routes written here.
