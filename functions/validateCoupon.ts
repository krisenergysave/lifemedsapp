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

    const { code } = await req.json();

    if (!code || code.trim() === '') {
      return Response.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    // Retrieve the promotion code
    const promotionCodes = await stripe.promotionCodes.list({
      code: code.trim(),
      active: true,
      limit: 1
    });

    if (promotionCodes.data.length === 0) {
      return Response.json({ error: 'Invalid or expired coupon code' }, { status: 404 });
    }

    const promotionCode = promotionCodes.data[0];
    const coupon = promotionCode.coupon;

    // Check if coupon is valid
    if (!coupon.valid) {
      return Response.json({ error: 'Coupon is no longer valid' }, { status: 400 });
    }

    // Build discount info
    const discountInfo = {
      id: promotionCode.id,
      code: promotionCode.code,
      couponId: coupon.id,
      percentOff: coupon.percent_off || null,
      amountOff: coupon.amount_off ? coupon.amount_off / 100 : null, // Convert cents to dollars
      currency: coupon.currency || 'usd',
      duration: coupon.duration, // 'once', 'repeating', 'forever'
      durationInMonths: coupon.duration_in_months || null
    };

    return Response.json({ valid: true, discount: discountInfo });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});