import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Smartphone, Tablet, Monitor, CheckCircle, Zap, Shield, Cloud } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import DownloadButtons from '@/components/landing/DownloadButtons';

export default function Download() {
  const platforms = [
  {
    name: 'Windows',
    icon:
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M0,12.4l9.6,1.3V24l-9.6-1.3V12.4z M10.7,10.6L0,9.6V0l10.7,1.5V10.6z M11.4,24v-10.7L24,12v12L11.4,24z M24,0v10.9l-12.6-1.7V0L24,0z" />
        </svg>,

    requirements: ['Windows 10 or later', 'Desktop & Laptop', '200 MB storage'],
    storeLink: '#',
    storeName: 'Windows',
    gradient: 'from-blue-600 to-blue-700'
  }];


  const features = [
  { icon: Zap, title: 'Quick Setup', description: 'Get started in under 2 minutes' },
  { icon: Shield, title: 'Secure', description: 'Bank-level encryption for your data' },
  { icon: Cloud, title: 'Cloud Sync', description: 'Your data syncs across all devices' }];


  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-teal-50" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full blur-3xl opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}>

              <span className="inline-block px-4 py-1.5 bg-sky-100 text-sky-700 text-sm font-medium rounded-full mb-6">

              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                Get Life-Meds for
                <span className="block bg-gradient-to-r from-sky-500 to-teal-500 bg-clip-text text-transparent">
                  Your Device
                </span>
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Available on Windows.  Start managing your medications smarter.

              </p>
            </motion.div>
          </div>

          {/* Platform Cards */}
          <div className="grid md:grid-cols-1 gap-8 max-w-xl mx-auto">
            {platforms.map((platform, index) =>
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative group">

                <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-teal-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center text-white mb-6`}>
                    {platform.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">{platform.name}</h2>
                  
                  <ul className="space-y-3 mb-8">
                    {platform.requirements.map((req) =>
                  <li key={req} className="flex items-center gap-3 text-slate-600">
                        <CheckCircle className="w-5 h-5 text-teal-500" />
                        {req}
                      </li>
                  )}
                  </ul>

                  <Link to={createPageUrl('Onboarding')}>
                    <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full inline-flex items-center justify-center gap-3 h-14 bg-gradient-to-r ${platform.gradient} text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-shadow`}>

                      {platform.icon}
                      <span>Download on {platform.storeName}</span>
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8">
            {features.map((feature, index) =>
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>



      {/* Compatibility Section */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16">

            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Compatible Devices
            </h2>
            <p className="text-lg text-slate-600">
              Life-Meds works seamlessly across all your devices.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
            { icon: Monitor, title: 'Desktop', devices: 'Windows 10 and later' },
            { icon: Monitor, title: 'Web Access', devices: 'Access from any browser' }].
            map((item, index) =>
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 text-center shadow-lg shadow-slate-200/50 border border-slate-100">

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-100 to-teal-100 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-sky-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.devices}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>);

}