import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, new_plan } = await req.json();

    if (!user.stripe_subscription_id) {
      return Response.json({ error: 'No active subscription found' }, { status: 400 });
    }

    // Retrieve the current subscription
    const subscription = await stripe.subscriptions.retrieve(user.stripe_subscription_id);

    if (action === 'cancel') {
      // Cancel at period end
      await stripe.subscriptions.update(user.stripe_subscription_id, {
        cancel_at_period_end: true
      });

      // Update user entity
      await base44.auth.updateMe({
        subscription_status: 'cancelled'
      });

      return Response.json({
        success: true,
        message: 'Subscription will be cancelled at the end of the billing period'
      });
    }

    if (action === 'switch_plan') {
      if (!new_plan || (new_plan !== 'monthly' && new_plan !== 'yearly')) {
        return Response.json({ error: 'Invalid plan specified' }, { status: 400 });
      }

      // Price IDs for monthly and yearly plans
      const prices = {
        monthly: Deno.env.get('STRIPE_MONTHLY_PRICE_ID'),
        yearly: Deno.env.get('STRIPE_YEARLY_PRICE_ID')
      };

      const newPriceId = prices[new_plan];

      // Update the subscription to the new price
      await stripe.subscriptions.update(user.stripe_subscription_id, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations', // Charge/credit the difference
      });

      // Update user entity
      await base44.auth.updateMe({
        current_plan: new_plan
      });

      return Response.json({
        success: true,
        message: `Successfully switched to ${new_plan} plan`
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Subscription change error:', error);
    return Response.json(
      { error: error.message || 'Failed to modify subscription' },
      { status: 500 }
    );
  }
});