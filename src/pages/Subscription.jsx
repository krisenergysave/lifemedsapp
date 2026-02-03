import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Crown, Loader2, Tag, X, Calendar, CreditCard, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { differenceInDays, parseISO, format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function Subscription() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [switchLoading, setSwitchLoading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(user => {
      setUser(user);
      // Update last_seen
      if (user) {
        base44.auth.updateMe({ last_seen: new Date().toISOString() }).catch(console.error);
      }
    });
  }, []);

  const trialDaysLeft = user?.trial_end_date 
    ? Math.max(0, differenceInDays(parseISO(user.trial_end_date), new Date()))
    : 14;

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setValidatingCoupon(true);
    setCouponError('');
    
    try {
      const { data } = await base44.functions.invoke('validateCoupon', { code: couponCode });
      if (data.valid) {
        setCouponData(data.discount);
        setCouponError('');
      }
    } catch (error) {
      setCouponError(error.response?.data?.error || 'Invalid coupon code');
      setCouponData(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleSubscribe = async (plan) => {
    setLoading(true);
    setSelectedPlan(plan);
    try {
      const payload = { plan };
      if (couponData?.id) {
        payload.promotionCode = couponData.id;
      }
      const response = await base44.functions.invoke('createCheckoutSession', payload);
      
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.error || 'Failed to start checkout. Please try again.');
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleSwitchPlan = async () => {
    setSwitchLoading(true);
    try {
      const newPlan = user.current_plan === 'monthly' ? 'yearly' : 'monthly';
      const response = await base44.functions.invoke('handleSubscriptionChange', {
        action: 'switch_plan',
        new_plan: newPlan
      });

      if (response.data?.success) {
        toast.success(`Successfully switched to ${newPlan} plan!`);
        const updatedUser = await base44.auth.me();
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Switch plan error:', error);
      toast.error(error.response?.data?.error || 'Failed to switch plan. Please try again.');
    } finally {
      setSwitchLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      const response = await base44.functions.invoke('handleSubscriptionChange', {
        action: 'cancel'
      });

      if (response.data?.success) {
        toast.success('Subscription will be cancelled at the end of the billing period.');
        setShowCancelDialog(false);
        const updatedUser = await base44.auth.me();
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
      toast.error(error.response?.data?.error || 'Failed to cancel subscription. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  const plans = [
    {
      name: 'Monthly Plan',
      price: '$4.99',
      period: '/month',
      plan: 'monthly',
      features: [
        'Unlimited medications tracking',
        'Medication reminders',
        'Family member management',
        'Health trackers',
        'Appointment scheduling',
        'Email support'
      ]
    },
    {
      name: 'Yearly Plan',
      price: '$49.99',
      period: '/year',
      plan: 'yearly',
      popular: true,
      savings: 'Save $10',
      features: [
        'Everything in Monthly',
        'Priority support',
        'Advanced analytics',
        'Export reports',
        'Early access to new features'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] via-[#F0F9FC] to-white pb-20">
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? You will lose access at the end of your current billing period.
              {user?.stripe_subscription_id && (
                <span className="block mt-2 font-medium text-slate-900">
                  Access until: {format(new Date(), 'MMMM d, yyyy')}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelLoading}>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={cancelLoading}
              className="bg-red-500 hover:bg-red-600">
              {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate(createPageUrl('Dashboard'))}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}>
            {user?.subscription_status !== 'active' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-100 to-teal-100 rounded-full mb-4">
                <Crown className="w-5 h-5 text-sky-600" />
                <span className="text-sm font-semibold text-slate-900">
                  {user?.subscription_status === 'trial' 
                    ? `${trialDaysLeft} days left in your trial - Subscribe early anytime!`
                    : 'Trial Expired'}
                </span>
              </div>
            )}
            {user?.subscription_status === 'active' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-4">
                <Crown className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-slate-900">
                  Active Subscription
                </span>
              </div>
            )}
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              {user?.subscription_status === 'active' ? 'My Plan' : 'Choose Your Plan'}
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {user?.subscription_status === 'trial'
                ? 'Subscribe now to lock in your plan, or continue enjoying your free trial'
                : user?.subscription_status === 'active'
                ? 'Manage your subscription and billing details'
                : 'Continue managing your health with unlimited access to all features'}
            </p>
          </motion.div>

          {user?.subscription_status !== 'active' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-md mx-auto mt-8">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-sky-600" />
                  <h3 className="font-semibold text-slate-900">Have a coupon code?</h3>
                </div>
                
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1"
                    disabled={validatingCoupon}
                  />
                  <Button
                    onClick={handleValidateCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="gradient-cyan text-white">
                    {validatingCoupon ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </Button>
                </div>

                {couponError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
                    <X className="w-4 h-4" />
                    {couponError}
                  </div>
                )}

                {couponData && (
                  <div className="flex items-center justify-between text-sm bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-900">
                        {couponData.percentOff 
                          ? `${couponData.percentOff}% off` 
                          : `$${couponData.amountOff} off`}
                        {couponData.duration === 'forever' && ' forever'}
                        {couponData.duration === 'once' && ' first payment'}
                        {couponData.duration === 'repeating' && ` for ${couponData.durationInMonths} months`}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setCouponData(null);
                        setCouponCode('');
                      }}
                      className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Active Subscription Management */}
        {user?.subscription_status === 'active' && user?.current_plan && user.current_plan !== 'none' ? (
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl border-2 border-sky-200 p-8 mb-8">
              
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {user.current_plan === 'monthly' ? 'Monthly Plan' : 'Yearly Plan'}
                  </h2>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-sky-600">
                      ${user.current_plan === 'monthly' ? '4.99' : '49.99'}
                    </span>
                    <span className="text-slate-600">
                      /{user.current_plan === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                </div>
                <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  Active
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-slate-700">
                  <CreditCard className="w-5 h-5 text-sky-500" />
                  <span>Billed {user.current_plan === 'monthly' ? 'monthly' : 'annually'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <Calendar className="w-5 h-5 text-sky-500" />
                  <span>Next billing: {format(new Date(), 'MMMM d, yyyy')}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 space-y-3">
                <Button
                  onClick={handleSwitchPlan}
                  disabled={switchLoading}
                  variant="outline"
                  className="w-full h-12 text-base">
                  {switchLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Switching...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Switch to {user.current_plan === 'monthly' ? 'Yearly' : 'Monthly'} Plan
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowCancelDialog(true)}
                  variant="outline"
                  className="w-full h-12 text-base text-red-600 hover:text-red-700 hover:bg-red-50">
                  <X className="w-4 h-4 mr-2" />
                  Cancel Subscription
                </Button>
              </div>
            </motion.div>

            {/* Plan Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">What's Included</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['Unlimited medications', 'Medication reminders', 'Family member management', 'Health trackers', 'Appointment scheduling', 'Priority support'].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.plan}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-white rounded-3xl shadow-lg border-2 p-8 relative ${
                plan.popular ? 'border-sky-500' : 'border-slate-200'
              }`}>
              
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-sky-500 to-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              {plan.savings && (
                <div className="absolute -top-4 right-8">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {plan.savings}
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-600">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(plan.plan)}
                disabled={loading || user?.subscription_status === 'active'}
                className={`w-full h-12 text-lg ${
                  plan.popular 
                    ? 'gradient-cyan text-white hover:opacity-90' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}>
                {loading && selectedPlan === plan.plan ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : user?.subscription_status === 'active' ? (
                  'Current Plan'
                ) : (
                  'Subscribe Now'
                )}
              </Button>
            </motion.div>
          ))}
          </div>
          )}

          <div className="text-center mt-12">
          <p className="text-sm text-slate-600">
          Secure payment powered by Stripe • Cancel anytime
          </p>
          </div>
          </div>
          </div>
          );
          }