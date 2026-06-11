import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import jwt from 'jsonwebtoken'

type user = {
  id:number
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
}

async function getUser(userNameOrEmail: string | null, userId: number | null) {
  if (!userNameOrEmail && userId === null) {
    return null
  }

  let query = 'SELECT * FROM pesuser WHERE 1=0'
  const params: any[] = []

  if (userNameOrEmail) {
    params.push(userNameOrEmail)
    query += ` OR name = $${params.length} OR email = $${params.length}`
  }

  if (userId !== null && !isNaN(userId)) {
    params.push(userId)
    query += ` OR id = $${params.length}`
  }

  try {
    const users: user[] = await prisma.$queryRawUnsafe(query, ...params)
    await prisma.$disconnect()
    return users[0] || null
  } catch (err) {
    console.error('Error fetching user in getUser:', err)
    await prisma.$disconnect()
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ data: ['no data'] })
    }

    const decoded = jwt.decode(token);
    console.log('Decoded token payload:', decoded);

    let identifier: string | null = null;
    let userId: number | null = null;

    if (decoded && typeof decoded === 'object') {
      // Direct fields
      if ('name' in decoded && typeof decoded.name === 'string') {
        identifier = decoded.name;
      } else if ('email' in decoded && typeof decoded.email === 'string') {
        identifier = decoded.email;
      }

      if ('userID' in decoded && (typeof decoded.userID === 'number' || typeof decoded.userID === 'string')) {
        userId = Number(decoded.userID);
      } else if ('id' in decoded && (typeof decoded.id === 'number' || typeof decoded.id === 'string')) {
        userId = Number(decoded.id);
      }

      // Check nested "sub" claim
      if ('sub' in decoded) {
        const sub = decoded.sub;
        if (typeof sub === 'object' && sub !== null) {
          if ('name' in sub && typeof (sub as any).name === 'string') {
            identifier = (sub as any).name;
          } else if ('email' in sub && typeof (sub as any).email === 'string') {
            identifier = (sub as any).email;
          } else if ('user_id' in sub && (typeof (sub as any).user_id === 'number' || typeof (sub as any).user_id === 'string')) {
            const subUserId = Number((sub as any).user_id);
            if (!isNaN(subUserId)) {
              userId = subUserId;
            } else if (typeof (sub as any).user_id === 'string') {
              // If it's a UUID string, we can try matching it as a general identifier
              identifier = (sub as any).user_id;
            }
          }
        } else if (typeof sub === 'string') {
          identifier = sub;
        }
      }
    }

    const userInfo = await getUser(identifier, userId)
    console.log('userInfo:', userInfo)

    if (!userInfo) {
      return NextResponse.json(null)
    }
    
    return NextResponse.json(userInfo)

  } catch(err) {
    console.error(err)
    return NextResponse.json({ data: ['no data'] })
  }    
}