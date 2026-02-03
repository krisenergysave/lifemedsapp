import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function DownloadButtons({ size = 'default', className = '' }) {
  return (
    <div className={`flex justify-center ${className}`}>
      {/* Windows PC Button */}
      <Link to={createPageUrl('Onboarding')}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-4 h-20 px-10 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition-colors shadow-xl"
        >
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 5.45V11.45H10.45V3L3 5.45ZM11.55 3V11.45H21V3.73L11.55 3ZM21 12.55H11.55V21L21 20.27V12.55ZM10.45 12.55H3V18.55L10.45 21V12.55Z"/>
          </svg>
          <div className="text-left">
            <div className="text-xs uppercase tracking-wider opacity-80 font-semibold">Download for</div>
            <div className="text-2xl font-bold -mt-0.5">Windows</div>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}