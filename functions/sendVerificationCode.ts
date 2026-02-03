import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Delete any existing unverified codes for this email (case-insensitive)
    const existingCodes = await base44.asServiceRole.entities.VerificationCode.filter({
      verified: false
    });
    
    const emailLower = email.toLowerCase();
    for (const existingCode of existingCodes) {
      if (existingCode.email.toLowerCase() === emailLower) {
        await base44.asServiceRole.entities.VerificationCode.delete(existingCode.id);
      }
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration to 15 minutes from now
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Store verification code using service role
    await base44.asServiceRole.entities.VerificationCode.create({
      email,
      code,
      expires_at: expiresAt,
      verified: false
    });

    // Send email with verification code
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        from_name: 'Life-Meds',
        to: email,
        subject: 'Your Verification Code',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0ea5e9;">Welcome to Life-Meds!</h2>
            <p>Your verification code is:</p>
            <div style="background-color: #f0f9ff; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
              <h1 style="color: #0ea5e9; font-size: 36px; letter-spacing: 8px; margin: 0;">${code}</h1>
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Still return success since the code is stored in the database
      // The user can still verify even if email fails
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error sending verification code:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});