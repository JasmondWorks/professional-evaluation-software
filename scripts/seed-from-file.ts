/**
 * Seeds the organization/admin/employees described in a JSON file, as an
 * alternative to filling out the /local-seed page in the browser.
 *
 *   npx tsx scripts/seed-from-file.ts                        # scripts/local-seed-data.json
 *   npx tsx scripts/seed-from-file.ts path/to/other-file.json
 *
 * Fill in scripts/local-seed-data.json (org, admin, and as many/few employees
 * as you like — delete the placeholder employee entirely if you don't want to
 * seed any) and run this. It calls the exact same seeding code the UI form
 * does (`seedLocalOrg`), so the result is identical either way; this just
 * skips the browser round-trip. Like the UI, it refuses once an organization
 * already exists — see app/api/_lib/localSeed.ts.
 */
import fs from 'fs';
import path from 'path';
import { seedLocalOrg, type LocalSeedInput } from '../app/api/_lib/localSeed';

const VALID_CATEGORIES = ['company', 'public', 'academic'];

function loadInput(filePath: string): LocalSeedInput {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);

  if (!data?.org?.name?.trim()) throw new Error('org.name is required.');
  if (!VALID_CATEGORIES.includes(data?.org?.category)) {
    throw new Error(`org.category must be one of ${VALID_CATEGORIES.join(', ')} — got "${data?.org?.category}".`);
  }
  if (!data?.org?.plan?.trim()) throw new Error('org.plan is required.');
  if (!data?.admin?.name?.trim()) throw new Error('admin.name is required.');
  if (!data?.admin?.email?.trim()) throw new Error('admin.email is required.');
  if (!data?.admin?.password?.trim()) throw new Error('admin.password is required.');

  const employees = Array.isArray(data.employees)
    ? data.employees.filter((e: any) => e?.name?.trim() || e?.email?.trim() || e?.password?.trim())
    : [];

  for (const emp of employees) {
    if (!emp.name?.trim() || !emp.email?.trim() || !emp.password?.trim()) {
      throw new Error(`Employee entry ${JSON.stringify(emp)} needs name, email and password (or remove it entirely).`);
    }
  }

  return {
    org: { name: data.org.name.trim(), category: data.org.category, plan: data.org.plan.trim() },
    admin: {
      name: data.admin.name.trim(),
      email: data.admin.email.trim(),
      password: data.admin.password,
    },
    employees,
  };
}

async function main() {
  const filePath = path.resolve(process.argv[2] || 'scripts/local-seed-data.json');
  console.log(`Reading ${filePath}...`);
  const input = loadInput(filePath);

  const result = await seedLocalOrg(input);

  if (!result.ok) {
    console.error(`Seeding failed (${result.reason}): ${result.message}`);
    process.exit(1);
  }

  console.log(`\nSeeded "${result.org}".`);
  console.log(`  Admin: ${result.adminEmail}`);
  console.log(`  Employees created: ${result.employeesCreated}`);
  if (result.employeeErrors.length > 0) {
    console.log('  Employee errors:');
    for (const e of result.employeeErrors) console.log(`    ${e.email}: ${e.message}`);
  }
  console.log('\nCredentials also written to LOCAL_SEED_CREDENTIALS.md.');
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => process.exit(0));
