import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Pill, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
    { name: 'Features', page: 'Features' },
    { name: 'How-to', page: 'HowTo' },
    { name: 'Testimonials', page: 'Testimonials' }],

    company: [
    { name: 'About Us', page: 'Home' },
    { name: 'Contact', page: 'Contact' }],

    legal: [
    { name: 'Privacy Policy', page: 'Privacy' },
    { name: 'Terms of Service', page: 'Terms' }]

  };

  const socialLinks = [
  { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61587325947440', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: 'https://www.instagram.com/lifemedsapp/', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' }];


  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-teal-400 rounded-xl flex items-center justify-center">
                <Pill className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Life-Meds.com</span>
            </div>
            <p className="text-slate-400 leading-relaxed mb-6 max-w-sm">
              Your trusted companion for medication management. Never miss a dose and take control of your health journey.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) =>
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-10 h-10 bg-slate-800 hover:bg-gradient-to-br hover:from-sky-500 hover:to-teal-500 rounded-xl flex items-center justify-center transition-all duration-300">

                  <social.icon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) =>
              <li key={link.name}>
                  <Link
                  to={createPageUrl(link.page)}
                  className="text-slate-400 hover:text-sky-400 transition-colors">

                    {link.name}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) =>
              <li key={link.name}>
                  <Link
                  to={createPageUrl(link.page)}
                  className="text-slate-400 hover:text-sky-400 transition-colors">

                    {link.name}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Contact</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to={createPageUrl('Contact')}
                  onClick={() => window.scrollTo(0, 0)}
                  className="flex items-center gap-3 text-slate-400 hover:text-sky-400 transition-colors"
                >
                  <Mail className="w-4 h-4 text-sky-400" />
                  <span>support@life-meds.com</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © {currentYear} Life-Meds. All rights reserved.
            </p>
            <div className="flex gap-6">
              {footerLinks.legal.map((link) =>
              <Link
                key={link.name}
                to={createPageUrl(link.page)}
                className="text-slate-500 hover:text-sky-400 text-sm transition-colors">

                  {link.name}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>);

}