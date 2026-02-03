import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, ChevronLeft } from 'lucide-react';

export default function StepDOB({ formData, updateFormData, nextStep, prevStep }) {
  const [dateOfBirth, setDateOfBirth] = useState(formData.dateOfBirth || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    updateFormData({ dateOfBirth });
    nextStep();
  };

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

      <div className="w-16 h-16 bg-gradient-to-br from-sky-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
        <Calendar className="w-8 h-8 text-sky-600" />
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">When's your birthday?</h2>
      <p className="text-slate-600 mb-8 text-center">
        This helps us provide age-appropriate health information
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="dob" className="text-slate-700">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="mt-2 h-12 rounded-xl border-slate-200 focus:border-sky-500"
            max={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full h-14 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white rounded-xl font-semibold text-base"
        >
          Continue
        </Button>
      </form>
    </motion.div>
  );
}