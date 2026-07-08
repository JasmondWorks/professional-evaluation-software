import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

/**
 * JWT Payload Interface
 */
export interface JWTPayload {
  userID: string | number;
  name: string;
  role: string;
  org: string;
  email: string;
  logo?: string;
  dept?: string;
  productCategory?: string;
  productPlan?: string;
  maintenance_model?: boolean;
  iat?: number;
  exp?: number;
}

/**
 * Get JWT secret from environment
 */
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'fallback-secret-change-in-production') {
    console.warn('⚠️  WARNING: Using fallback JWT secret. Set JWT_SECRET in production!');
  }
  return secret || 'fallback-secret-change-in-production';
}

/**
 * Sign a JWT token
 */
export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresIn: any = '7d'): string {
  return jwt.sign(payload as object, getJWTSecret(), { expiresIn });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, getJWTSecret()) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Decode JWT without verification (use only for non-sensitive operations)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT decode failed:', error);
    return null;
  }
}

/**
 * Extract and verify JWT from request headers
 */
export function extractAndVerifyToken(request: NextRequest): {
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
} {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return { valid: false, error: 'No authorization header' };
  }

  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return { valid: false, error: 'No token provided' };
  }

  const payload = verifyToken(token);
  
  if (!payload) {
    return { valid: false, error: 'Invalid or expired token' };
  }

  return { valid: true, payload };
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded || !decoded.exp) {
      return true;
    }
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

/**
 * Refresh token (generate new token with same payload)
 */
export function refreshToken(oldToken: string): string | null {
  const payload = verifyToken(oldToken);
  if (!payload) {
    return null;
  }

  // Remove iat and exp from payload
  const { iat, exp, ...rest } = payload;
  
  return signToken(rest);
}
