import { createServerFn } from '@tanstack/react-start';
import { verifyCredentials, signSession, AUTH_COOKIE_NAME } from '../lib/auth';
import { setCookie } from 'vinxi/http';

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
