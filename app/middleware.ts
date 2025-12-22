import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Allow root path to handle its own redirect logic
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Check for refresh token in cookies (this is persisted in localStorage, but we check cookies for httpOnly cookies)
  // Note: Access token is stored in memory, so we can't check it server-side
  // We'll rely on client-side auth checks via route guards
  // Only check for refresh token cookie if it exists (for httpOnly cookie strategy)
  const refreshTokenCookie = request.cookies.get('refreshToken');
  const authHeader = request.headers.get('authorization');

  // If accessing a protected route, let client-side handle auth checks
  // Don't redirect server-side as access token is in memory
  // Client-side route guards will handle redirects if needed
  
  // Only redirect to login if explicitly accessing login page with valid auth
  // (This prevents authenticated users from seeing login page)
  if (pathname === '/login' && (refreshTokenCookie || authHeader)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // For all other routes, let client-side handle authentication
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
