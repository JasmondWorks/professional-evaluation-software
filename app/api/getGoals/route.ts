import { NextRequest, NextResponse } from 'next/server'
import prisma from '../prisma.dev'
import jwt from 'jsonwebtoken'

type Goals = {
  id: number
  name: string
  description: string
  status: string
  day_started: string
  due_date: string
  user_id: string
}

async function getData( user: string | null ) {
  if (!user) return []
  console.log(user)
  const goals: Goals[] = await prisma.$queryRawUnsafe('SELECT * FROM goals WHERE user_id = $1', user.toString())
  
  await prisma.$disconnect()
  return goals
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let payload = body;
    
    // Check if token wrapper exists
    if (body && typeof body === 'object' && 'token' in body && typeof body.token === 'string') {
      const decoded = jwt.decode(body.token);
      if (decoded && typeof decoded === 'object') {
        payload = decoded;
      }
    }

    let userIdentifier: string | null = null;
    if (payload && typeof payload === 'object') {
      // Direct properties
      if ('userID' in payload && payload.userID !== undefined && payload.userID !== null) {
        userIdentifier = String(payload.userID);
      } else if ('id' in payload && payload.id !== undefined && payload.id !== null) {
        userIdentifier = String(payload.id);
      } else if ('name' in payload && payload.name !== undefined && payload.name !== null) {
        userIdentifier = String(payload.name);
      } else if ('email' in payload && payload.email !== undefined && payload.email !== null) {
        userIdentifier = String(payload.email);
      }

      // Check sub claim
      if (!userIdentifier && 'sub' in payload) {
        const sub = payload.sub;
        if (typeof sub === 'object' && sub !== null) {
          if ('user_id' in sub && (sub as any).user_id !== undefined && (sub as any).user_id !== null) {
            userIdentifier = String((sub as any).user_id);
          } else if ('name' in sub && (sub as any).name !== undefined && (sub as any).name !== null) {
            userIdentifier = String((sub as any).name);
          } else if ('email' in sub && (sub as any).email !== undefined && (sub as any).email !== null) {
            userIdentifier = String((sub as any).email);
          }
        } else if (typeof sub === 'string') {
          userIdentifier = sub;
        }
      }
    }

    if (!userIdentifier) {
      console.warn("Could not find user identifier in token:", body);
    }

    const goals = await getData(userIdentifier);
    return NextResponse.json(goals);
  } catch(err) {
    console.error(err);
    return NextResponse.json([]);
  }
}