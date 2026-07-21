import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { SESSION_COOKIE, verifySessionToken } from './lib/auth';

const intlMiddleware = createMiddleware(routing);

/**
 * Two concerns share one middleware:
 *  - /admin/**  → session check, never locale-prefixed
 *  - everything else → next-intl locale routing
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    // The login page must stay reachable without a session.
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const session = await verifySessionToken(
      request.cookies.get(SESSION_COOKIE)?.value,
    );

    if (!session) {
      const loginUrl = new URL('/admin/login', request.url);
      // Send the user back where they were trying to go after logging in.
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Locale routing: everything except API, Next internals and static files.
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Admin session check.
    '/admin/:path*',
  ],
};
