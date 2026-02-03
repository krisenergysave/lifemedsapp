import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Bell, BarChart3, Smartphone, Users, Heart, ChevronRight, Sparkles } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import FeatureCard from '@/components/landing/FeatureCard';
import GoogleLoginButton from '@/components/Auth/GoogleLoginButton';
import authApi from '@/api/authApi';

export default function Home() {
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
  const features = [
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Never miss a dose with intelligent notifications that adapt to your schedule and preferences.',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description: 'Monitor your health journey with detailed analytics and beautiful visual reports.',
    gradient: 'from-teal-500 to-emerald-600'
  },
  {
    icon: Smartphone,
    title: 'User-Friendly',
    description: 'Intuitive design that makes medication management effortless for all ages.',
    gradient: 'from-purple-500 to-indigo-600'
  },
  {
    icon: Users,
    title: 'Family Sharing',
    description: 'Manage medications for your loved ones and keep the whole family healthy.',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    icon: Heart,
    title: 'Health Insights',
    description: 'Get personalized health tips and insights based on your medication patterns.',
    gradient: 'from-red-500 to-pink-600'
  }];





  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-teal-50" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-sky-100/50 to-transparent" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full blur-3xl opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span className="text-sm font-medium text-sky-700">Your Health Companion</span>
              </div>

              <h1 className="text-slate-900 px-10 text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">Never Miss a Dose Again




              </h1>

              <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
                Take control of your health with smart medication reminders, detailed tracking, and personalized insights. Your wellness journey starts here.
              </p>

              <div className="mb-8">
                <Link to={createPageUrl('Onboarding')}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-5 bg-gradient-to-r from-sky-500 to-teal-500 text-white font-bold text-xl rounded-full shadow-xl hover:shadow-2xl transition-all inline-block">
                    Start Free 14 Day Trial
                  </motion.button>
                </Link>

                {/* Google Sign-In */}
                <div className="mt-4">
                  <p className="text-sm text-slate-600 mb-2">Or sign in with</p>
                  <div className="inline-block">
                    {/* GoogleLoginButton inserted via component below */}
                    <GoogleLoginButton />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative">

              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=700&fit=crop"
                  alt="Life-Meds App"
                  className="w-full rounded-3xl shadow-2xl shadow-sky-200/50" />

              </div>
              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -left-6 bg-white rounded-2xl shadow-xl p-4 z-20">

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Reminder Set!</p>
                    <p className="text-xs text-slate-500">Vitamin D - 9:00 AM</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-4 z-20">

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Weekly Streak</p>
                    <p className="text-xs text-slate-500">100% adherence</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16">

            <span className="inline-block px-4 py-1.5 bg-sky-100 text-sky-700 text-sm font-medium rounded-full mb-4">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Everything You Need for
              <span className="block bg-gradient-to-r from-sky-500 to-teal-500 bg-clip-text text-transparent">
                Better Health
              </span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful features designed to make medication management simple, safe, and effective.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) =>
            <FeatureCard key={feature.title} {...feature} index={index} />
            )}
          </div>
        </div>
      </section>





      <Footer />
    </div>);

}