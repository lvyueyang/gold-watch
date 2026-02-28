import { createServerFn } from '@tanstack/react-start';
import { verifyCredentials, signSession, verifySession } from '../lib/auth';
import { AUTH_COOKIE_NAME } from '../lib/constants';
import { setCookie, getCookie } from 'vinxi/http';

export const checkAuthFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const token = getCookie(AUTH_COOKIE_NAME);
    if (!token) return { isAuthenticated: false };
    const session = await verifySession(token);
    return { isAuthenticated: !!session, user: session };
  } catch (e) {
    return { isAuthenticated: false };
  }
});

export const loginFn = createServerFn({ method: 'POST' })
  .handler(async (ctx: any) => {
    const data = ctx.data;
    if (!(await verifyCredentials(data.username, data.password))) {
      throw new Error('Invalid credentials');
    }

    const token = await signSession({ username: data.username });

    setCookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true };
  });
