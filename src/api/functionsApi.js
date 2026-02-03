// Wrapper for calling server-side functions (replaces base44.functions.invoke)
async function okJson(res) {
  const json = await res.json().catch(() => ({}));
  if (res.ok) return json;
  /** @type {any} */
  const err = new Error(json.error || 'Request failed');
  err.status = res.status;
  err.data = json;
  throw err;
}

const functionsApi = {
  async validateCoupon(code) {
    const res = await fetch('/api/validateCoupon', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code })
    });
    return okJson(res);
  },

  async createCheckoutSession(payload) {
    const res = await fetch('/api/createCheckoutSession', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    return okJson(res);
  },

  async handleSubscriptionChange(payload) {
    const res = await fetch('/api/handleSubscriptionChange', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    return okJson(res);
  },

  async notifyCaregivers(payload) {
    const res = await fetch('/api/notifyCaregivers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return okJson(res);
  },

  async sendContactMessage(payload) {
    const res = await fetch('/api/sendContactMessage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return okJson(res);
  },

  async listAllUsers() {
    const res = await fetch('/api/listAllUsers', { method: 'GET' });
    return okJson(res);
  },

  async adminUpdateUserPlan(payload) {
    const res = await fetch('/api/adminUpdateUserPlan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return okJson(res);
  },

  async adminDeleteUser(payload) {
    const res = await fetch('/api/adminDeleteUser', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return okJson(res);
  },

  async importHealthData(payload) {
    const res = await fetch('/api/importHealthData', { method: 'POST', body: payload });
    return okJson(res);
  }
};

export default functionsApi;
