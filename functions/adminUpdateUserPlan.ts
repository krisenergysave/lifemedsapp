import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const admin = await base44.auth.me();

    // Verify admin access
    if (!admin || admin.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { user_email, plan_type, billing_method, access_expires_at, role } = await req.json();

    if (!user_email || !plan_type || !billing_method) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prevent admins from changing their own role
    if (role && user_email === admin.email) {
      return Response.json({ error: 'You cannot change your own role' }, { status: 400 });
    }

    // Get target user
    const users = await base44.asServiceRole.entities.User.filter({ email: user_email });
    if (!users || users.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    const targetUser = users[0];

    let updateData = {
      current_plan: plan_type
    };

    // Update role if provided and valid
    if (role && ['user', 'admin'].includes(role)) {
      updateData.role = role;
    }

    if (billing_method === 'manual') {
      // Manual Override - Grant free access
      updateData.manual_override = true;
      updateData.subscription_status = 'active';
      updateData.access_expires_at = access_expires_at;

      // Remove Stripe IDs if switching from paid to manual
      if (targetUser.stripe_subscription_id) {
        try {
          await stripe.subscriptions.cancel(targetUser.stripe_subscription_id);
          updateData.stripe_subscription_id = null;
        } catch (error) {
          console.error('Failed to cancel Stripe subscription:', error);
        }
      }

    } else if (billing_method === 'stripe') {
      // Stripe Billing
      updateData.manual_override = false;

      if (plan_type === 'trial') {
        updateData.subscription_status = 'trial';
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14);
        updateData.trial_end_date = trialEndDate.toISOString().split('T')[0];
      } else if (plan_type === 'none') {
        updateData.subscription_status = 'none';
        updateData.current_plan = 'none';
        if (targetUser.stripe_subscription_id) {
          try {
            await stripe.subscriptions.cancel(targetUser.stripe_subscription_id);
            updateData.stripe_subscription_id = null;
          } catch (error) {
            console.error('Failed to cancel Stripe subscription:', error);
          }
        }
      } else {
        // Monthly or Yearly - Create or update Stripe subscription
        const priceIds = {
          monthly: Deno.env.get('STRIPE_MONTHLY_PRICE_ID'),
          yearly: Deno.env.get('STRIPE_YEARLY_PRICE_ID')
        };

        const priceId = priceIds[plan_type];
        if (!priceId) {
          return Response.json({ error: 'Invalid plan type' }, { status: 400 });
        }

        try {
          // Get or create Stripe customer
          let customerId = targetUser.stripe_customer_id;
          if (!customerId) {
            const customer = await stripe.customers.create({
              email: user_email,
              metadata: { user_id: targetUser.id }
            });
            customerId = customer.id;
            updateData.stripe_customer_id = customerId;
          }

          // Create invoice or payment link
          const invoice = await stripe.invoices.create({
            customer: customerId,
            collection_method: 'send_invoice',
            days_until_due: 7
          });

          await stripe.invoiceItems.create({
            customer: customerId,
            invoice: invoice.id,
            price: priceId
          });

          await stripe.invoices.finalizeInvoice(invoice.id);
          await stripe.invoices.sendInvoice(invoice.id);

          updateData.subscription_status = 'active';
        } catch (error) {
          console.error('Stripe error:', error);
          return Response.json({ error: 'Failed to process Stripe billing' }, { status: 500 });
        }
      }
    }

    // Update user record
    await base44.asServiceRole.entities.User.update(targetUser.id, updateData);

    // Create audit log
    const logDetails = billing_method === 'manual' 
      ? `Admin ${admin.email} granted ${plan_type} plan to ${user_email} (Manual Override, expires: ${access_expires_at})`
      : `Admin ${admin.email} updated ${user_email} to ${plan_type} plan via Stripe`;

    try {
      await base44.asServiceRole.entities.SystemLog.create({
        action: 'user_plan_update',
        admin_email: admin.email,
        target_user_email: user_email,
        details: logDetails,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }

    return Response.json({
      success: true,
      message: 'User plan updated successfully'
    });

  } catch (error) {
    console.error('Admin action error:', error);
    return Response.json(
      { error: error.message || 'Failed to update user plan' },
      { status: 500 }
    );
  }
});