const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const userOrg = 'test org';

    // Get unique pesuser_name count across all tables for this org
    const pesuser_nameResult = await prisma.$queryRawUnsafe(`
        SELECT COUNT(DISTINCT pesuser_name) as count FROM (
            SELECT pesuser_name FROM appraisal WHERE org = $1
            UNION
            SELECT pesuser_name FROM userperformance WHERE org = $1
            UNION
            SELECT pesuser_name FROM stress WHERE org = $1
        ) AS all_pesuser_names
    `, userOrg);
    console.log("pesuser_nameResult:", pesuser_nameResult);
    const pesuser_nameCount = Number(pesuser_nameResult[0]?.count) || 0;

    // Get unique dept count across all tables for this org
    const deptResult = await prisma.$queryRawUnsafe(`
        SELECT COUNT(DISTINCT dept) as count FROM (
            SELECT dept FROM appraisal WHERE org = $1
            UNION
            SELECT dept FROM userperformance WHERE org = $1
            UNION
            SELECT dept FROM stress WHERE org = $1
        ) AS all_depts
    `, userOrg);
    console.log("deptResult:", deptResult);
    const organizationCount = Number(deptResult[0]?.count) || 0;

    console.log({
        pesuser_nameCount,
        organizationCount,
    });
}
main().finally(() => prisma.$disconnect());
