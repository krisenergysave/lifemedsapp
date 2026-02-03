import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Verify2FA() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');

  // Get the email from location state (passed from Login)
  const userEmail = location.state?.email;

  useEffect(() => {
    if (!userEmail) {
      navigate(createPageUrl('Home'), { replace: true });
    }
  }, [userEmail, navigate]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call backend function to verify TOTP
      const response = await base44.functions.invoke('verifyUserTOTP', {
        email: userEmail,
        code,
      });

      if (response.data.valid) {
        toast.success('Authentication successful!');
        // Redirect to dashboard
        navigate(createPageUrl('Dashboard'), { replace: true });
      } else {
        setAttempts(attempts + 1);
        setError('Invalid code. Please try again.');
        setCode('');

        if (attempts >= 4) {
          toast.error('Too many failed attempts. Please try logging in again.');
          setTimeout(() => navigate(createPageUrl('Home'), { replace: true }), 3000);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Verification failed. Please try again.');
      toast.error('Verification error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleVerify();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-sky-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Verify Your Identity</h1>
            <p className="text-slate-600 mt-2">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          {/* Code Input */}
          <div className="space-y-4 mb-6">
            <Input
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                setCode(value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              placeholder="000000"
              maxLength="6"
              className="text-center text-3xl tracking-widest font-mono font-bold"
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">{error}</p>
                <p className="text-sm text-red-700 mt-1">
                  Attempts remaining: {5 - attempts}
                </p>
              </div>
            </motion.div>
          )}

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={isLoading || code.length !== 6}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold h-12"
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>

          {/* Help Text */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-600 text-center">
              Can't access your authenticator app?{' '}
              <button
                onClick={() => navigate(createPageUrl('Home'), { replace: true })}
                className="text-sky-600 hover:text-sky-700 font-semibold"
              >
                Sign in again
              </button>
            </p>
          </div>
        </div>

        {/* Security Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-slate-100">
          <p className="text-xs text-slate-600 text-center">
            🔒 Your code is never stored on our servers. This verification is for your security only.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}