import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// CSRF token store (in production, use Redis or database)
const csrfTokenStore = new Map<string, { token: string; expires: number }>();

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // Max requests per window
  authWindowMs: 5 * 60 * 1000, // 5 minutes for auth endpoints
  authMaxRequests: 5, // Max auth attempts per window
};

/**
 * Rate limiting middleware
 */
function rateLimit(req: NextRequest, isAuthEndpoint: boolean = false): NextResponse | null {
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
  const key = `${ip}-${req.nextUrl.pathname}`;
  const now = Date.now();
  
  const config = isAuthEndpoint 
    ? { windowMs: RATE_LIMIT_CONFIG.authWindowMs, maxRequests: RATE_LIMIT_CONFIG.authMaxRequests }
    : { windowMs: RATE_LIMIT_CONFIG.windowMs, maxRequests: RATE_LIMIT_CONFIG.maxRequests };

  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return null;
  }

  if (record.count >= config.maxRequests) {
    // Rate limit exceeded
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  // Increment count
  record.count++;
  rateLimitStore.set(key, record);
  return null;
}

/**
 * JWT verification middleware
 */
function verifyJWT(token: string | null): { valid: boolean; payload?: any; error?: string } {
  if (!token) {
    return { valid: false, error: 'No token provided' };
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
    const payload = jwt.verify(token, secret);
    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: 'Invalid or expired token' };
  }
}

/**
 * CSRF token validation
 */
function validateCSRF(req: NextRequest): boolean {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return true;
  }

  const csrfToken = req.headers.get('x-csrf-token');
  const sessionId = req.cookies.get('session_id')?.value;

  if (!csrfToken || !sessionId) {
    return false;
  }

  const stored = csrfTokenStore.get(sessionId);
  if (!stored || stored.token !== csrfToken || Date.now() > stored.expires) {
    return false;
  }

  return true;
}

/**
 * Protected API routes that require authentication
 */
const protectedRoutes = [
  '/api/getGoals',
  '/api/addGoals',
  '/api/updateGoals',
  '/api/savePerformance',
  '/api/saveAppraisal',
  '/api/getEmployee',
  '/api/addEmployee',
  '/api/changePassword',
  '/api/getUserData',
  '/api/getUsers',
  '/api/addRoles',
  '/api/getRoles',
  '/api/saveStress',
  '/api/getStress',
  '/api/notifications',
  '/api/addFacility',
  '/api/getFacility',
];

/**
 * Auth endpoints that need stricter rate limiting
 */
const authEndpoints = [
  '/api/login',
  '/api/signup',
  '/api/resetPassword',
  '/api/changePassword',
];

/**
 * Public routes that don't need authentication
 */
const publicRoutes = [
  '/api/login',
  '/api/signup',
  '/api/resetPassword',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Files with extensions
  ) {
    return NextResponse.next();
  }

  // Apply rate limiting
  const isAuthEndpoint = authEndpoints.some(route => pathname.startsWith(route));
  const rateLimitResponse = rateLimit(request, isAuthEndpoint);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !isPublicRoute) {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    // Verify JWT
    const { valid, error } = verifyJWT(token);
    if (!valid) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  // CSRF validation for state-changing requests
  // Disabled by default - enable in production with proper CSRF token generation
  // if (!validateCSRF(request)) {
  //   return NextResponse.json(
  //     { error: 'Invalid CSRF token' },
  //     { status: 403 }
  //   );
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
