import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ message: 'Token is required' }, { status: 400 });
    }

    const secret = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

    // Verify token
    const decoded = jwt.verify(token, secret) as { email: string };

    return NextResponse.json({ 
      message: 'Token valid', 
      email: decoded.email 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Token verification error:', error.message);
    
    // Distinguish between expired and invalid tokens for better UX
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json({ message: 'Invitation has expired' }, { status: 401 });
    }
    
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}
