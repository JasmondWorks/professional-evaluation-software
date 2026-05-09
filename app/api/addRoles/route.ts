import { NextResponse } from 'next/server'
import prisma from '../prisma.dev'


type reqInfo = {
    role_name: string
    description: string
    org: string
    manage_user: string
    access_em: string
    ae_all: string
    ae_sub: string
    ae_sel: string
    define_performance: string
    dp_all: string
    dp_sub: string
    dp_sel: string
    access_hierachy: string
    manage_review: string
    mr_all: string
    mr_sub: string
    mr_sel: string
}


async function addUser(info: reqInfo) {
    const { 
        role_name,
        description,
        org,
        manage_user, 
        access_em, 
        ae_all, 
        ae_sub, 
        ae_sel, 
        define_performance, 
        dp_all, 
        dp_sub, 
        dp_sel, 
        access_hierachy, 
        manage_review, 
        mr_all, 
        mr_sub, 
        mr_sel } = info
     
    try {
        await prisma.$queryRaw`
            INSERT INTO roles (name, assigned, org)
            VALUES (${role_name}, ${ 1 }, ${org});
        `

        await prisma.$queryRaw`
            INSERT INTO permission (manage_user, access_em, ae_all, ae_sub, ae_sel, define_performance, dp_all, dp_sub, dp_sel, access_hierachy, manage_review, mr_all, mr_sub, mr_sel, user_id)
            VALUES (${manage_user}, ${access_em}, ${ ae_all }, ${ae_sub}, ${ae_sel}, ${define_performance}, ${dp_all}, ${ dp_sub }, ${ dp_sel }, ${access_hierachy}, ${ manage_review }, ${mr_all}, ${mr_sub}, ${mr_sel}, ${org});
        `

        await prisma.$disconnect()
        return `success`
    } catch(error) {
        return error
    }
}

export async function POST(req: Request) {
  const reqInfo = await req.json()
  
   try {
      let data = await addUser(reqInfo)
      console.log(data);
      if (data == 'success') {
        return NextResponse.json({ message: 'added employee successfully!', status: 200 })      
      } else {
        return NextResponse.json({ message: 'There was a problem', status: 500})
      }
   } catch (err) {
      console.error(err)
      return NextResponse.json({ message: 'Invalid credentials'})
   }
}
