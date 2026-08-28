import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if it's a protected route
  const isProtectedRoute = pathname.startsWith('/booking') || pathname.startsWith('/admin') || pathname.startsWith('/profile');
  
  // Allow access to login pages
  if (pathname === '/admin/login' || pathname === '/login') {
    return NextResponse.next();
  }

  if (isProtectedRoute) {
    const authCookie = request.cookies.get('driveease_auth');
    
    if (!authCookie) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/booking/:path*', '/admin/:path*', '/profile/:path*'],
};
