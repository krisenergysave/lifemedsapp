import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { user_email } = await req.json();

    if (!user_email) {
      return Response.json({ error: 'User email is required' }, { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (user_email === user.email) {
      return Response.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    // Delete the user
    const users = await base44.asServiceRole.entities.User.filter({ email: user_email });
    if (users.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    await base44.asServiceRole.entities.User.delete(users[0].id);

    // Log the action
    await base44.asServiceRole.entities.SystemLog.create({
      action: 'delete_user',
      admin_email: user.email,
      target_user_email: user_email,
      details: `Admin ${user.email} deleted user ${user_email}`,
      timestamp: new Date().toISOString()
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});