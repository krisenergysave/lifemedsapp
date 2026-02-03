import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function StepSex({ formData, updateFormData, nextStep, prevStep }) {
  const [sex, setSex] = useState(formData.sex || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sex) {
      updateFormData({ sex });
      nextStep();
    }
  };

  const options = [
    { value: 'male', label: 'Male', emoji: '👨' },
    { value: 'female', label: 'Female', emoji: '👩' },
    { value: 'other', label: 'Other', emoji: '🧑' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say', emoji: '🙋' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
    >
      <button
        onClick={prevStep}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>

      <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">What's your sex?</h2>
      <p className="text-slate-600 mb-8 text-center">
        This helps us provide personalized health recommendations
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSex(option.value)}
              className={`p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                sex === option.value
                  ? 'border-sky-500 bg-sky-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-3xl">{option.emoji}</span>
              <span className="font-medium text-slate-900">{option.label}</span>
            </button>
          ))}
        </div>

        <Button
          type="submit"
          disabled={!sex}
          className="w-full h-14 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white rounded-xl font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </Button>
      </form>
    </motion.div>
  );
}