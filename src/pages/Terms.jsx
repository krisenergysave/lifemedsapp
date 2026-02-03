import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { FileText, ArrowLeft } from 'lucide-react';

export default function Terms() {
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
              <FileText className="w-8 h-8 text-sky-600" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Terms and Conditions
            </h1>
            <p className="text-lg text-slate-600">
              Effective Date: January 1st, 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-lg prose-slate max-w-none">
            
            <p className="lead text-slate-600 mb-8">
              Welcome to Life-Meds! By accessing or using our website (life-meds.com), you agree to abide by these Terms and Conditions. If you do not agree with any part of these terms, please refrain from using our services.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">1. Use of Our Services</h2>
            <p className="text-slate-600 mb-6">
              Life-Meds provides online access to health and wellness products and resources. You agree to use our services only for lawful purposes and in a manner that does not infringe upon the rights of others.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">2. Eligibility</h2>
            <p className="text-slate-600 mb-6">
              You must be at least 18 years of age or have the consent of a parent or guardian to use our site. By using our services, you confirm that you meet this requirement.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">3. Account Responsibility</h2>
            <p className="text-slate-600 mb-6">
              If you create an account with us, you are responsible for maintaining the confidentiality of your account credentials and for any activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">4. Privacy Policy</h2>
            <p className="text-slate-600 mb-6">
              Your privacy is important to us. Please review our Privacy Policy, which explains how we collect, use, and protect your personal information.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">5. Product Information</h2>
            <p className="text-slate-600 mb-6">
              While we strive to provide accurate product descriptions and information, we do not guarantee that the content on our website is complete, reliable, or error-free. We reserve the right to modify our offerings at any time without prior notice.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">6. Payment and Orders</h2>
            <p className="text-slate-600 mb-6">
              All transactions conducted through our website are subject to acceptance by Life-Meds. We reserve the right to refuse or cancel any order for reasons including product availability, errors in product information, or suspected fraud.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">7. Intellectual Property</h2>
            <p className="text-slate-600 mb-6">
              All content on our website, including text, graphics, logos, and images, is the property of Life-Meds or third parties and is protected by intellectual property laws. You may not use, reproduce, or distribute any content without our explicit consent.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">8. Limitation of Liability</h2>
            <p className="text-slate-600 mb-6">
              Life-Meds shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of our services. Our liability is limited to the fullest extent permitted by law.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">9. Indemnification</h2>
            <p className="text-slate-600 mb-6">
              You agree to indemnify and hold Life-Meds, its affiliates, and their respective officers, directors, employees, and agents harmless from any claims, losses, damages, liabilities, or expenses (including reasonable attorney's fees) arising out of your use of our services or violation of these Terms and Conditions.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">10. Modification of Terms</h2>
            <p className="text-slate-600 mb-6">
              Life-Meds reserves the right to modify these Terms and Conditions at any time. We will notify you of significant changes through our website. Your continued use of our services after such changes constitutes your acceptance of the modified terms.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">11. Governing Law</h2>
            <p className="text-slate-600 mb-6">
              These Terms and Conditions shall be governed by and construed in accordance with the laws of the applicable jurisdiction. Any disputes arising from the use of our services shall be subject to the exclusive jurisdiction of the courts in that jurisdiction.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">12. Contact Us</h2>
            <p className="text-slate-600 mb-6">
              If you have any questions or concerns regarding these Terms and Conditions, please contact us at <a href="mailto:support@life-meds.com" className="text-sky-600 hover:text-sky-700 font-medium">support@life-meds.com</a>.
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