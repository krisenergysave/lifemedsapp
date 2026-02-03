import React, { useState, useEffect } from 'react';
import authApi from '@/api/authApi';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { differenceInDays, parseISO } from 'date-fns';
import { AlertCircle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SubscriptionGuard({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const currentUser = await authApi.me();
      setUser(currentUser);

      // If no trial dates set, initialize trial
      if (!currentUser.trial_start_date) {
        const now = new Date();
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 14);

        await authApi.updateMe({
          trial_start_date: now.toISOString(),
          trial_end_date: trialEnd.toISOString(),
          subscription_status: 'trial'
        });

        setHasAccess(true);
      } else {
        // Check if trial expired
        const trialEndDate = parseISO(currentUser.trial_end_date);
        const isTrialActive = differenceInDays(trialEndDate, new Date()) >= 0;

        const hasActiveSubscription = currentUser.subscription_status === 'active';
        const isInTrial = currentUser.subscription_status === 'trial' && isTrialActive;

        setHasAccess(hasActiveSubscription || isInTrial);

        // Update status if trial expired but status still shows trial
        if (currentUser.subscription_status === 'trial' && !isTrialActive) {
          await authApi.updateMe({ subscription_status: 'expired' });
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Subscription check error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E8F4F8] via-[#F0F9FC] to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E8F4F8] via-[#F0F9FC] to-white px-6">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Trial Expired
          </h1>
          <p className="text-slate-600 mb-8">
            Your 14-day trial has ended. Subscribe now to continue managing your medications and health.
          </p>
          <Button
            onClick={() => navigate(createPageUrl('Subscription'))}
            className="w-full gradient-cyan text-white hover:opacity-90 h-12 text-lg">
            <Crown className="w-5 h-5 mr-2" />
            View Subscription Plans
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}