import { hash } from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';
import { createUser, findUserByEmail, createVerificationCode } from './db.ts';

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
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    const { email, password, name } = await req.json();
    if (!email || !password) return Response.json({ error: 'Missing parameters' }, { status: 400 });

    const existing = await findUserByEmail(email);
    if (existing) {
      return Response.json({ error: 'User already exists' }, { status: 409 });
    }

    const password_hash = await hash(password);
    await createUser({ email, password_hash, name, email_verified: false });

    // Generate verification code and email
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await createVerificationCode({ email, code, expires_at: expiresAt, verified: false });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width:600px;margin:0 auto;">
        <h2 style="color:#0ea5e9">Verify your email</h2>
        <p>Your verification code is:</p>
        <div style="background:#f0f9ff;padding:20px;text-align:center;border-radius:10px;margin:20px 0;">
          <h1 style="color:#0ea5e9;font-size:36px;letter-spacing:8px;margin:0;">${code}</h1>
        </div>
        <p>This code will expire in 15 minutes.</p>
      </div>
    `;

    try { await sendEmail(email, 'Your verification code', html); } catch (e) { console.warn('Failed to send verification email', e); }

    return Response.json({ success: true });
  } catch (error) {
    console.error('register error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});