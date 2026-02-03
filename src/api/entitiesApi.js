// Simple entities API that proxies to /api/entities
async function okJson(res) {
  const json = await res.json().catch(() => ({}));
  if (res.ok) return json;
  /** @type {any} */
  const err = new Error(json.error || 'Request failed');
  err.status = res.status;
  err.data = json;
  throw err;
}

const entitiesApi = {
  async list(entity, { sort, limit } = {}) {
    const res = await fetch('/api/entities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'list', entity, sort, limit }) });
    return okJson(res);
  },

  async filter(entity, filter = {}) {
    const res = await fetch('/api/entities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'filter', entity, filter }) });
    return okJson(res);
  },

  async get(entity, id) {
    const res = await fetch('/api/entities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'get', entity, id }) });
    return okJson(res);
  },

  async create(entity, data) {
    const res = await fetch('/api/entities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create', entity, data }) });
    return okJson(res);
  },

  async update(entity, id, data) {
    const res = await fetch('/api/entities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update', entity, id, data }) });
    return okJson(res);
  },

  async delete(entity, id) {
    const res = await fetch('/api/entities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', entity, id }) });
    return okJson(res);
  },

  subscribe(entity, cb) {
    console.warn('entitiesApi.subscribe() is a no-op fallback — real-time subscriptions are not yet implemented.');
    // Return unsubscribe function
    return () => {};
  }
};

export default entitiesApi;
