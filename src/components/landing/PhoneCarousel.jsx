import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PhoneCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const screens = [
    {
      title: 'Dashboard',
      description: 'Track your daily medication schedule at a glance',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=800&fit=crop'
    },
    {
      title: 'Health Trackers',
      description: 'Monitor your health metrics with beautiful charts',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=800&fit=crop'
    },
    {
      title: 'Family Members',
      description: 'Manage medications for your entire family',
      image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=800&fit=crop'
    },
    {
      title: 'Appointments',
      description: 'Never miss a doctor appointment again',
      image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=800&fit=crop'
    },
    {
      title: 'Add Medication',
      description: 'Easy and intuitive medication setup',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=800&fit=crop'
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % screens.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + screens.length) % screens.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Phone Mockup Container */}
      <div className="relative flex items-center justify-center">
        {/* Previous Button */}
        <button
          onClick={prevSlide}
          className="absolute left-0 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors"
          aria-label="Previous screen"
        >
          <ChevronLeft className="w-6 h-6 text-slate-700" />
        </button>

        {/* Phone Frame */}
        <div className="relative w-80 mx-auto">
          {/* Phone Bezel */}
          <div className="relative bg-slate-900 rounded-[3rem] p-3 shadow-2xl">
            {/* Top Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-slate-900 rounded-b-3xl z-10" />
            
            {/* Screen */}
            <div className="relative bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19.5]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  src={screens[currentIndex].image}
                  alt={screens[currentIndex].title}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
          </div>

          {/* Phone Shadow */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-teal-500/20 rounded-[3rem] blur-3xl -z-10 scale-95" />
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className="absolute right-0 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors"
          aria-label="Next screen"
        >
          <ChevronRight className="w-6 h-6 text-slate-700" />
        </button>
      </div>

      {/* Screen Info */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mt-8"
      >
        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          {screens[currentIndex].title}
        </h3>
        <p className="text-slate-600">
          {screens[currentIndex].description}
        </p>
      </motion.div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-8">
        {screens.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-sky-500'
                : 'w-2 bg-slate-300 hover:bg-slate-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}