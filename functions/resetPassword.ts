import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { revokeSessionsByUserId } from './db.ts';

/**
 * Validate the reset token and set the new password for the user
 * NOTE: This example updates the User entity's `password` field directly. If your
 * auth provider requires a specific API to change passwords, use that instead.
 */
Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const { email, token, password } = await req.json();
    if (!email || !token || !password) return Response.json({ error: 'Missing parameters' }, { status: 400 });

    const base44 = createClientFromRequest(req);

    // Find verification code
    const codes = await base44.asServiceRole.entities.VerificationCode.filter({ verified: false });
    const matched = codes.find(c => c.email.toLowerCase() === email.toLowerCase() && c.code === token);
    if (!matched) return Response.json({ error: 'Invalid or expired token' }, { status: 400 });

    // Check expiry
    if (new Date(matched.expires_at) < new Date()) {
      return Response.json({ error: 'Token expired' }, { status: 400 });
    }

    // Find user
    const users = await base44.asServiceRole.entities.User.filter({ email });
    if (!users || users.length === 0) return Response.json({ error: 'User not found' }, { status: 404 });

    const user = users[0];

    // Update password on user record. IMPORTANT: adjust to your auth provider if needed.
    await base44.asServiceRole.entities.User.update(user.id, { password });

    // Delete the code to prevent reuse
    await base44.asServiceRole.entities.VerificationCode.delete(matched.id);

    // Revoke all sessions for this user (force re-login)
    try {
      await revokeSessionsByUserId(user.id);
    } catch (e) {
      console.warn('Failed to revoke sessions on password reset (DB may not be configured)', e);
      try {
        const sessions = await base44.asServiceRole.entities.Session.filter({ user_id: user.id });
        for (const s of sessions) {
          await base44.asServiceRole.entities.Session.update(s.id, { revoked: true });
        }
      } catch (e2) {
        console.warn('Fallback revoke via base44 failed', e2);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('resetPassword error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
