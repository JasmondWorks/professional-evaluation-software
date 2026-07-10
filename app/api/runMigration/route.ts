export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('Running direct SQL migration on WorkSamplingStudy table...');
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "WorkSamplingStudy" 
      ADD COLUMN IF NOT EXISTS "lockedDates" jsonb;
    `);
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "WorkSamplingStudy" 
      ADD COLUMN IF NOT EXISTS "lockedTimes" jsonb;
    `);
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "WorkSamplingStudy" 
      ADD COLUMN IF NOT EXISTS "studyMonths" jsonb;
    `);
    
    console.log('Migration completed successfully.');
    return NextResponse.json({ success: true, message: 'Migration completed successfully' });
  } catch (error: any) {
    console.error('Migration failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
