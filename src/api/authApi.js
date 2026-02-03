// Lightweight compatibility shim for legacy base44.auth usage
// Maps to our new server endpoints (cookie-based sessions + auth functions)

async function okJson(res) {
  const json = await res.json().catch(() => ({}));
  if (res.ok) return json;
  /** @type {any} */
  const err = new Error(json.error || 'Request failed');
  err.status = res.status;
  err.data = json;
  throw err;
}

const authApi = {
  async me() {
    const res = await fetch('/api/session', { method: 'GET', credentials: 'include' });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.authenticated) return data.user;
    /** @type {any} */
    const err = new Error('Not authenticated');
    err.status = 401;
    throw err;
  },

  async isAuthenticated() {
    try {
      const res = await fetch('/api/session', { method: 'GET', credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      return res.ok && !!data.authenticated;
    } catch (e) {
      return false;
    }
  },

  async loginViaEmailPassword(email, password) {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return data;
    /** @type {any} */
    const err = new Error(data.error || 'Login failed');
    err.status = res.status;
    err.data = data;
    throw err;
  },

  async logout(redirectUrl = '/') {
    try {
      const xsrf = (typeof document !== 'undefined') ? (document.cookie.match('(^| )XSRF-TOKEN=([^;]+)') && decodeURIComponent(document.cookie.match('(^| )XSRF-TOKEN=([^;]+)')[2])) : null;
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: xsrf ? { 'X-XSRF-TOKEN': xsrf, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      // ignore
    }
    window.location.href = redirectUrl;
  },

  async register(email, password) {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return okJson(res);
  },

  async sendVerificationCode(email) {
    const res = await fetch('/api/sendVerificationCode', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
    });
    return okJson(res);
  },

  async verifyCode(email, code) {
    const res = await fetch('/api/verifyCode', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code })
    });
    return okJson(res);
  },

  async sendPasswordReset(email) {
    const res = await fetch('/api/sendPasswordReset', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
    });
    return okJson(res);
  },

  async resetPassword(email, token, password) {
    const res = await fetch('/api/resetPassword', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, token, password })
    });
    return okJson(res);
  },

  async generateTOTPSecret() {
    const res = await fetch('/api/generateTOTPSecret', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include' });
    return okJson(res);
  },

  async verifyTOTPCode({ code, secret }) {
    const res = await fetch('/api/verifyTOTPCode', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ code, secret }) });
    return okJson(res);
  },

  async verifyUserTOTP({ email, code }) {
    const res = await fetch('/api/verifyUserTOTP', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code }) });
    return okJson(res);
  },

  async updateMe(data) {
    const res = await fetch('/api/updateMe', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(data) });
    return okJson(res);
  }
};

export default authApi;
