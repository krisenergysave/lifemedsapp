import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Bell, BarChart3, Smartphone, Users, Heart, 
  Clock, Calendar, Database, Activity, Lock, ShieldCheck, 
  Zap, CheckCircle, ArrowRight 
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import DownloadButtons from '@/components/landing/DownloadButtons';
import PhoneCarousel from '@/components/landing/PhoneCarousel';

export default function Features() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await authApi.isAuthenticated();
        if (isAuth) {
          navigate(createPageUrl('Dashboard'), { replace: true });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };
    checkAuth();
  }, [navigate]);
  const mainFeatures = [
    {
      icon: Bell,
      title: 'Smart Medication Reminders',
      description: 'Our intelligent reminder system learns your schedule and sends perfectly timed notifications. Set flexible reminders for pills, injections, and refills with customizable snooze options.',
      image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=600&h=400&fit=crop',
      gradient: 'from-sky-500 to-blue-600',
      features: ['Customizable notification sounds', 'Smart snooze functionality', 'Recurring schedules', 'Photo confirmation option'],
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking & Analytics',
      description: 'Visualize your medication adherence with beautiful charts and detailed statistics. Track your health metrics over time and share reports with your healthcare provider.',
      image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697204aa5449b986f78395af/9b27e4544_Screenshot_24-1-2026_75321_life-medscom.jpg',
      gradient: 'from-teal-500 to-emerald-600',
      features: ['Weekly & monthly reports', 'Adherence statistics', 'Export to PDF', 'Share with doctors'],
    },
    {
      icon: Users,
      title: 'Family Sharing & Caregiving',
      description: 'Manage medications for your entire family from one account. Perfect for caregivers managing elderly parents or children with medical needs.',
      image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&h=400&fit=crop',
      gradient: 'from-purple-500 to-indigo-600',
      features: ['Multiple profiles', 'Caregiver notifications', 'Activity sharing', 'Emergency contacts'],
    },
  ];

  const additionalFeatures = [
    { icon: Clock, title: 'Flexible Scheduling', description: 'Set reminders for any time, any frequency' },
    { icon: Calendar, title: 'Calendar Integration', description: 'Sync with your favorite calendar apps' },
    { icon: Database, title: 'Curated & Verified Medication Database', description: 'Access our admin-verified medication list for accuracy and safety' },
    { icon: Activity, title: 'Personalized Health Trackers', description: 'Monitor vital metrics including weight, heart rate, blood pressure, and more with easy-to-use logging tools' },
    { icon: Lock, title: 'Privacy First', description: 'Your data is encrypted and secure' },
    { icon: ShieldCheck, title: 'Secure Account Persistence', description: 'Your health data is securely tied to your profile. Access your logs and schedules seamlessly from any web or mobile device once logged in' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-teal-50" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200 rounded-full blur-3xl opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 bg-sky-100 text-sky-700 text-sm font-medium rounded-full mb-6">
              Powerful Features
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              Everything You Need for
              <span className="block bg-gradient-to-r from-sky-500 to-teal-500 bg-clip-text text-transparent">
                Better Health Management
              </span>
            </h1>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Life-Meds combines smart technology with thoughtful design to create the most comprehensive medication management experience available.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-20 items-center mb-24 lg:mb-32 last:mb-0`}
            >
              {/* Image */}
              <div className="w-full lg:w-1/2">
                <div className="relative">
                  <div className={`absolute -inset-4 bg-gradient-to-br ${feature.gradient} rounded-3xl blur-2xl opacity-20`} />
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="relative w-full rounded-3xl shadow-2xl"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="w-full lg:w-1/2">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                  {feature.title}
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.features.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0`}>
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              And So Much More
            </h2>
            <p className="text-lg text-slate-600">
              Packed with features to make your health journey easier.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 hover:border-sky-200 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-100 to-teal-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-sky-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* App Screenshots */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-sky-100 text-sky-700 text-sm font-medium rounded-full mb-4">
              App Preview
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              See It in Action
            </h2>
            <p className="text-lg text-slate-600">
              Beautiful design meets powerful functionality.
            </p>
          </motion.div>

          <PhoneCarousel />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-sky-500 to-teal-500">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-white/80 mb-10">
              Download Life-Meds today and experience the easiest way to manage your medications.
            </p>
            <DownloadButtons size="large" className="justify-center" />
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}