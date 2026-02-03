/**
 * Example Node/Express route that verifies Google ID tokens, stores a session in MySQL,
 * and sets a secure HTTP-only cookie. Requires dependencies: express, cookie-parser, google-auth-library, jsonwebtoken, mysql2
 *
 * Install:
 * npm install express cookie-parser google-auth-library jsonwebtoken mysql2
 */

const express = require('express');
const cookieParser = require('cookie-parser');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());
app.use(cookieParser());

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'appdb';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function getDbConnection() {
  return mysql.createConnection({ host: DB_HOST, user: DB_USER, database: DB_NAME, password: DB_PASSWORD, port: DB_PORT });
}

app.post('/googleLogin', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Missing token' });

    const ticket = await client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const sub = payload.sub;

    // TODO: find or create your user in DB here. Example below assumes success and uses the Google sub as user id.
    const userId = sub;

    const jti = require('crypto').randomUUID();
    const xsrf = require('crypto').randomUUID();
    const expiresInSeconds = Number(process.env.SESSION_MAX_AGE_SECONDS || 60 * 60 * 24);
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    const conn = await getDbConnection();
    try {
      await conn.execute(
        `INSERT INTO sessions (user_id, jti, xsrf_token, expires_at, user_agent, ip, revoked, created_at)
         VALUES (?, ?, ?, ?, ?, ?, false, NOW())`,
        [userId, jti, xsrf, expiresAt, req.headers['user-agent'] || null, req.headers['x-forwarded-for'] || null]
      );
    } finally {
      await conn.end();
    }

    // Sign a session JWT
    const jwtToken = jwt.sign({ sub: userId, email, jti }, SESSION_SECRET, { expiresIn: `${expiresInSeconds}s` });

    // Set cookies
    res.cookie('base44_access_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expiresInSeconds * 1000
    });
    res.cookie('XSRF-TOKEN', xsrf, { maxAge: expiresInSeconds * 1000, sameSite: 'strict' });

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Invalid token' });
  }
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log('Example Google Login (Express + MySQL) listening on', port));
}

module.exports = app;
