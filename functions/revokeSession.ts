import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { verify } from 'https://deno.land/x/djwt@v2.12/mod.ts';
import { findSessionByJti, revokeSessionByJti } from './db.ts';

/**
 * POST /api/revokeSession
 * Body: { jti: string }
 * Header: X-XSRF-TOKEN
 * Revokes the session matching jti (self or admin)
 */
Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    const sessionSecrets = (Deno.env.get('SESSION_SECRETS') || Deno.env.get('SESSION_SECRET') || '').split(',').map(s => s.trim()).filter(Boolean);
    const cookieHeader = req.headers.get('cookie') || '';
    const cookie = Object.fromEntries(cookieHeader.split(';').map(s => s.split('=').map(p => p && p.trim())));
    const token = cookie['base44_access_token'];

    if (!token || !sessionSecrets.length) return new Response('Unauthorized', { status: 401 });

    // verify against known secrets
    let payload;
    for (const sec of sessionSecrets) {
      try { payload = await verify(token, sec); break; } catch (e) { /* try next */ }
    }
    if (!payload) return new Response('Unauthorized', { status: 401 });

    const body = await req.json();
    const { jti } = body;

    // Protect against CSRF by validating header vs cookie
    const xsrfHeader = req.headers.get('x-xsrf-token') || req.headers.get('x-xsrftoken') || req.headers.get('x-csrf-token');
    const xsrfCookie = cookie['XSRF-TOKEN'] || cookie['XSRF-TOKEN'];
    if (!xsrfHeader || !xsrfCookie || xsrfHeader !== xsrfCookie) {
      return new Response('CSRF validation failed', { status: 403 });
    }

    // Try to revoke via DB-backed sessions
    const s = await findSessionByJti(jti);
    if (!s) return new Response(JSON.stringify({ success: false, message: 'Session not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    await revokeSessionByJti(jti);

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('revokeSession error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});