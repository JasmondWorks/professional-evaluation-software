import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
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
   const params = [ entry.symbol, entry.description, entry.location, entry.id, entry.type, Number(entry.rating), entry.remark, org]
   const query = `
        INSERT INTO facilities (identification_symbol, description_of_facility, location, facility_register_id_no, type, priority_rating, remarks, org)
        VALUES ( $1, $2, $3, $4, $5, $6, $7, $8 );
   `
   await prisma.$queryRawUnsafe(query, ...params)

   await prisma.$disconnect()
   return { message: 'success', status: 200 }
}

export async function POST(request: NextRequest) {
  const {data, org} = await request.json();
  console.log(data, org)

  if (data) {
    try {
      let goals = await updateData(data, org)
      console.log(goals)
      const query1 = `select email from pesuser where org = $1 and role = $2`
      const userData: {email: string}[] = await prisma.$queryRawUnsafe(query1, org ,"admin")


      // ✅ Send email notification
      const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
         user: process.env.EMAIL_USER,
         pass: process.env.EMAIL_PASS,
      },
      });


      const mailOptions = {
      from: `"Super Admin" <${process.env.EMAIL_USER}>`,
      to: userData[0].email,
      subject: "New Entry added",
      text: `Hello,\n\nA user at ${org} has filled entries for maintenance models.\n\nBest,\nPES team`,
      };
      
      await transporter.sendMail(mailOptions);
      return NextResponse.json(goals)
  
   } catch(err) {
      console.error(err)
      return NextResponse.json([])
   }    
  }
  return NextResponse.redirect(new URL('/not-found', request.url))
}