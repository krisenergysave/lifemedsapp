import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, ChevronLeft } from 'lucide-react';

export default function StepName({ formData, updateFormData, nextStep, prevStep }) {
  const [firstName, setFirstName] = useState(formData.firstName || '');
  const [lastName, setLastName] = useState(formData.lastName || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    updateFormData({ firstName, lastName });
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
        <User className="w-8 h-8 text-sky-600" />
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">What's your name?</h2>
      <p className="text-slate-600 mb-8 text-center">
        Let's personalize your experience
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="firstName" className="text-slate-700">First Name</Label>
          <Input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            className="mt-2 h-12 rounded-xl border-slate-200 focus:border-sky-500"
            required
          />
        </div>

        <div>
          <Label htmlFor="lastName" className="text-slate-700">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            className="mt-2 h-12 rounded-xl border-slate-200 focus:border-sky-500"
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