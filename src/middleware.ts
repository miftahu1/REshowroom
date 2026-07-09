import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // If the user is trying to access the admin page and doesn't have a valid session, redirect to the login page.
  if (pathname.startsWith('/admin') && !req.cookies.has('admin-session')) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  // If the user is on the login page and has a valid session, redirect to the admin page.
  if (pathname === '/admin/login' && req.cookies.has('admin-session')) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
}
