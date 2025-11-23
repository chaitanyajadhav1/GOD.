//middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// IMPORTANT: Do not verify JWTs in middleware. Next.js middleware runs on the Edge runtime
// where jsonwebtoken (Node APIs) is not supported. Token verification must happen inside
// the API route handlers (Node.js runtime).

// API Routes that require authentication (page routes are protected by ProtectedRoute component)
const protectedApiRoutes = [
  '/api/hospitals',
  '/api/profiles',
  '/api/family',
  '/api/medical-records',
  '/api/audit-logs',
  '/api/super-admin',
  '/api/hospital-admin',
  '/api/doctor',
];

// Role-based checks are enforced inside API route handlers

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Only protect API routes - page routes are protected by ProtectedRoute component
  const isProtectedApiRoute = protectedApiRoutes.some(route => 
    path.startsWith(route)
  );

  // Skip middleware for non-API routes (pages are protected client-side)
  if (!isProtectedApiRoute) {
    return NextResponse.next();
  }

  // Check for access token in Authorization header or cookie
  const authHeader = request.headers.get('authorization');
  const accessToken = authHeader?.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : authHeader || 
      request.cookies.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Access token required' },
      { status: 401 }
    );
  }

  // Do not perform JWT verification here; let route handlers validate tokens.
  // Simply proceed when token is present.
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    // Dashboard pages are protected by ProtectedRoute component, not middleware
  ],
};