import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Simple TOTP secret generation (32 characters, base32 encoded)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Generate QR Code URL for Google Authenticator
    const appName = 'LifeMeds';
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=otpauth://totp/${appName}:${user.email}?secret=${secret}&issuer=${appName}`;

    return Response.json({
      secret,
      qrCode: qrCodeUrl,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});