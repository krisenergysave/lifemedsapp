import { compare } from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';
import { findUserByEmail, createSession } from './db.ts';
import { create, getNumericDate } from 'https://deno.land/x/djwt@v2.12/mod.ts';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    const { email, password } = await req.json();
    if (!email || !password) return Response.json({ error: 'Missing parameters' }, { status: 400 });

    const user = await findUserByEmail(email);
    if (!user) return Response.json({ error: 'Invalid credentials' }, { status: 401 });

    if (!user.password_hash) {
      return Response.json({ error: 'No password set for this account. Use Google sign-in.' }, { status: 400 });
    }

    const ok = await compare(password, user.password_hash);
    if (!ok) return Response.json({ error: 'Invalid credentials' }, { status: 401 });

    // If 2FA/TOTP is enabled, tell client to go to Verify2FA
    if (user.two_factor_enabled) {
      return Response.json({ requires2FA: true, redirect: 'Verify2FA' });
    }

    const sessionSecret = Deno.env.get('SESSION_SECRET');
    if (!sessionSecret) return Response.json({ error: 'Server not configured' }, { status: 500 });

    const jti = crypto.randomUUID();
    const expiresInSeconds = Number(Deno.env.get('SESSION_MAX_AGE_SECONDS') || 60 * 60 * 24);
    try {
      const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
      await createSession({ user_id: user.id, jti, xsrf_token: null, expires_at: expiresAt, user_agent: req.headers.get('user-agent') || null, ip: req.headers.get('x-forwarded-for') || null });
    } catch (e) {
      console.warn('DB session create failed', e);
    }

    const jwt = await create({ alg: 'HS256', typ: 'JWT' }, { sub: user.id, email, jti, exp: getNumericDate(expiresInSeconds) }, sessionSecret);

    const xsrf = crypto.randomUUID();
    try {
      // store xsrf on DB session
    } catch (e) {}

    const secureFlag = (Deno.env.get('NODE_ENV') === 'production') ? 'Secure; ' : '';
    const sessionCookie = `base44_access_token=${jwt}; HttpOnly; Path=/; Max-Age=${expiresInSeconds}; SameSite=Strict; ${secureFlag}`;
    const xsrfCookie = `XSRF-TOKEN=${xsrf}; Path=/; Max-Age=${expiresInSeconds}; SameSite=Strict; ${secureFlag}`;

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Set-Cookie', sessionCookie);
    headers.append('Set-Cookie', xsrfCookie);

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (error) {
    console.error('login error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});