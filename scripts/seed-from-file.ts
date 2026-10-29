/**
 * Seeds one or more organizations (admin + employees each) described in a
 * JSON file, as an alternative to filling out the /local-seed page in the
 * browser.
 *
 *   npx tsx scripts/seed-from-file.ts                        # scripts/local-seed-data.json
 *   npx tsx scripts/seed-from-file.ts path/to/other-file.json
 *
 * Fill in scripts/local-seed-data.json — either a single { org, admin,
 * employees } object, or { orgs: [ {org, admin, employees}, ... ] } to seed
 * several organizations in one run (e.g. one academic, one company, one
 * public-sector). It calls the exact same seeding code the UI form does
 * (`seedLocalOrg`), so the result is identical either way; this just skips
 * the browser round-trip. Like the UI, it refuses to reseed an org whose name
 * already exists, but keeps going for the rest — see app/api/_lib/localSeed.ts.
 */
import fs from 'fs';
import path from 'path';
import { seedLocalOrg, type LocalSeedInput } from '../app/api/_lib/localSeed';

const VALID_CATEGORIES = ['company', 'public', 'academic'];

function normalizeOrgEntry(data: any): LocalSeedInput {
  if (!data?.org?.name?.trim()) throw new Error('org.name is required.');
  const category = String(data?.org?.category ?? '').trim().toLowerCase();
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error(`org.category must be one of ${VALID_CATEGORIES.join(', ')} — got "${data?.org?.category}".`);
  }
  // A seeded org is for local development, not a real purchase, so it
  // defaults to the top tier rather than making every test org start on
  // whatever the cheapest plan happens to be. Still overridable per org in
  // the JSON (see local-seed-data.example.json for basic/standard examples).
  const plan = data?.org?.plan?.trim() || 'premium';
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
    org: { name: data.org.name.trim(), category: category as LocalSeedInput['org']['category'], plan },
    admin: {
      name: data.admin.name.trim(),
      email: data.admin.email.trim(),
      password: data.admin.password,
    },
    employees,
  };
}

function loadInputs(filePath: string): LocalSeedInput[] {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);

  if (Array.isArray(data?.orgs)) {
    return data.orgs.map(normalizeOrgEntry);
  }
  return [normalizeOrgEntry(data)];
}

async function main() {
  const filePath = path.resolve(process.argv[2] || 'scripts/local-seed-data.json');
  console.log(`Reading ${filePath}...`);
  const inputs = loadInputs(filePath);
  console.log(`Found ${inputs.length} organization${inputs.length === 1 ? '' : 's'} to seed.\n`);

  let seededCount = 0;
  let hadFailure = false;

  for (const input of inputs) {
    const result = await seedLocalOrg(input);

    if (!result.ok) {
      hadFailure = hadFailure || result.reason !== 'already_seeded';
      console.log(`Skipped "${input.org.name}" (${result.reason}): ${result.message}`);
      continue;
    }

    seededCount++;
    console.log(`Seeded "${result.org}" (${result.category}).`);
    console.log(`  Admin: ${result.adminEmail}`);
    console.log(`  Employees created: ${result.employeesCreated}`);
    if (result.employeeErrors.length > 0) {
      console.log('  Employee errors:');
      for (const e of result.employeeErrors) console.log(`    ${e.email}: ${e.message}`);
    }
  }

  console.log(`\n${seededCount}/${inputs.length} organization(s) seeded.`);
  console.log('Credentials written to the seed_credential table.');
  if (hadFailure) process.exit(1);
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => process.exit(0));
