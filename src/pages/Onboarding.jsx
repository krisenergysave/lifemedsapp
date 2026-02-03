import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import StepSignup from '@/components/onboarding/StepSignup';
import StepVerifyEmail from '@/components/onboarding/StepVerifyEmail';
import StepName from '@/components/onboarding/StepName';
import StepSex from '@/components/onboarding/StepSex';
import StepDOB from '@/components/onboarding/StepDOB';
import StepGoals from '@/components/onboarding/StepGoals';
import StepTrial from '@/components/onboarding/StepTrial';
import ProgressIndicator from '@/components/onboarding/ProgressIndicator';

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Redirect authenticated users to Dashboard (shouldn't reach Onboarding if logged in)
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/session', { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          if (json.authenticated) {
            navigate(createPageUrl('Dashboard'), { replace: true });
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };
    checkAuth();
  }, [navigate]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    sex: '',
    dateOfBirth: '',
    goals: [],
  });

  const totalSteps = 7;

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleComplete = async () => {
    try {
      // Sign in the user using our API
      const loginRes = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      if (!loginRes.ok) {
        const { error } = await loginRes.json().catch(() => ({}));
        throw new Error(error || 'Failed to sign in');
      }

      // Update user profile with collected data
      const updateRes = await fetch('/api/updateMe', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          full_name: `${formData.firstName} ${formData.lastName}`,
          sex: formData.sex,
          date_of_birth: formData.dateOfBirth,
          goals: formData.goals,
          role: 'user',
          subscription_status: 'trial',
          trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        })
      });
      if (!updateRes.ok) {
        const { error } = await updateRes.json().catch(() => ({}));
        throw new Error(error || 'Failed to update profile');
      }

      // Redirect to dashboard
      navigate(createPageUrl('Dashboard'));
    } catch (error) {
      console.error('Onboarding error:', error);
      alert(`Failed to complete signup: ${error.message || 'Unknown error'}. Please try again.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
        
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <StepSignup
              key="signup"
              formData={formData}
              updateFormData={updateFormData}
              nextStep={nextStep}
            />
          )}
          {currentStep === 2 && (
            <StepVerifyEmail
              key="verify"
              formData={formData}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}
          {currentStep === 3 && (
            <StepName
              key="name"
              formData={formData}
              updateFormData={updateFormData}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}
          {currentStep === 4 && (
            <StepSex
              key="sex"
              formData={formData}
              updateFormData={updateFormData}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}
          {currentStep === 5 && (
            <StepDOB
              key="dob"
              formData={formData}
              updateFormData={updateFormData}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}
          {currentStep === 6 && (
            <StepGoals
              key="goals"
              formData={formData}
              updateFormData={updateFormData}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}
          {currentStep === 7 && (
            <StepTrial
              key="trial"
              formData={formData}
              onComplete={handleComplete}
              prevStep={prevStep}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}