import { NextRequest, NextResponse } from 'next/server';
import { verifyTokenSafe } from '@/lib/server-auth';

/**
 * Protected route patterns:
 * - /admin/*        → redirect to /admin/login if unauthenticated
 * - /api/clients/*  → return 401 JSON if unauthenticated
 * - /api/forms/*    → return 401 JSON if unauthenticated
 * - /api/auth/profile       → return 401 JSON if unauthenticated
 * - /api/auth/change-password → return 401 JSON if unauthenticated
 *
 * Public API routes (no middleware auth check – the route handler itself
 * is public or does its own auth):
 * - POST /api/clients          (client register)
 * - POST /api/clients/login    (client login)
 * - GET  /api/clients/verify-email/*
 * - POST /api/clients/forgot-password
 * - POST /api/clients/reset-password/*
 */

// Admin pages that do NOT require authentication
const ADMIN_PUBLIC_PATHS = [
  '/admin/login',
  '/admin/verify-email',
  '/admin/forgot-password',
];

// API routes that are intentionally public — middleware must NOT block them
const API_PUBLIC_ROUTES: { method: string; path: string }[] = [
  { method: 'POST', path: '/api/clients' },                         // register
  { method: 'POST', path: '/api/clients/login' },                   // login
  { method: 'GET',  path: '/api/clients/auth/verify-email' },       // email verification
  { method: 'POST', path: '/api/clients/auth/forgot-password' },    // forgot password
  { method: 'POST', path: '/api/clients/auth/reset-password' },     // reset password
];

function isAdminPage(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

function isAdminPublicPage(pathname: string): boolean {
  return ADMIN_PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function isPublicApiRoute(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  return API_PUBLIC_ROUTES.some(
    (r) => r.method === request.method && pathname === r.path,
  );
}

function isProtectedApiRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/api/clients') ||
    pathname.startsWith('/api/forms') ||
    pathname === '/api/auth/profile' ||
    pathname === '/api/auth/change-password'
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Protected API routes ────────────────────────────────────────────────
  if (isProtectedApiRoute(pathname)) {
    // Let public API routes through before checking the token
    if (isPublicApiRoute(request)) {
      return NextResponse.next();
    }

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized: missing token' },
        { status: 401 }
      );
    }

    const payload = await verifyTokenSafe(token);
    if (!payload) {
      return NextResponse.json(
        { message: 'Unauthorized: invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // ── Admin page routes ───────────────────────────────────────────────────
  if (isAdminPage(pathname)) {
    // Let public admin pages through (login, verify-email, forgot-password)
    if (isAdminPublicPage(pathname)) {
      return NextResponse.next();
    }

    // Try cookie-based token first, then Authorization header
    const cookieToken = request.cookies.get('admin_token')?.value;
    const authHeader = request.headers.get('Authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = cookieToken ?? headerToken;

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyTokenSafe(token);
    if (!payload) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Only admins may access admin pages
    if (payload.type !== 'admin') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Admin pages
    '/admin/:path*',
    // Protected API routes
    '/api/clients/:path*',
    '/api/forms/:path*',
    '/api/auth/profile',
    '/api/auth/change-password',
  ],
};
