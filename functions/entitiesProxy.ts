import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Proxy all basic entity operations to Base44 for now. This gives us a single
// endpoint the frontend can call while we migrate entity storage to our DB.

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });

    const body = await req.json().catch(() => ({}));
    const { action, entity, filter, sort, limit, id, data } = body;

    const client = await createClientFromRequest(req);
    const svc = client.asServiceRole;
    const ent = svc?.entities?.[entity];
    if (!ent) return Response.json({ error: `Unknown entity: ${entity}` }, { status: 400 });

    switch (action) {
      case 'list': {
        const res = await ent.list(sort || undefined, limit || undefined);
        return Response.json(res);
      }
      case 'filter': {
        const res = await ent.filter(filter || {});
        return Response.json(res);
      }
      case 'get': {
        const rows = await ent.filter({ id });
        return Response.json(rows && rows.length ? rows[0] : null);
      }
      case 'create': {
        const res = await ent.create(data);
        return Response.json(res);
      }
      case 'update': {
        const res = await ent.update(id, data);
        return Response.json(res);
      }
      case 'delete': {
        const res = await ent.delete(id);
        return Response.json({ success: true });
      }
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (err) {
    console.error('entitiesProxy error', err);
    return Response.json({ error: err.message || String(err) }, { status: 500 });
  }
});