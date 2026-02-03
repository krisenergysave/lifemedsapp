import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Pill } from 'lucide-react';

export default function StepSignup({ formData, updateFormData, nextStep }) {
  const [email, setEmail] = useState(formData.email || '');
  const [password, setPassword] = useState(formData.password || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    
    updateFormData({ email, password });
    
    try {
      const { base44 } = await import('@/api/base44Client');
      
      // Create the user account first using register
      try {
        await base44.auth.register({ email, password });
      } catch (signupErr) {
        if (signupErr.message?.includes('already') || signupErr.message?.includes('exists')) {
          setError('An account with this email already exists. Please sign in instead.');
          setLoading(false);
          return;
        }
        throw signupErr;
      }
      
      // Wait a moment for user to be fully registered
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Now send verification code (user exists now)
      const response = await base44.functions.invoke('sendVerificationCode', { 
        email 
      });
      
      if (response.data.success) {
        nextStep();
      } else {
        setError('Failed to send verification code. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-teal-400 rounded-xl flex items-center justify-center">
          <Pill className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Life-Meds</h1>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-2">Get Started</h2>
      <p className="text-slate-600 mb-8">Create your account to begin your health journey</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="email" className="text-slate-700">Email Address</Label>
          <div className="relative mt-2">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="pl-11 h-12 rounded-xl border-slate-200 focus:border-sky-500"
              required />

          </div>
        </div>

        <div>
          <Label htmlFor="password" className="text-slate-700">Password</Label>
          <div className="relative mt-2">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a secure password"
              className="pl-11 h-12 rounded-xl border-slate-200 focus:border-sky-500"
              required />

          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white rounded-xl font-semibold text-base disabled:opacity-50">

          {loading ? 'Sending code...' : 'Continue'}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{' '}
        <button
          type="button"
          onClick={async () => {
            const { base44 } = await import('@/api/base44Client');
            const { createPageUrl } = await import('@/utils');
            base44.auth.redirectToLogin(createPageUrl('Dashboard'));
          }}
          className="text-sky-600 font-medium hover:text-sky-700">
          Sign in
        </button>
      </p>
    </motion.div>);

}