import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Shield, ArrowLeft } from 'lucide-react';

export default function Privacy() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    base44.auth.isAuthenticated().then(setIsLoggedIn);
  }, []);

  const handleBack = () => {
    if (isLoggedIn) {
      navigate(createPageUrl('Dashboard'));
    } else {
      navigate(createPageUrl('Home'));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Back Button */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-600 hover:text-sky-600 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" />
            {isLoggedIn ? 'Back to Dashboard' : 'Back to Home'}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-sky-50 to-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-sky-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Shield className="w-8 h-8 text-sky-600" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-slate-600">
              Effective Date: January 1st, 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-lg prose-slate max-w-none">
            
            <p className="lead text-slate-600 mb-8">
              At Life-Meds.com, your privacy is of utmost importance to us. This Privacy Policy explains how we collect, use, disclose, and protect information that we obtain about our users ("you" or "your") when you visit our website (the "Site") and use our services. By accessing or using our Site, you agree to the terms of this Privacy Policy.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">Personal Information</h3>
            <p className="text-slate-600 mb-4">
              We may collect personal information that you voluntarily provide to us when you:
            </p>
            <ul className="text-slate-600 mb-4 list-disc pl-6">
              <li>Create an account</li>
              <li>Place an order</li>
              <li>Sign up for newsletters or promotional materials</li>
              <li>Contact us for support</li>
            </ul>
            <p className="text-slate-600 mb-6">
              The types of personal information we may collect include, but are not limited to:
            </p>
            <ul className="text-slate-600 mb-6 list-disc pl-6">
              <li>Name</li>
              <li>Email address</li>
              <li>Mailing address</li>
              <li>Phone number</li>
              <li>Payment information (credit card, billing address)</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">Non-Personal Information</h3>
            <p className="text-slate-600 mb-4">
              We may collect non-personal information automatically when you visit our Site, including:
            </p>
            <ul className="text-slate-600 mb-6 list-disc pl-6">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Internet service provider</li>
              <li>Pages viewed and the time spent on those pages</li>
              <li>Referencing website</li>
              <li>Device information</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">Cookies and Tracking Technologies</h3>
            <p className="text-slate-600 mb-6">
              Our Site uses cookies and similar tracking technologies to enhance user experience and gather information about visitors. Cookies are small data files that are placed on your device when you visit a website. You can manage your cookie preferences through your browser settings.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">How We Use Your Information</h2>
            <p className="text-slate-600 mb-4">
              We may use the information we collect for various purposes, including:
            </p>
            <ul className="text-slate-600 mb-6 list-disc pl-6">
              <li>To provide and maintain our Services</li>
              <li>To process and fulfill your orders</li>
              <li>To communicate with you, including sending you updates, marketing communications, and service-related information</li>
              <li>To improve our Site and services, including enhancements based on user feedback</li>
              <li>To detect, prevent, and address technical issues or security breaches</li>
              <li>To comply with applicable laws and regulations</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Disclosure of Your Information</h2>
            <p className="text-slate-600 mb-4">
              We do not sell, trade, or otherwise transfer your personal information to outside parties except in the following circumstances:
            </p>
            <ul className="text-slate-600 mb-6 list-disc pl-6">
              <li><strong>Service Providers:</strong> We may share your information with trusted third-party service providers who assist us in operating our Site, conducting our business, or servicing you, as long as those parties agree to keep this information confidential.</li>
              <li><strong>Legal Compliance:</strong> We may disclose your information where we are required by law to do so, or to comply with legal processes, such as a court order or subpoena.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or asset sale, your personal information may be transferred to the new owner.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Data Security</h2>
            <p className="text-slate-600 mb-6">
              We implement reasonable security measures to protect the personal information we collect against unauthorized access, destruction, or alteration. However, no method of transmission over the Internet, or method of electronic storage, is 100% secure. Therefore, we cannot guarantee its absolute security.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Your Rights and Choices</h2>
            <p className="text-slate-600 mb-4">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="text-slate-600 mb-6 list-disc pl-6">
              <li>Request access to your personal information</li>
              <li>Request correction of inaccurate personal information</li>
              <li>Request deletion of your personal information</li>
              <li>Withdraw consent where we rely on your consent to process your information</li>
            </ul>
            <p className="text-slate-600 mb-6">
              To exercise any of these rights, please contact us using the contact information provided below.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Third-Party Links</h2>
            <p className="text-slate-600 mb-6">
              Our Site may contain links to third-party websites. We are not responsible for the privacy practices of those websites. We encourage you to read the privacy policies of any third-party sites you visit.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Changes to This Privacy Policy</h2>
            <p className="text-slate-600 mb-6">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. Your continued use of the Site after any modifications to the Privacy Policy will constitute your acknowledgment of the modifications and your consent to abide by and be bound by the modified policy.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Contact Us</h2>
            <p className="text-slate-600 mb-6">
              If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:Support@Life-Meds.com" className="text-sky-600 hover:text-sky-700 font-medium">Support@Life-Meds.com</a>
            </p>

            <div className="mt-12 p-6 bg-sky-50 rounded-2xl border border-sky-100">
              <p className="text-sm text-slate-600 mb-0">
                Last updated: January 1st, 2026
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}