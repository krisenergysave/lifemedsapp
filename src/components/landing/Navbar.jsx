import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Menu, X, Pill } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const DEFAULT_LOGO = '🏥';
const DEFAULT_APP_NAME = 'Life-Meds.com';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [projectConfig, setProjectConfig] = useState(null);
  const [logoError, setLogoError] = useState(false);

  const handleSignIn = () => {
    base44.auth.redirectToLogin();
  };

  useEffect(() => {
    const fetchAppSettings = async () => {
      try {
        const settings = await base44.entities.AppSettings.list();
        if (settings && settings.length > 0) {
          setProjectConfig(settings[0]);
        }
      } catch (error) {
        console.warn('Failed to fetch app settings:', error);
      }
    };
    fetchAppSettings();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
  { name: 'Home', page: 'Home' },
  { name: 'Features', page: 'Features' },
  { name: 'How-to', page: 'HowTo' },
  { name: 'FAQs', page: 'FAQs' },
  { name: 'Contact', page: 'Contact' }];


  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled ?
      'bg-white/80 backdrop-blur-xl shadow-lg shadow-sky-100/50' :
      'bg-transparent'}`
      }>

      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to={createPageUrl('Home')} className="flex items-center gap-3 group">
            {projectConfig?.logo_url && !logoError ? (
              <img
                src={projectConfig.logo_url}
                alt={projectConfig?.app_name || DEFAULT_APP_NAME}
                onError={() => setLogoError(true)}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-teal-400 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 text-lg font-bold">
                  {DEFAULT_LOGO}
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-sky-400 to-teal-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
              </div>
            )}
            <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-teal-600 bg-clip-text text-transparent">
              {projectConfig?.app_name || DEFAULT_APP_NAME}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
            <Link
              key={link.name}
              to={createPageUrl(link.page)}
              className="relative px-4 py-2 text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors group">

                {link.name}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-sky-500 to-teal-500 group-hover:w-3/4 transition-all duration-300 rounded-full" />
              </Link>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleSignIn}
              className="px-5 py-2 text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors">
              Sign In
            </button>
            <Link
              to={createPageUrl('Onboarding')}
              className="relative inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-500 to-teal-500 text-white text-sm font-semibold rounded-full overflow-hidden group">

              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-sky-600 transition-colors">

            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen &&
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100">

            <div className="px-6 py-4 space-y-1">
              {navLinks.map((link) =>
            <Link
              key={link.name}
              to={createPageUrl(link.page)}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all">

                  {link.name}
                </Link>
            )}
              <button
              onClick={() => { setIsMobileMenuOpen(false); handleSignIn(); }}
              className="block w-full px-4 py-3 mt-4 border-2 border-sky-200 text-slate-900 text-center font-semibold rounded-xl hover:bg-sky-50 transition-colors">
                Sign In
              </button>
              <Link
              to={createPageUrl('Onboarding')}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block mt-2 px-4 py-3 bg-gradient-to-r from-sky-500 to-teal-500 text-white text-center font-semibold rounded-xl">

                Get Started
              </Link>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </motion.header>);

}