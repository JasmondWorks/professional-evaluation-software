const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Read arguments or use defaults
  const org = process.argv[2] || "test org"; // using test org as it's the one in the user's screenshot
  const dept = process.argv[3] || "Music department";
  const numEntries = parseInt(process.argv[4]) || 15;

  console.log(`Seeding ${numEntries} entries for Org: '${org}', Dept: '${dept}'...`);


  for (let i = 1; i <= numEntries; i++) {
    const pesuser_name = `Test Employee ${i}_${Date.now()}`;
    
    // Create Appraisal
    await prisma.appraisal.create({
      data: {
        pesuser_name,
        org,
        dept,
        teaching_quality_evaluation: (Math.random() * 5).toFixed(2),
        research_quality_evaluation: (Math.random() * 5).toFixed(2),
        administrative_quality_evaluation: (Math.random() * 5).toFixed(2),
        community_quality_evaluation: (Math.random() * 5).toFixed(2),
        other_relevant_information: (Math.random() * 5).toFixed(2),
      }
    });

    // Create UserPerformance
    await prisma.userperformance.create({
      data: {
        pesuser_name,
        org,
        dept,
        competence: (Math.random() * 5).toFixed(2),
        integrity: (Math.random() * 5).toFixed(2),
        compatibility: (Math.random() * 5).toFixed(2),
        use_of_resources: (Math.random() * 5).toFixed(2),
      }
    });

    // Create Stress
    await prisma.stress.create({
      data: {
        pesuser_name,
        org,
        dept,
        stress_theme: Math.floor(Math.random() * 5) + 1,
        stress_feeling_frequency: Math.floor(Math.random() * 5) + 1,
      }
    });
  }

  console.log(`✅ Successfully seeded ${numEntries} users across appraisal, userperformance, and stress tables!`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
