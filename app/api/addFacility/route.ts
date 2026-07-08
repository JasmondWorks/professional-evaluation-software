import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import { jwtDecode } from 'jwt-decode'
import nodemailer from "nodemailer";

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

  let org;
  try {
    const decoded: any = jwtDecode(token);
    org = decoded?.org;
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { data } = await request.json();
  console.log(data, org)

  if (data) {
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
        from: `"Super Admin" <${process.env.EMAIL_USER}>`,
        to: adminUser?.email,
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