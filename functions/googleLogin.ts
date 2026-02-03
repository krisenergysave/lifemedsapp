import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { create, getNumericDate } from 'https://deno.land/x/djwt@v2.12/mod.ts';
import { createSession } from './db.ts';

/**
 * Example function to verify Google ID Token, find/create a user, and create
 * a server-side session by setting a secure HTTP-only cookie (signed JWT).
 *
 * Env vars required:
 * - SESSION_SECRET (a long random string used to sign JWTs)
 * - GOOGLE_CLIENT_ID (to validate the token audience)
 */
Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const { token } = await req.json();
    if (!token) {
      return Response.json({ error: 'Missing token' }, { status: 400 });
    }

    // Verify token with Google
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
    if (!googleRes.ok) {
      const text = await googleRes.text();
      console.error('Google token verification failed:', text);
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    const payload = await googleRes.json();
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID') || Deno.env.get('VITE_GOOGLE_CLIENT_ID');
    if (!clientId) {
      console.warn('GOOGLE_CLIENT_ID not set in environment. Skipping aud check.');
    } else if (payload.aud !== clientId) {
      console.error('Token audience mismatch. Expected: ', clientId, 'Got: ', payload.aud);
      return Response.json({ error: 'Token audience mismatch' }, { status: 401 });
    }

    // Basic info from token
    const email = payload.email;
    const name = payload.name;
    const googleSub = payload.sub;

    const base44 = createClientFromRequest(req);

    // Try to find existing user
    const users = await base44.asServiceRole.entities.User.filter({ email });
    let user = users?.[0];

    if (!user) {
      // Create a new user record (adjust fields as needed)
      user = await base44.asServiceRole.entities.User.create({
        email,
        name,
        google_sub: googleSub,
        email_verified: true
      });
    }

    // Create a signed JWT for session with jti
    const sessionSecret = Deno.env.get('SESSION_SECRET');
    if (!sessionSecret) {
      console.error('SESSION_SECRET not set; cannot create session cookie');
      return Response.json({ error: 'Server not configured' }, { status: 500 });
    }

    const jti = crypto.randomUUID();
    const expiresInSeconds = Number(Deno.env.get('SESSION_MAX_AGE_SECONDS') || 60 * 60 * 24); // 1 day default

    // Create DB-backed session (revocable) using MySQL/MariaDB if configured
    const xsrf = crypto.randomUUID();
    try {
      const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
      await createSession({
        user_id: user.id,
        jti,
        xsrf_token: xsrf,
        expires_at: expiresAt,
        user_agent: req.headers.get('user-agent') || null,
        ip: req.headers.get('x-forwarded-for') || null
      });
    } catch (e) {
      console.warn('DB session create failed (DB may not be configured). Falling back to base44 entity approach.', e);
      try {
        await base44.asServiceRole.entities.Session.create({
          user_id: user.id,
          jti,
          user_agent: req.headers.get('user-agent') || null,
          ip: req.headers.get('x-forwarded-for') || null,
          expires_at: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
          revoked: false,
        });
        // Update xsrf on entity
        await base44.asServiceRole.entities.Session.filter({ jti }).then(async (rows) => {
          const s = rows?.[0];
          if (s) await base44.asServiceRole.entities.Session.update(s.id, { xsrf_token: xsrf });
        }).catch(() => {});
      } catch (e2) {
        console.warn('Fallback base44 session create also failed', e2);
      }
    }

    const jwt = await create({ alg: 'HS256', typ: 'JWT' }, { sub: user.id, email, jti, exp: getNumericDate(expiresInSeconds) }, sessionSecret);


    // Build cookies; set Secure only in production
    const secureFlag = (Deno.env.get('NODE_ENV') === 'production') ? 'Secure; ' : '';
    const sessionCookie = `base44_access_token=${jwt}; HttpOnly; Path=/; Max-Age=${expiresInSeconds}; SameSite=Strict; ${secureFlag}`;
    const xsrfCookie = `XSRF-TOKEN=${xsrf}; Path=/; Max-Age=${expiresInSeconds}; SameSite=Strict; ${secureFlag}`;

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Set-Cookie', sessionCookie);
    headers.append('Set-Cookie', xsrfCookie);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('googleLogin error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
