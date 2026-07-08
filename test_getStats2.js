const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const userOrg = 'test org';

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
}
main().finally(() => prisma.$disconnect());
