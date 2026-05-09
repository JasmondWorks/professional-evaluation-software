import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const allUsers = await prisma.user.findMany()
  console.log(allUsers)
}

// --------------------------------------------------------------
//          ----------------- LOG IN ------------------
// --------------------------------------------------------------

export async function login(req: NextApiRequest, res: NextApiResponse) {
  const { username, password } = req.body
  let sID = Math.floor(Math.random())
  let userInDb = true

  main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

  if ( userInDb ) {
    // req.session.sID = sID;
    res.status(200).json({ message: 'Login successful!', data: { username, password } })
  } else {
    res.status(401).json({ message: 'Invalid credentials' })
  }
}

// --------------------------------------------------------------
//          ----------------- SIGN UP ------------------
// --------------------------------------------------------------

export async function signup(req: NextApiRequest, res: NextApiResponse) {
   const { username, password } = req.body
   let sID = Math.floor(Math.random())
   let go = 1
 
   
   if ( /* USER IN DATABASE */go ) {
     // req.session.sID = sID;
     res.status(200).json({ message: 'email already in use!' })
   } else {
     res.status(401).json({ message: 'Invalid credentials' })
   }
 }