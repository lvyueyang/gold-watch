import { NextRequest, NextResponse } from 'next/server';
import { verifySession, AUTH_COOKIE_NAME } from '@/lib/auth';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - api/public (public routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api/auth|api/public|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

function isProtectedRoute(path: string) {
  return path.startsWith('/admin') || path.startsWith('/api');
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 1. Check for session cookie
  const cookie = req.cookies.get(AUTH_COOKIE_NAME);
  let session = null;
  if (cookie) {
    session = await verifySession(cookie.value);
  }

  // 2. Handle /login route: Redirect to admin if already logged in
  if (path === '/login') {
    if (session) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.next();
  }

  // 3. Check if route requires protection
  if (!isProtectedRoute(path)) {
    return NextResponse.next();
  }

  // 4. If session valid, allow
  if (session) {
    return NextResponse.next();
  }

  // 5. Check for Basic Auth (fallback for API clients)
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ');
    if (scheme === 'Basic' && encoded) {
      try {
        const decoded = atob(encoded);
        const [username, password] = decoded.split(':');

        const expectedUser = process.env.ADMIN_USER;
        const expectedPass = process.env.ADMIN_PASS;

        let isValid = false;
        if (expectedUser && expectedPass) {
          isValid = username === expectedUser && password === expectedPass;
        } else if (process.env.NODE_ENV !== 'production') {
          isValid = username === 'admin' && password === 'password';
        }

        if (isValid) {
          return NextResponse.next();
        }
      } catch (e) {
        // ignore invalid base64
      }
    }
  }

  // 6. Handle unauthorized
  if (path.startsWith('/api')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } else {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', path);
    return NextResponse.redirect(url);
  }
}
