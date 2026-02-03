import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export default function TestimonialCard({ name, role, content, rating, avatar, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <div className="relative bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-sky-200 transition-all duration-500 h-full">
        {/* Quote Icon */}
        <div className="absolute top-6 right-6 w-10 h-10 bg-gradient-to-br from-sky-100 to-teal-100 rounded-xl flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
          <Quote className="w-5 h-5 text-sky-500" />
        </div>

        {/* Rating */}
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
            />
          ))}
        </div>

        {/* Content */}
        <p className="text-slate-600 leading-relaxed mb-6 italic">
          "{content}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-4">
          <img
            src={avatar}
            alt={name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-sky-100"
          />
          <div>
            <h4 className="font-semibold text-slate-800">{name}</h4>
            <p className="text-sm text-slate-500">{role}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}