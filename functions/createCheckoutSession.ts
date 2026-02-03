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

    const { plan, promotionCode } = await req.json();

    // Create or get Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
      await base44.auth.updateMe({ stripe_customer_id: customerId });
    }

    // Check if user already has an active subscription (only if they have a paid subscription)
    if (user.subscription_status === 'active' && user.stripe_subscription_id) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1
      });

      if (subscriptions.data.length > 0) {
        return Response.json({ error: 'You already have an active subscription' }, { status: 400 });
      }
    }

    // Price IDs for monthly and yearly plans
    const prices = {
      monthly: Deno.env.get('STRIPE_MONTHLY_PRICE_ID'),
      yearly: Deno.env.get('STRIPE_YEARLY_PRICE_ID')
    };

    // Create checkout session
    const origin = req.headers.get('origin') || 'https://life-meds.base44.app';
    const sessionConfig = {
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: prices[plan],
          quantity: 1,
        },
      ],
      success_url: `${origin}/Dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscription`,
      metadata: {
        user_id: user.id,
        plan: plan
      }
    };

    // Add promotion code if provided, otherwise allow users to enter codes at checkout
    if (promotionCode) {
      sessionConfig.discounts = [{ promotion_code: promotionCode }];
    } else {
      sessionConfig.allow_promotion_codes = true;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});