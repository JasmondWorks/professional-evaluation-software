// Sample maintenance inventory, so the maintenance model has facilities to open.
//
// The client asked for data in every field and page of the maintenance model so
// he can verify the work he and the previous developer did on it. The sheets
// themselves carry worked sample figures; this fills the register they hang off.
//
//   npx tsx scripts/seed-maintenance.ts "Org Name"

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FACILITIES = [
  {
    identification_symbol: 'GEN-01',
    description_of_facility: '250 kVA standby generator',
    location: 'Power house, main campus',
    facility_register_id_no: 'FR-1001',
    type: 'Power',
    priority_rating: '1',
    remarks: 'Runs on every public supply outage; weekly test run on Mondays.',
  },
  {
    identification_symbol: 'AC-14',
    description_of_facility: 'Central air-conditioning plant',
    location: 'Administrative block, roof',
    facility_register_id_no: 'FR-1002',
    type: 'HVAC',
    priority_rating: '2',
    remarks: 'Compressor overhauled last quarter; filters changed monthly.',
  },
  {
    identification_symbol: 'LTH-03',
    description_of_facility: 'Centre lathe, workshop bay 3',
    location: 'Engineering workshop',
    facility_register_id_no: 'FR-1003',
    type: 'Machine tool',
    priority_rating: '2',
    remarks: 'Used for undergraduate practicals; heaviest load in second semester.',
  },
  {
    identification_symbol: 'PMP-07',
    description_of_facility: 'Borehole pump and pressure tank',
    location: 'Water works',
    facility_register_id_no: 'FR-1004',
    type: 'Utility',
    priority_rating: '1',
    remarks: 'Sole water source; no standby unit installed.',
  },
  {
    identification_symbol: 'VEH-22',
    description_of_facility: 'Staff bus, 30-seater',
    location: 'Transport yard',
    facility_register_id_no: 'FR-1005',
    type: 'Vehicle',
    priority_rating: '3',
    remarks: 'Services the two nearest staff quarters, morning and evening.',
  },
  {
    identification_symbol: 'LIFT-02',
    description_of_facility: 'Passenger lift, senate building',
    location: 'Senate building',
    facility_register_id_no: 'FR-1006',
    type: 'Conveyance',
    priority_rating: '1',
    remarks: 'Statutory inspection due annually.',
  },
];

async function main() {
  const org = process.argv[2];
  if (!org) {
    console.error('Usage: npx tsx scripts/seed-maintenance.ts "Org Name"');
    process.exit(1);
  }

  // Top up rather than skip: an organization that already has a facility or two
  // still needs the rest of the register populated, and re-running should never
  // duplicate a symbol it already holds.
  const existing = await prisma.facilities.findMany({
    where: { org },
    select: { identification_symbol: true },
  });
  const held = new Set(existing.map((f) => f.identification_symbol));
  const missing = FACILITIES.filter((f) => !held.has(f.identification_symbol));

  if (missing.length === 0) {
    console.log(`${org} already holds all ${FACILITIES.length} sample facilities.`);
    return;
  }

  await prisma.facilities.createMany({
    data: missing.map((f) => ({ ...f, org })),
  });

  console.log(
    `Added ${missing.length} facilities to ${org} (it already had ${existing.length}).`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
