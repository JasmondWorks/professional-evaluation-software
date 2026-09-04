// Reads the caller's token, so this can never be a static route: Next tries to
// prerender route handlers at build time, and reading headers there throws.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { verifyToken } from '@/app/api/_lib/authGuard'
import nodemailer from "nodemailer";
import { validateData, addFacilitySchema, formatZodErrors } from '@/app/lib/validation'

type Facility = {
   description: string,
   symbol: string,
   location: string,
   id: string,
   type: string,
   rating: number,
   remark: string,
}

async function updateData( entry: Facility, org:string ) {
   await prisma.facilities.create({
     data: {
       identification_symbol: entry.symbol,
       description_of_facility: entry.description,
       location: entry.location,
       facility_register_id_no: entry.id,
       type: entry.type,
       priority_rating: String(entry.rating),
       remarks: entry.remark,
       org,
     },
   })

   return { message: 'success', status: 200 }
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.split(" ")[1];
  
  if (!token) {
    return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  
  const org = payload.org as string;

  const { data } = await request.json();
  console.log(data, org)

  if (data) {
    // Add org to data so it can be validated by schema
    data.org = org;
    const validation = validateData(addFacilitySchema, data);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(validation.errors!) },
        { status: 400 }
      );
    }
    
    try {
      let goals = await updateData(data, org)
      console.log(goals)
      const adminUser = await prisma.pesuser.findFirst({
        where: { org, role: "admin" },
        select: { email: true },
      })


      // ✅ Send email notification
      try {
        const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
           user: process.env.EMAIL_USER,
           pass: process.env.EMAIL_PASS,
        },
        });


        const mailOptions = {
        from: `"Super Admin" <${process.env.EMAIL_USER || "noreply@example.com"}>`,
        to: adminUser?.email || process.env.EMAIL_USER || "admin@example.com",
        subject: "New Entry added",
        text: `Hello,\n\nA user at ${org} has filled entries for maintenance models.\n\nBest,\nPES team`,
        };
        
        await transporter.sendMail(mailOptions);
      } catch (emailErr) {
        console.error("Email sending failed:", emailErr);
      }
      return NextResponse.json(goals)
  
   } catch(err) {
      console.error(err)
      return NextResponse.json([])
   }    
  }
  return NextResponse.redirect(new URL('/not-found', request.url))
}