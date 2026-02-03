import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Bell, TrendingUp, Heart, Pill, AlertCircle,
  CheckCircle2, Info, Sparkles, ChevronRight, ArrowLeft
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Updates() {
  const navigate = useNavigate();
  const updates = [
    {
      id: 1,
      type: 'tip',
      icon: Sparkles,
      color: '#9C27B0',
      title: 'Health Tip of the Day',
      message: 'Taking medications at the same time each day helps build a consistent routine and improves adherence.',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'reminder',
      icon: Bell,
      color: '#00BCD4',
      title: 'Medication Reminder',
      message: 'Your evening medications are due in 1 hour. Make sure to take them with food.',
      time: '3 hours ago',
      action: 'View Schedule'
    },
    {
      id: 3,
      type: 'achievement',
      icon: CheckCircle2,
      color: '#4CAF50',
      title: 'Great Job!',
      message: 'You\'ve maintained 100% adherence for 7 days straight. Keep up the excellent work!',
      time: '1 day ago'
    },
    {
      id: 4,
      type: 'info',
      icon: Info,
      color: '#FF9800',
      title: 'Premium Features Available',
      message: 'Upgrade to Premium to unlock advanced health tracking, family sharing, and priority support.',
      time: '2 days ago',
      action: 'Learn More'
    },
    {
      id: 5,
      type: 'alert',
      icon: AlertCircle,
      color: '#E91E63',
      title: 'Refill Reminder',
      message: 'Your prescription for Lisinopril is running low. You have 3 days of supply remaining.',
      time: '3 days ago',
      action: 'Contact Pharmacy'
    },
    {
      id: 6,
      type: 'tip',
      icon: Heart,
      color: '#9C27B0',
      title: 'Health Insight',
      message: 'Regular blood pressure monitoring can help you and your doctor better manage your cardiovascular health.',
      time: '5 days ago'
    }
  ];

  const subscriptionFeatures = [
    {
      title: 'Premium Plan',
      price: '$4.99/month',
      features: [
        'Unlimited medications',
        'Advanced health tracking',
        'Family medication management',
        'Priority support',
        'Drug interaction alerts',
        'Export health reports'
      ],
      popular: true
    },
    {
      title: 'Annual Plan',
      price: '$49.99/year',
      subtitle: 'Save 17%',
      features: [
        'All premium features',
        '2 months free',
        'Priority support',
        'Early access to new features'
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] via-[#F0F9FC] to-white pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(createPageUrl('Dashboard'))}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Updates & Tips</h1>
              <p className="text-slate-600 text-sm mt-1">Stay informed about your health journey</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Activity Feed */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {updates.map((update, idx) => {
              const Icon = update.icon;
              return (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: update.color + '20' }}
                      >
                        <Icon className="w-6 h-6" style={{ color: update.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-slate-900">{update.title}</h3>
                          <span className="text-xs text-slate-500">{update.time}</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{update.message}</p>
                        {update.action && (
                          <Button variant="outline" size="sm" className="text-[#00BCD4] border-[#00BCD4]">
                            {update.action}
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Subscription Plans */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Upgrade Your Experience</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {subscriptionFeatures.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
              >
                <Card className={`p-6 bg-white relative ${plan.popular ? 'border-2 border-[#00BCD4]' : ''}`}>
                  {plan.popular && (
                    <Badge className="absolute top-4 right-4 gradient-cyan text-white">
                      Most Popular
                    </Badge>
                  )}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900">{plan.title}</h3>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-3xl font-bold text-[#00BCD4]">{plan.price}</span>
                      {plan.subtitle && (
                        <span className="text-sm text-green-600 font-medium">{plan.subtitle}</span>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full gradient-cyan text-white">
                    Start Free Trial
                  </Button>
                  <p className="text-xs text-center text-slate-500 mt-3">
                    14-day free trial • Cancel anytime
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}