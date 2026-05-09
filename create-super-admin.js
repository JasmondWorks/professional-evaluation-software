const readline = require('readline').promises;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const r1 = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function createAdmin() {
    const name = await r1.question('Enter firstname: ');
    const email = await r1.question('Enter email: ');
    const password = await r1.question('Enter password: ', { hideEchoBack: true });
    const confirmPassword = await r1.question('Confirm password: ', { hideEchoBack: true });

    if (!name || !email || !password) {
        console.log("All fields required");
        process.exit(1);
    }

    if (password !== confirmPassword) {
        console.log('Passwords do not match');
        process.exit(1);
    }


    const user = await prisma.$queryRaw`
        INSERT INTO pesuser (email, name, password, role)
        VALUES (${email}, ${name}, ${password}, 'super-admin')
        RETURNING id, email, name, role;
    `;

    console.log("✅ Super admin created:", user)[0];

    await r1.close();
    await prisma.$disconnect();
}

createAdmin();