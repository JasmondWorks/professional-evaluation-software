const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Running direct SQL migration on WorkSamplingStudy table...');
  try {
    // Existing columns
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "WorkSamplingStudy" 
      ADD COLUMN IF NOT EXISTS "lockedDates" jsonb;
    `);
    console.log('lockedDates column verified/added successfully.');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "WorkSamplingStudy" 
      ADD COLUMN IF NOT EXISTS "lockedTimes" jsonb;
    `);
    console.log('lockedTimes column verified/added successfully.');

    // New: multi-month support
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "WorkSamplingStudy" 
      ADD COLUMN IF NOT EXISTS "studyMonths" jsonb;
    `);
    console.log('studyMonths column verified/added successfully.');

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
