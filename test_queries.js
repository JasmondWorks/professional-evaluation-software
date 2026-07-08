const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userOrg = "test org";
  
  const rawResult = await prisma.$queryRaw`
        SELECT dept, COUNT(*) AS total_unique_users
        FROM (
        SELECT DISTINCT dept, pesuser_name FROM appraisal WHERE org = ${userOrg}
        UNION
        SELECT DISTINCT dept, pesuser_name FROM stress WHERE org = ${userOrg}
        UNION
        SELECT DISTINCT dept, pesuser_name FROM userperformance WHERE org = ${userOrg}
        ) AS unique_users
        GROUP BY dept
  `;
  console.log("getDataEntry rawResult:", rawResult);

  const deptResult = await prisma.$queryRawUnsafe(`
            SELECT COUNT(DISTINCT dept) as count FROM (
                SELECT dept FROM appraisal WHERE org = $1
                UNION
                SELECT dept FROM userperformance WHERE org = $1
                UNION
                SELECT dept FROM stress WHERE org = $1
            ) AS all_depts
        `, userOrg);
  console.log("getStats deptResult:", deptResult);

  const pesuserNameResult = await prisma.$queryRawUnsafe(`
            SELECT COUNT(DISTINCT pesuser_name) as count FROM (
                SELECT pesuser_name FROM appraisal WHERE org = $1
                UNION
                SELECT pesuser_name FROM userperformance WHERE org = $1
                UNION
                SELECT pesuser_name FROM stress WHERE org = $1
            ) AS all_pesuser_names
        `, userOrg);
  console.log("getStats pesuserNameResult:", pesuserNameResult);
}
main().finally(() => prisma.$disconnect());
