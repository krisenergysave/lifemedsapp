import { findUserByEmail } from './db.ts';

function base32Decode(str) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const bytes = [];
  
  for (let i = 0; i < str.length; i++) {
    const idx = alphabet.indexOf(str[i].toUpperCase());
    if (idx === -1) throw new Error('Invalid base32 character');
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >> bits) & 0xFF);
    }
  }
  
  return new Uint8Array(bytes);
}

async function generateOTPHash(secret, counter) {
  const secretBytes = base32Decode(secret);
  
  const counterBytes = new Uint8Array(8);
  const view = new DataView(counterBytes.buffer);
  view.setBigUint64(0, BigInt(counter), false);
  
  const key = await crypto.subtle.importKey('raw', secretBytes, { hash: 'SHA-1', name: 'HMAC' }, false, ['sign']);
  const hash = await crypto.subtle.sign('HMAC', key, counterBytes);
  return new Uint8Array(hash);
}

async function generateOTP(hash) {
  const offset = hash[hash.length - 1] & 0xf;
  const code = ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);
  
  return String(code % 1000000).padStart(6, '0');
}

async function verifyTOTPAsync(secret, code, window = 1) {
  const time = Math.floor(Date.now() / 1000 / 30);
  
  for (let i = -window; i <= window; i++) {
    const counter = time + i;
    const hash = await generateOTPHash(secret, counter);
    const otp = await generateOTP(hash);
    if (otp === code) {
      return true;
    }
  }
  return false;
}

Deno.serve(async (req) => {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return Response.json({ error: 'Missing email or code' }, { status: 400 });
    }

    // Fetch user by email
    const user = await findUserByEmail(email);

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.two_factor_enabled || !user.totp_secret) {
      return Response.json({ error: '2FA not enabled for this user' }, { status: 400 });
    }

    // Verify TOTP code
    const isValid = await verifyTOTPAsync(user.totp_secret, code);

    return Response.json({ valid: isValid });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});