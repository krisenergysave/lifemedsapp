import { Client } from 'https://deno.land/x/mysql@v2.11.0/mod.ts';

function getDbConfig() {
  const host = Deno.env.get('DB_HOST');
  const port = Number(Deno.env.get('DB_PORT') || 3306);
  const user = Deno.env.get('DB_USER');
  const password = Deno.env.get('DB_PASSWORD');
  const db = Deno.env.get('DB_NAME');
  return { host, port, user, password, db };
}

async function connect() {
  const { host, port, user, password, db } = getDbConfig();
  if (!host || !user || !db) {
    throw new Error('Database not configured. Set DB_HOST, DB_USER, DB_NAME, DB_PASSWORD in env.');
  }
  const client = await new Client().connect({ hostname: host, username: user, db, password, port });
  return client;
}

export async function withDB(fn) {
  const client = await connect();
  try {
    return await fn(client);
  } finally {
    try { await client.close(); } catch (e) { console.warn('Failed to close DB connection', e); }
  }
}

export async function createSession({ user_id, jti, xsrf_token = null, expires_at = null, user_agent = null, ip = null }) {
  return withDB(async (client) => {
    const sql = `INSERT INTO sessions (user_id, jti, xsrf_token, expires_at, user_agent, ip, revoked, created_at) VALUES (?, ?, ?, ?, ?, ?, false, NOW())`;
    return client.execute(sql, [user_id, jti, xsrf_token, expires_at, user_agent, ip]);
  });
}

export async function findSessionByJti(jti) {
  return withDB(async (client) => {
    const rows = await client.query('SELECT * FROM sessions WHERE jti = ? LIMIT 1', [jti]);
    return rows?.[0] || null;
  });
}

export async function revokeSessionByJti(jti) {
  return withDB(async (client) => {
    return client.execute('UPDATE sessions SET revoked = true WHERE jti = ?', [jti]);
  });
}

export async function revokeSessionsByUserId(user_id) {
  return withDB(async (client) => {
    return client.execute('UPDATE sessions SET revoked = true WHERE user_id = ?', [user_id]);
  });
}

// User helpers
export async function createUser({ email, password_hash, name = null, email_verified = false, totp_secret = null, two_factor_enabled = false, google_sub = null }) {
  return withDB(async (client) => {
    const sql = `INSERT INTO users (email, password_hash, name, email_verified, totp_secret, two_factor_enabled, google_sub, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const res = await client.execute(sql, [email, password_hash, name, email_verified ? 1 : 0, totp_secret, two_factor_enabled ? 1 : 0, google_sub]);
    return res;
  });
}

export async function findUserByEmail(email) {
  return withDB(async (client) => {
    const rows = await client.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows?.[0] || null;
  });
}

export async function findUserById(id) {
  return withDB(async (client) => {
    const rows = await client.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    return rows?.[0] || null;
  });
}

export async function setUserPasswordHash(id, password_hash) {
  return withDB(async (client) => {
    return client.execute('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [password_hash, id]);
  });
}

// Verification codes (used for signup verification and password reset)
export async function createVerificationCode({ email, code, expires_at, verified = false }) {
  return withDB(async (client) => {
    const sql = `INSERT INTO verification_codes (email, code, expires_at, verified, created_at) VALUES (?, ?, ?, ?, NOW())`;
    return client.execute(sql, [email, code, expires_at, verified ? 1 : 0]);
  });
}

export async function findVerificationCode(email, code) {
  return withDB(async (client) => {
    const rows = await client.query('SELECT * FROM verification_codes WHERE email = ? AND code = ? AND verified = 0 LIMIT 1', [email, code]);
    return rows?.[0] || null;
  });
}

export async function deleteVerificationCodeById(id) {
  return withDB(async (client) => {
    return client.execute('DELETE FROM verification_codes WHERE id = ?', [id]);
  });
}
