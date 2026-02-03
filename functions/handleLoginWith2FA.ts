import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Backend function to validate login and check if 2FA is required.
 * After user logs in (via built-in login), call this function to determine next step.
 * 
 * Response: 
 * - { requires2FA: false, redirect: "Dashboard" }
 * - { requires2FA: true, redirect: "Verify2FA", email: user.email }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has 2FA enabled
    if (user.two_factor_enabled && user.two_factor_method === 'totp') {
      return Response.json({
        requires2FA: true,
        redirect: 'Verify2FA',
        email: user.email
      });
    }

    // No 2FA, proceed to dashboard
    return Response.json({
      requires2FA: false,
      redirect: 'Dashboard'
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});