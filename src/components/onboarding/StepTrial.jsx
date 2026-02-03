import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronLeft, Check } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function StepTrial({ formData, onComplete, prevStep }) {
  const [showPlans, setShowPlans] = useState(false);

  const plans = [
    {
      name: 'Monthly',
      price: '$4.99',
      period: '/month',
      features: ['All premium features', 'Unlimited medications', 'Family sharing', 'Priority support'],
    },
    {
      name: 'Annual',
      price: '$49.99',
      period: '/year',
      badge: 'Save 17%',
      features: ['All premium features', 'Unlimited medications', 'Family sharing', 'Priority support', '2 months free'],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
    >
      {!showPlans && (
        <button
          onClick={prevStep}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
      )}

      <AnimatePresence mode="wait">
        {!showPlans ? (
          <motion.div
            key="trial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-teal-500 rounded-3xl flex items-center justify-center mb-6 mx-auto">
              <Sparkles className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">
              Start Your Free 14-Day Trial
            </h2>
            <p className="text-slate-600 mb-8 text-center">
              Get full access to all premium features. No credit card required.
            </p>

            <div className="bg-gradient-to-br from-sky-50 to-teal-50 rounded-2xl p-6 mb-8">
              <h3 className="font-semibold text-slate-900 mb-4">What's included:</h3>
              <ul className="space-y-3">
                {['Smart medication reminders', 'Track adherence & progress', 'Manage family medications', 'Side effects tracking', 'Drug interaction alerts'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-slate-700">
                    <div className="w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = createPageUrl('Dashboard')}
                className="w-full h-14 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white rounded-xl font-semibold text-base"
              >
                Start Free Trial
              </Button>
              
              <button
                onClick={() => setShowPlans(true)}
                className="w-full text-sky-600 font-medium hover:text-sky-700 transition-colors"
              >
                Review Plans
              </button>
            </div>

            <p className="text-xs text-slate-500 text-center mt-6">
              By continuing, you agree to our{' '}
              <a href="#" className="text-sky-600 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-sky-600 hover:underline">Privacy Policy</a>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="plans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              onClick={() => setShowPlans(false)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">Choose Your Plan</h2>
            <p className="text-slate-600 mb-8 text-center">
              14-day free trial on any plan
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className="border-2 border-slate-200 rounded-2xl p-6 hover:border-sky-500 transition-all relative"
                >
                  {plan.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-sky-500 to-teal-500 text-white text-xs font-semibold rounded-full">
                      {plan.badge}
                    </span>
                  )}
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-600">{plan.period}</span>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                        <Check className="w-4 h-4 text-sky-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => window.location.href = createPageUrl('Dashboard')}
                    className="w-full h-12 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white rounded-xl font-semibold"
                  >
                    Start Free Trial
                  </Button>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 text-center">
              By continuing, you agree to our{' '}
              <a href="#" className="text-sky-600 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-sky-600 hover:underline">Privacy Policy</a>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}