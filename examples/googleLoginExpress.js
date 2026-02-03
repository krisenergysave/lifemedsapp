/**
 * Example Node/Express route that verifies Google ID tokens and sets a secure HTTP-only cookie.
 * Requires dependencies: express, cookie-parser, google-auth-library, jsonwebtoken
 *
 * Install:
 * npm install express cookie-parser google-auth-library jsonwebtoken
 */

const express = require('express');
const cookieParser = require('cookie-parser');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cookieParser());

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

app.post('/googleLogin', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Missing token' });

    const ticket = await client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const sub = payload.sub;

    // TODO: find or create your user in DB here. Example below assumes success.
    const userId = sub; // replace with actual user id from your DB

    // Sign a session JWT
    const jwtToken = jwt.sign({ sub: userId, email }, SESSION_SECRET, { expiresIn: '1d' });

    // Set secure cookie
    res.cookie('base44_access_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Invalid token' });
  }
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log('Example Google Login listening on', port));
}

module.exports = app;
