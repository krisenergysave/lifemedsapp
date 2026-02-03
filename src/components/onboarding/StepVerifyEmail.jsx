import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ChevronLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function StepVerifyEmail({ formData, nextStep, prevStep }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await base44.functions.invoke('verifyCode', { 
        email: formData.email, 
        code 
      });
      
      if (response.data.success) {
        nextStep();
      } else {
        setError(response.data.error || 'Invalid or expired verification code');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired verification code');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    
    try {
      const response = await base44.functions.invoke('sendVerificationCode', { 
        email: formData.email 
      });
      
      if (response.data.success) {
        alert('New verification code sent!');
      } else {
        setError('Failed to resend code');
      }
    } catch (err) {
      setError('Failed to resend code');
      console.error(err);
    } finally {
      setResending(false);
    }
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
        <Mail className="w-8 h-8 text-sky-600" />
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">Verify Your Email</h2>
      <p className="text-slate-600 mb-8 text-center">
        We sent a verification code to <strong>{formData.email}</strong>
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="code" className="text-slate-700">Verification Code</Label>
          <Input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            className="mt-2 h-12 rounded-xl border-slate-200 focus:border-sky-500 text-center text-lg tracking-widest"
            maxLength={6}
            required
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        <Button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full h-14 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white rounded-xl font-semibold text-base disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify & Continue'}
        </Button>

        <p className="text-center text-sm text-slate-500">
          Didn't receive the code?{' '}
          <button 
            type="button" 
            onClick={handleResend}
            disabled={resending}
            className="text-sky-600 font-medium hover:text-sky-700 disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Resend'}
          </button>
        </p>
      </form>
    </motion.div>
  );
}