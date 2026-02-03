import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { verify } from 'https://deno.land/x/djwt@v2.12/mod.ts';
import { findUserById } from './db.ts';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'PATCH' && req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    const cookieHeader = req.headers.get('cookie') || '';
    const cookie = Object.fromEntries(cookieHeader.split(';').map(s => s.split('=').map(p => p && p.trim())));
    const token = cookie['base44_access_token'];
    const sessionSecrets = (Deno.env.get('SESSION_SECRETS') || Deno.env.get('SESSION_SECRET') || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!token || !sessionSecrets.length) return new Response('Unauthorized', { status: 401 });

    // verify
    let payload;
    for (const sec of sessionSecrets) {
      try { payload = await verify(token, sec); break; } catch (e) { }
    }
    if (!payload) return new Response('Unauthorized', { status: 401 });

    const userId = payload.sub;
    const user = await findUserById(userId);
    if (!user) return new Response('User not found', { status: 404 });

    const body = await req.json();
    const updateFields = {};
    if (body.full_name) updateFields.full_name = body.full_name;
    if (body.sex) updateFields.sex = body.sex;
    if (body.date_of_birth) updateFields.date_of_birth = body.date_of_birth;
    if (body.goals) updateFields.goals = body.goals;
    if (Object.keys(updateFields).length === 0) return new Response(JSON.stringify({ success: false, message: 'No fields to update' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    // Update via Base44 fallback if available
    try {
      const base44 = createClientFromRequest(req);
      await base44.asServiceRole.entities.User.filter({ id: userId }).then(async (rows) => {
        const u = rows?.[0];
        if (u) await base44.asServiceRole.entities.User.update(u.id, updateFields);
      }).catch(() => {});
    } catch (e) {
      // ignore
    }

    // Also update DB fields if present
    // We'll simply set columns if they exist in users table
    const updates = [];
    const params = [];
    if (updateFields.full_name) {
      updates.push('name = ?'); params.push(updateFields.full_name);
    }
    if (updateFields.sex) { updates.push('sex = ?'); params.push(updateFields.sex); }
    if (updateFields.date_of_birth) { updates.push('date_of_birth = ?'); params.push(updateFields.date_of_birth); }
    if (updateFields.goals) { updates.push('goals = ?'); params.push(JSON.stringify(updateFields.goals)); }

    if (updates.length > 0) {
      const mysql = await import('https://deno.land/x/mysql@v2.11.0/mod.ts');
      const host = Deno.env.get('DB_HOST');
      const user = Deno.env.get('DB_USER');
      const db = Deno.env.get('DB_NAME');
      const password = Deno.env.get('DB_PASSWORD');
      const port = Number(Deno.env.get('DB_PORT') || 3306);
      if (!host || !user || !db) return new Response(JSON.stringify({ success: false, message: 'DB not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      const client = await new mysql.Client().connect({ hostname: host, username: user, db, password, port });
      try {
        params.push(userId);
        const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`;
        await client.execute(sql, params);
      } finally {
        try { await client.close(); } catch (e) {}
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('updateMe error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});