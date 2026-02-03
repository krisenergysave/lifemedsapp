import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQs() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          navigate(createPageUrl('Dashboard'), { replace: true });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };
    checkAuth();
  }, [navigate]);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqs = [
    {
      question: "How do medication reminders work?",
      answer: "Our app sends you timely notifications based on your medication schedule. You can customize reminder times, sounds, and frequency for each medication."
    },
    {
      question: "Can I track medications for my family members?",
      answer: "Yes! You can add family members to your account and manage their medication schedules separately. This is perfect for caregivers managing multiple people's health."
    },
    {
      question: "Is my health data secure?",
      answer: "Absolutely. We use bank-level encryption to protect your data. Your information is stored securely and never shared with third parties without your explicit consent."
    },
    {
      question: "What happens if I miss a dose?",
      answer: "The app will mark it as missed and send you a follow-up notification. You can view your adherence history and patterns to help improve your medication routine."
    },
    {
      question: "Can I export my medication history?",
      answer: "Yes, you can export your medication logs and adherence reports as PDF files, which is useful for sharing with your healthcare provider."
    },
    {
      question: "Do I need an internet connection?",
      answer: "While internet is needed for syncing across devices, basic features like reminders work offline. Your data will sync automatically when you're back online."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] via-[#F0F9FC] to-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 rounded-full mb-6"
          >
            <HelpCircle className="w-5 h-5 text-sky-600" />
            <span className="text-sm font-medium text-sky-700">Frequently Asked Questions</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6"
          >
            How Can We{' '}
            <span className="bg-gradient-to-r from-sky-500 to-teal-500 bg-clip-text text-transparent">
              Help You?
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Find answers to common questions about Life-Meds and how to get the most out of your medication management.
          </motion.p>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="pb-20 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="bg-white rounded-2xl shadow-lg shadow-sky-100/50 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-sky-50/50 transition-colors"
                >
                  <span className="font-semibold text-slate-900 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-sky-500 flex-shrink-0 transition-transform duration-300 ${
                      expandedFAQ === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {expandedFAQ === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-slate-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}