import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { verify } from 'https://deno.land/x/djwt@v2.12/mod.ts';
import { findSessionByJti } from './db.ts';

/**
 * Returns the current user if a valid session cookie is present.
 * GET /api/session
 */
Deno.serve(async (req) => {
  try {
    if (req.method !== 'GET') return new Response('Method Not Allowed', { status: 405 });

    const cookieHeader = req.headers.get('cookie') || '';
    const cookie = Object.fromEntries(cookieHeader.split(';').map(s => s.split('=').map(p => p && p.trim())));
    const token = cookie['base44_access_token'];

    if (!token) return new Response(JSON.stringify({ authenticated: false }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    const sessionSecrets = (Deno.env.get('SESSION_SECRETS') || Deno.env.get('SESSION_SECRET') || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!sessionSecrets.length) return new Response(JSON.stringify({ authenticated: false }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    // Try verifying with known secrets (allows rotation)
    let payload;
    for (const sec of sessionSecrets) {
      try { payload = await verify(token, sec); break; } catch (e) { /* try next */ }
    }
    if (!payload) return new Response(JSON.stringify({ authenticated: false }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    const userId = payload.sub;
    const jti = payload.jti;

      const base44 = createClientFromRequest(req);

      // If using DB-backed sessions, verify it exists & is not revoked
      try {
        const s = await findSessionByJti(jti);
        if (s && s.revoked) {
          return new Response(JSON.stringify({ authenticated: false }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (s && s.expires_at && new Date(s.expires_at) < new Date()) {
          return new Response(JSON.stringify({ authenticated: false }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
      } catch (err) {
        console.warn('DB session check failed, falling back to token-only validation', err);
      }

      // Fetch user
      const users = await base44.asServiceRole.entities.User.filter({ id: userId });
      const user = users?.[0];
      if (!user) return new Response(JSON.stringify({ authenticated: false }), { status: 200, headers: { 'Content-Type': 'application/json' } });

      return new Response(JSON.stringify({ authenticated: true, user }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
      console.warn('Session verify failed', err);
      return new Response(JSON.stringify({ authenticated: false }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    console.error('getSessionUser error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});