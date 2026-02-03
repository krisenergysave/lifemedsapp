import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';

import GoogleLoginButton from '@/components/Auth/GoogleLoginButton';
import { useSearchParams } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password UI state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const [searchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get('reset') === 'success') {
      toast.success('Password has been reset. Please sign in.');
    }
  }, [searchParams]);

  const handleSendPasswordReset = async () => {
    if (!forgotEmail) return toast.error('Please enter your email');
    try {
      const res = await fetch('/api/sendPasswordReset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('If an account exists, a reset email has been sent');
        setForgotOpen(false);
        setForgotEmail('');
      } else {
        toast.error(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      console.error('Send reset error', err);
      toast.error('Failed to send reset email');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        if (data.requires2FA || res.status === 412) {
          navigate(createPageUrl('Verify2FA'), { state: { email } });
          return;
        }
        toast.success('Signed in successfully');
        navigate(createPageUrl('Dashboard'));
        return;
      }

      if (res.status === 401) {
        toast.error('Invalid email or password');
      } else if (data && data.error) {
        toast.error(data.error);
      } else {
        toast.error('Sign-in failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error', err);
      toast.error('Sign-in failed. Please try again.');
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

            <div className="flex items-center justify-between">
              <Button type="submit" className="w-auto h-12 bg-sky-600 hover:bg-sky-700 text-white font-semibold" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>

              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-sm text-sky-600 hover:text-sky-700 font-semibold">
                Forgot password?
              </button>
            </div>
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

          {/* Forgot password modal */}
          {forgotOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="absolute inset-0 bg-black/40" onClick={() => setForgotOpen(false)} />
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm z-10">
                <h3 className="text-lg font-semibold mb-2">Reset your password</h3>
                <p className="text-sm text-slate-600 mb-4">Enter your email and we'll send a secure reset link.</p>
                <div className="space-y-3">
                  <Input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button onClick={() => setForgotOpen(false)} variant="ghost">Cancel</Button>
                    <Button onClick={handleSendPasswordReset} className="bg-sky-600 text-white">Send</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
}
