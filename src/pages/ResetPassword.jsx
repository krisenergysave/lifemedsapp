import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const email = params.get('email') || '';
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!email || !token) {
      toast.error('Invalid reset link');
      navigate(createPageUrl('Login'));
    }
  }, [email, token, navigate]);

  const handleReset = async (e) => {
    e?.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirm) return toast.error('Passwords do not match');
    setIsLoading(true);

    try {
      const res = await fetch('/api/resetPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Password reset successfully');
        navigate(`${createPageUrl('Login')}?reset=success`);
      } else {
        toast.error(data.error || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset error', err);
      toast.error('Failed to reset password');
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
            <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
            <p className="text-sm text-slate-600 mt-2">Enter a new password for <strong>{email}</strong></p>
          </div>

          <form onSubmit={handleReset} className="space-y-4 mb-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              required
            />
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              required
            />

            <Button type="submit" className="w-full h-12 bg-sky-600 hover:bg-sky-700 text-white font-semibold" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>

        </div>

      </motion.div>
    </div>
  );
}
