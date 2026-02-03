import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import GoogleLoginButton from '@/components/Auth/GoogleLoginButton';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await base44.auth.loginViaEmailPassword(email, password);
      toast.success('Signed in successfully');
      navigate(createPageUrl('Dashboard'));
    } catch (err) {
      console.error('Login error', err);

      // If server indicates 2FA is required, redirect to Verify2FA with email in state
      const needs2FA = err?.data?.extra_data?.reason === '2fa_required'
        || err?.data?.extra_data?.requires_totp
        || err?.data?.extra_data?.two_factor_required
        || err?.status === 412;

      if (needs2FA) {
        navigate(createPageUrl('Verify2FA'), { state: { email } });
        return;
      }

      if (err?.status === 401) {
        toast.error('Invalid email or password');
      } else {
        toast.error('Sign-in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-sky-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Sign in to Life-Meds</h1>
            <p className="text-sm text-slate-600 mt-2">Use your account email and password, or sign in with Google.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />

            <Button type="submit" className="w-full h-12 bg-sky-600 hover:bg-sky-700 text-white font-semibold" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="my-4 text-center">
            <span className="text-sm text-slate-500">or</span>
            <GoogleLoginButton />
          </div>

          <div className="mt-6 text-center text-sm text-slate-600">
            <p>
              Don't have an account? <a href={createPageUrl('Onboarding')} className="text-sky-600 font-semibold">Create one</a>
            </p>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
