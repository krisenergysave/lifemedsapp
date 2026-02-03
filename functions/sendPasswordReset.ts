import { findUserByEmail, createVerificationCode } from './db.ts';

async function sendEmail(to, subject, html) {
  const sendGridKey = Deno.env.get('SENDGRID_API_KEY');
  if (!sendGridKey) {
    console.warn('SENDGRID_API_KEY not configured - logging email instead');
    console.log(`To: ${to}\nSubject: ${subject}\n${html}`);
    return;
  }

  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sendGridKey}`
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: Deno.env.get('EMAIL_FROM') || 'no-reply@life-meds.com', name: 'Life-Meds' },
      subject,
      content: [{ type: 'text/html', value: html }]
    })
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const { email } = await req.json();
    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Quietly return success if user doesn't exist (don't leak user existence)
    const users = await findUserByEmail(email);
    if (!users) {
      // Still behave as if we sent an email to prevent account fishing
      return Response.json({ success: true });
    }

    // Generate token
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await createVerificationCode({ email, code: token, expires_at: expiresAt, verified: false });

    // Send email with reset link
    try {
      const origin = req.headers.get('origin') || `https://${req.headers.get('host')}` || '';
      const resetUrl = `${origin}/ResetPassword?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">Reset your password</h2>
          <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
          <div style="margin: 24px 0;">
            <a href="${resetUrl}" style="background:#0ea5e9;color:#ffffff;padding:12px 18px;border-radius:8px;text-decoration:none;">Reset password</a>
          </div>
          <p>If you didn't request this, ignore this email.</p>
        </div>
      `;
      await sendEmail(email, 'Reset your Life-Meds password', html);
    } catch (sendErr) {
      console.error('Failed to send reset email:', sendErr);
      // Do not fail request — token is already stored and user can use it
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('sendPasswordReset error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
