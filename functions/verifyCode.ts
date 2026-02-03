import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, code } = await req.json();

    if (!email || !code) {
      return Response.json({ error: 'Email and code are required' }, { status: 400 });
    }

    // Find verification code using service role (case-insensitive email match)
    const allCodes = await base44.asServiceRole.entities.VerificationCode.filter({
      verified: false
    });
    
    // Filter by email (case-insensitive) and code
    const codes = allCodes.filter(c => 
      c.email.toLowerCase() === email.toLowerCase() && 
      c.code === code
    );

    if (codes.length === 0) {
      return Response.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    const verificationCode = codes[0];

    // Check if code is expired
    if (new Date(verificationCode.expires_at) < new Date()) {
      return Response.json({ error: 'Verification code has expired' }, { status: 400 });
    }

    // Mark code as verified
    await base44.asServiceRole.entities.VerificationCode.update(verificationCode.id, {
      verified: true
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error verifying code:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});