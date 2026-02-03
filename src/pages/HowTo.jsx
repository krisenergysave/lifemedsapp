import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  Pill, Calendar, Users, LineChart, Bell, Settings, 
  CheckCircle, ChevronDown, ChevronUp 
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function HowTo() {
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const guides = [
    {
      icon: Pill,
      title: 'Adding Your First Medication',
      description: 'Learn how to add medications and set up reminders',
      steps: [
        'Navigate to "Medications" from the dashboard',
        'Click "Add Medication" button',
        'Enter medication name, dosage, and form',
        'Set your preferred reminder times',
        'Choose medication frequency and duration',
        'Enable refill tracking (optional)',
        'Save your medication'
      ]
    },
    {
      icon: Bell,
      title: 'Setting Up Reminders',
      description: 'Never miss a dose with smart reminders',
      steps: [
        'Open a medication from your list',
        'Click "Edit" to modify settings',
        'Toggle "Reminder Enabled" on',
        'Add custom reminder times',
        'Configure notification preferences',
        'Set up refill alerts if needed',
        'Save your changes'
      ]
    },
    {
      icon: Users,
      title: 'Managing Family Members',
      description: 'Track medications for your loved ones',
      steps: [
        'Go to "Family Members" page',
        'Click "Add Family Member"',
        'Enter their name and relationship',
        'Set their role (patient or caregiver)',
        'Assign medications to family members',
        'Configure notification settings',
        'Save family member profile'
      ]
    },
    {
      icon: LineChart,
      title: 'Tracking Your Health',
      description: 'Monitor vital health metrics over time',
      steps: [
        'Navigate to "Health Trackers"',
        'Select the metric you want to track',
        'Click "Add Entry" or "Log Data"',
        'Enter your measurement value',
        'Add notes if needed',
        'View trends on the chart',
        'Export data for your doctor'
      ]
    },
    {
      icon: Calendar,
      title: 'Scheduling Appointments',
      description: 'Keep track of doctor visits and checkups',
      steps: [
        'Go to "Appointments" from dashboard',
        'Click "Add Appointment"',
        'Enter doctor name and specialty',
        'Choose appointment type',
        'Set date and time',
        'Add location and contact info',
        'Save your appointment'
      ]
    },
    {
      icon: Settings,
      title: 'Customizing Your Profile',
      description: 'Personalize your Life-Meds experience',
      steps: [
        'Click your profile icon',
        'Select "Profile Settings"',
        'Update your personal information',
        'Set your timezone preferences',
        'Configure notification settings',
        'Manage subscription if applicable',
        'Save your preferences'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-teal-50" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full blur-3xl opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              How to Use
              <span className="block bg-gradient-to-r from-sky-500 to-teal-500 bg-clip-text text-transparent">
                Life-Meds
              </span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Step-by-step guides to help you get the most out of your medication management
            </p>
          </motion.div>
        </div>
      </section>

      {/* Guides Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="space-y-6">
            {guides.map((guide, index) => (
              <motion.div
                key={guide.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow"
              >
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full px-8 py-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                      <guide.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-slate-900">{guide.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{guide.description}</p>
                    </div>
                  </div>
                  {expandedSection === index ? (
                    <ChevronUp className="w-6 h-6 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-slate-400" />
                  )}
                </button>

                {expandedSection === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-8 pb-6 bg-gradient-to-br from-slate-50 to-white"
                  >
                    <ol className="space-y-3 mt-4">
                      {guide.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">{stepIndex + 1}</span>
                          </div>
                          <span className="text-slate-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Tips Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Quick Tips
            </h2>
            <p className="text-lg text-slate-600">
              Pro tips to maximize your Life-Meds experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Enable Notifications',
                description: 'Turn on push notifications to never miss a medication reminder'
              },
              {
                title: 'Set Timezone',
                description: 'Make sure your timezone is correct for accurate reminders'
              },
              {
                title: 'Add Refill Info',
                description: 'Track your medication supply and get refill alerts'
              },
              {
                title: 'Sync Devices',
                description: 'Your data automatically syncs across all your devices'
              },
              {
                title: 'Share with Doctor',
                description: 'Export your medication history to share with healthcare providers'
              },
              {
                title: 'Regular Updates',
                description: 'Keep your medication list current by updating as prescriptions change'
              }
            ].map((tip, index) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">{tip.title}</h3>
                    <p className="text-sm text-slate-600">{tip.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-sky-500 to-teal-500">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-sky-50 mb-8">
              Join thousands of users managing their health with Life-Meds
            </p>
            <Link
              to={createPageUrl('Onboarding')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-sky-600 rounded-full font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Get Started Now
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}