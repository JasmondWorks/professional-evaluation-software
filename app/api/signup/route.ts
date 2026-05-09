import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import prisma from '../prisma.dev'
import { randomUUID } from "crypto";
import bcrypt from 'bcryptjs';

const reference = `PES_${randomUUID()}`;

type reqInfo = {
  name: string
  org: string
  email: string
  password: string
  type: string
  plan: string
  planCode: string
  category: string
  logo: string
}

type user = {
  id: number
  name: string
  email: string 
  password: string
  gsm: string
  role: string
  address: string
  faculty_college: string
  dob: string
  doa: string
  poa : string
  doc : string
  post : string
  dopp: string
  level: string
  image : string
  org : string
  dept : string
  category : string
  plan : string
}

const amounts = {
  PLN_w4hf2tk7k3mu66a: {code: 'basic', amount: 100},
  PLN_pl6nmfsedqvm0oa: {code:'standard', amount: 200},
  PLN_bquiv8u3t2otwuh: {code:'premium', amount: 300}
}

type planCodes = keyof typeof amounts

async function addToDb(info: reqInfo) {
  const { name, email, password, type, category, plan, planCode, org, logo } = info;
  
  // SECURE: Hash the password before sending to DB
  // This is compatible with raw queries and critical for security
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const planDetails = amounts[planCode as keyof typeof amounts] || amounts['PLN_w4hf2tk7k3mu66a'];
  const amount = planDetails.amount;

  // We use a transaction to ensure all raw queries run safely together
  return await prisma.$transaction(async (tx: any) => {

    // --- YOUR COMMENTED SECTION (PRESERVED) ---
    // await prisma.$queryRaw`INSERT INTO pesuser (name, email, password, gsm, role, faculty_college, dob, doa, poa, doc, post, dopp, level, image, org) VALUES( ${name}, ${email}, ${password}, null, 'admin', null, null, null, null, null, null, null, null, null, ${org} ); `
    // await prisma.$queryRaw`INSERT INTO subscriptions_info (pesuser_email, pesuser_name, org, plan_code, plan_name, reference, status, amount, paid_at, created_at) VALUES ( ${email}, ${name}, ${org}, ${planCode}, ${plan}, null, "success", ${amount}, null, null)`
    //  insert into org;
    // await prisma.$queryRaw`INSERT INTO pesuser (name, email, password, gsm, role, faculty_college, dob, doa, poa, doc, post, dopp, level, image, org, category, plan) VALUES( ${name}, ${email}, ${password}, null, ${type}, null, null, null, null, null, null, null, null, ${logo}, ${org}, ${category}, ${plan}); `
    // await prisma.$queryRaw`INSERT INTO subscriptions_info (pesuser_email, pesuser_name, org, plan_code, plan_name, reference, status, amount, paid_at, created_at) VALUES ( ${email}, ${name}, ${org}, ${planCode}, ${plan}, null, "success", ${amount}, null, null)`
    //  insert into org;
    //  id | name | category | plan | created_at | updated_at
    // ----+------+----------+------+------------+------------

    // Create org (Using raw SQL)
    // ON CONFLICT DO NOTHING handles if the org already exists
    await tx.$queryRaw`
      INSERT INTO org (name, category, plan, created_at, updated_at, maintenance_model)
      VALUES (${org}, ${category}, ${plan}, NOW(), NOW(), ${category == "academic"? true : false})
      ON CONFLICT (name) DO NOTHING
    `;

    // Create user (Using raw SQL)
    // Note: We use ${hashedPassword} instead of ${password} here
    await tx.$queryRaw`
      INSERT INTO pesuser (
        name, email, password, gsm, role,
        faculty_college, dob, doa, poa, doc,
        post, dopp, level, image, org, category, plan
      )
      VALUES (
        ${name}, ${email}, ${hashedPassword}, null, ${type || 'admin'},
        null, null, null, null, null,
        null, null, null, ${logo}, ${org}, ${category}, ${plan}
      )
    `;

    // Create subscription (Using raw SQL)
    await tx.$queryRaw`
      INSERT INTO subscriptions_info (
        pesuser_email, pesuser_name, org,
        plan_code, plan_name, reference,
        status, amount, paid_at, created_at, expires_at
      )
      VALUES (
        ${email}, ${name}, ${org},
        ${planCode}, ${plan}, ${reference},
        'success', ${amount}, NOW(), NOW(), NOW() + INTERVAL '1 year'
      )
    `;

    // Fetch and return the new user (Using raw SQL)
    const users = await tx.$queryRaw<user[]>`
      SELECT * FROM pesuser WHERE email = ${email} LIMIT 1
    `;

    const m_model = await tx.$queryRaw<user[]>`
      SELECT maintenance_model FROM org WHERE name = ${org} LIMIT 1
    `;
    

    return {users, m_model};
  });
}


export async function GET() {
  return NextResponse.json({ name: 'successful!', data: 'true' })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, org, email, password, type, category, plan, planCode, logo } = body
  console.log(email, password)
  
  try {
    // Check if user exists first to fail fast
    const existing = await prisma.$queryRaw<user[]>`SELECT id FROM pesuser WHERE email = ${email}`;
    if (existing.length > 0) {
        return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    let data = await addToDb({ name, email, password, type, category, plan, planCode, org, logo })
    console.log(data);
    
    if (data.users.length > 0) {
      const user = data.users[0];
      const m_model = data.m_model[0];
      
      const token = jwt.sign( { 
        userID: user.id.toString(), // Convert BigInt to string safely
        name: user.name, 
        role: user.role, 
        org: user.org, 
        email: user.email,
        logo: user.image,
        productCategory: user.category,
        productPlan: user.plan,
        maintenance_model: m_model.maintenance_model
      }, 'oti');
      
      console.log(token, 'before send', user.name)
      return NextResponse.json({ message: 'Login successful!', token: token, status: 200 })      
    } else {
      return NextResponse.json({ message: 'Invalid credentials', status: 500})
    }
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ message: err.message || 'Server Error' }, { status: 500 })
  }
}