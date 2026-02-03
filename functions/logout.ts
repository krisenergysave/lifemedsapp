import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { verify } from 'https://deno.land/x/djwt@v2.12/mod.ts';
import { revokeSessionByJti } from './db.ts';

/**
 * POST /api/logout -- clears the session cookie and marks session revoked
 */
Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    const cookieHeader = req.headers.get('cookie') || '';
    const cookie = Object.fromEntries(cookieHeader.split(';').map(s => s.split('=').map(p => p && p.trim())));
    const token = cookie['base44_access_token'];

    if (!token) {
      // Clear cookies anyway
      const headers = new Headers();
      headers.append('Set-Cookie', 'base44_access_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');
      headers.append('Set-Cookie', 'XSRF-TOKEN=; Path=/; Max-Age=0; SameSite=Strict');
      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    }

    const sessionSecrets = (Deno.env.get('SESSION_SECRETS') || Deno.env.get('SESSION_SECRET') || '').split(',').map(s => s.trim()).filter(Boolean);
    if (sessionSecrets.length) {
      try {
        let payload;
        for (const sec of sessionSecrets) {
          try { payload = await verify(token, sec); break; } catch (e) { /* try next */ }
        }
        if (payload) {
          const jti = payload.jti;
          try {
            await revokeSessionByJti(jti);
          } catch (e) {
            console.warn('Failed to revoke session in DB, attempting base44 entity update', e);
            const base44 = createClientFromRequest(req);
            try {
              const sessions = await base44.asServiceRole.entities.Session.filter({ jti });
              const s = sessions?.[0];
              if (s) await base44.asServiceRole.entities.Session.update(s.id, { revoked: true });
            } catch (e2) {
              // ignore
            }
          }
        }
      } catch (e) {
        // ignore verification errors
      }
    }

    const headers = new Headers();
    headers.append('Set-Cookie', 'base44_access_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');
    headers.append('Set-Cookie', 'XSRF-TOKEN=; Path=/; Max-Age=0; SameSite=Strict');

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (error) {
    console.error('logout error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});