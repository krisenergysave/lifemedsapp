import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, ListChecks, Activity, ChevronLeft } from 'lucide-react';

export default function StepGoals({ formData, updateFormData, nextStep, prevStep }) {
  const [goals, setGoals] = useState(formData.goals || []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (goals.length > 0) {
      updateFormData({ goals });
      nextStep();
    }
  };

  const toggleGoal = (goalValue) => {
    setGoals((prev) =>
    prev.includes(goalValue) ?
    prev.filter((g) => g !== goalValue) :
    [...prev, goalValue]
    );
  };

  const goalOptions = [
  { value: 'medication-reminders', label: 'Medication Reminders', icon: Bell },
  { value: 'track-medication', label: 'Track if I took the medication', icon: CheckCircle },
  { value: 'list-meds', label: 'Keep a list of my meds', icon: ListChecks },
  { value: 'track-side-effects', label: 'Track side effects/symptoms', icon: Activity }];


  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">

      <button
        onClick={prevStep}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors">

        <ChevronLeft className="w-5 h-5" />
        Back
      </button>

      <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">What do you hope to achieve with 
Life Meds?
      </h2>
      <p className="text-slate-600 mb-8 text-center">
        Select all that apply
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3">
          {goalOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = goals.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleGoal(option.value)}
                className={`p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                isSelected ?
                'border-sky-500 bg-sky-50' :
                'border-slate-200 hover:border-slate-300'}`
                }>

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isSelected ? 'bg-sky-500' : 'bg-slate-100'}`
                }>
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                </div>
                <span className="font-medium text-slate-900 flex-1">{option.label}</span>
                {isSelected &&
                <div className="w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white fill-white" />
                  </div>
                }
              </button>);

          })}
        </div>

        <Button
          type="submit"
          disabled={goals.length === 0}
          className="w-full h-14 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white rounded-xl font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed">

          Continue
        </Button>
      </form>
    </motion.div>);

}