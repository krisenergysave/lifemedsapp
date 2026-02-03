import React, { useState, useEffect } from 'react';
import authApi from '@/api/authApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Bell, Lock, User, Globe, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import DashboardHeader from '@/components/DashboardHeader';

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 
  'Europe/Paris', 'Asia/Tokyo', 'Asia/Dubai', 'Australia/Sydney'
];

export default function ProfileSettings() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    avatar_url: '',
    timezone: 'UTC',
    push_notifications_enabled: false,
  });
  const [devices, setDevices] = useState([]);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await authApi.me();
        setUser(currentUser);
        setFormData({
          full_name: currentUser.full_name || '',
          avatar_url: currentUser.avatar_url || '',
          timezone: currentUser.timezone || 'UTC',
          push_notifications_enabled: currentUser.push_notifications_enabled || false,
        });

        // Fetch user devices
        const userDevices = await base44.entities.UserDevice.filter({
          user_email: currentUser.email
        });
        setDevices(userDevices);
      } catch (error) {
        toast.error('Failed to load profile');
        console.error(error);
      }
    };
    fetchUser();
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      return authApi.updateMe(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update profile');
      console.error(error);
    },
  });

  const deleteDeviceMutation = useMutation({
    mutationFn: async (deviceId) => {
      return base44.entities.UserDevice.delete(deviceId);
    },
    onSuccess: () => {
      setDevices(devices.filter(d => d.id !== deletingDeviceId));
      toast.success('Device removed');
      setDeletingDeviceId(null);
    },
    onError: () => {
      toast.error('Failed to remove device');
    },
  });

  const [deletingDeviceId, setDeletingDeviceId] = useState(null);

  const handlePushNotifications = async () => {
    try {
      if (!formData.push_notifications_enabled) {
        // Request permission
        const permission = await base44.notifications?.requestPermission?.();
        if (permission === 'granted') {
          const deviceToken = await base44.notifications?.getDeviceToken?.();
          if (deviceToken) {
            // Save device
            await base44.entities.UserDevice.create({
              user_email: user.email,
              device_token: deviceToken,
              device_type: /iPad|iPhone|iPod/.test(navigator.userAgent) ? 'ios' : 'android',
              device_name: navigator.userAgent.split(' ').pop(),
              last_used: new Date().toISOString(),
            });
          }
          setFormData({ ...formData, push_notifications_enabled: true });
          updateProfileMutation.mutate({ push_notifications_enabled: true });
        } else {
          toast.error('Push notification permission denied');
        }
      } else {
        setFormData({ ...formData, push_notifications_enabled: false });
        updateProfileMutation.mutate({ push_notifications_enabled: false });
      }
    } catch (error) {
      toast.error('Failed to manage push notifications');
      console.error(error);
    }
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      full_name: formData.full_name,
      avatar_url: formData.avatar_url,
      timezone: formData.timezone,
    });
  };

  if (!user) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <DashboardHeader user={user} pendingNotifications={0} onNotificationsClick={() => {}} />
      
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
            <p className="text-slate-600 mt-2">Manage your account, security, and preferences</p>
          </div>
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>
          </Link>
        </motion.div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>
          <Card className="p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-sky-600" />
              <h2 className="text-2xl font-bold text-slate-900">Personal Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-slate-700 font-medium">Full Name</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="mt-2"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label className="text-slate-700 font-medium">Email</Label>
                <div className="mt-2 p-3 bg-slate-50 rounded-lg text-slate-600">
                  {user.email}
                </div>
              </div>

              <div>
                <Label className="text-slate-700 font-medium">Avatar URL</Label>
                <Input
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  className="mt-2"
                  placeholder="https://example.com/avatar.jpg"
                />
                {formData.avatar_url && (
                  <img
                    src={formData.avatar_url}
                    alt="Avatar preview"
                    className="mt-4 w-20 h-20 rounded-full object-cover border-2 border-sky-300"
                  />
                )}
              </div>

              <div>
                <Label className="text-slate-700 font-medium">Timezone</Label>
                <Select value={formData.timezone} onValueChange={(tz) => setFormData({ ...formData, timezone: tz })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
                className="bg-sky-600 hover:bg-sky-700 text-white w-full"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Push Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}>
          <Card className="p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-sky-600" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Push Notifications</h3>
                  <p className="text-sm text-slate-600">Receive medication reminders on your device</p>
                </div>
              </div>
              <Switch
                checked={formData.push_notifications_enabled}
                onCheckedChange={handlePushNotifications}
              />
            </div>

            {formData.push_notifications_enabled && devices.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-4">Registered Devices</h4>
                <div className="space-y-3">
                  {devices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{device.device_name || device.device_type}</p>
                        <p className="text-sm text-slate-600">Last used: {new Date(device.last_used).toLocaleDateString()}</p>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setDeletingDeviceId(device.id);
                          deleteDeviceMutation.mutate(device.id);
                        }}
                        disabled={deleteDeviceMutation.isPending}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* 2FA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}>
          <Card className="p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-sky-600" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-slate-600">Add an extra layer of security to your account</p>
                </div>
              </div>
              {user.two_factor_enabled && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Enabled</span>
                </div>
              )}
            </div>

            {!user.two_factor_enabled ? (
              <Button
                onClick={() => setShowTwoFactorSetup(true)}
                className="bg-sky-600 hover:bg-sky-700 text-white w-full"
              >
                Enable 2FA with Authenticator App
              </Button>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">2FA is enabled</p>
                  <p className="text-sm text-blue-700 mt-1">Your account is protected with TOTP authentication.</p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {showTwoFactorSetup && (
          <TwoFactorSetup
            onClose={() => setShowTwoFactorSetup(false)}
            onSuccess={() => {
              setShowTwoFactorSetup(false);
              authApi.me().then(u => setUser(u));
            }}
          />
        )}
      </div>
    </div>
  );
}

function TwoFactorSetup({ onClose, onSuccess }) {
  const [step, setStep] = useState('setup'); // setup, verify, complete
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const generateSecret = async () => {
      try {
        const response = await authApi.generateTOTPSecret();
        setSecret(response.secret);
        setQrCode(response.qrCode);
      } catch (error) {
        toast.error('Failed to generate TOTP secret');
        console.error(error);
      }
    };
    generateSecret();
  }, []);

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      const response = await authApi.verifyTOTPCode({ code, secret });

      if (response.valid) {
        // Save 2FA to user
        const user = await authApi.me();
        await authApi.updateMe({
          two_factor_enabled: true,
          two_factor_method: 'totp',
          two_factor_secret: secret, // In production, encrypt this
        });
        setStep('complete');
        setTimeout(onSuccess, 2000);
      } else {
        toast.error('Invalid verification code');
      }
    } catch (error) {
      toast.error('Verification failed');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full">

        {step === 'setup' && (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Set Up 2FA</h2>
            <p className="text-slate-600 mb-6">Scan this QR code with Google Authenticator or Microsoft Authenticator:</p>
            {qrCode && (
              <div className="flex justify-center mb-6">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 border-4 border-slate-200 rounded-lg" />
              </div>
            )}
            <div className="bg-slate-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-slate-600 mb-2">Or enter manually:</p>
              <code className="text-sm font-mono text-slate-900">{secret}</code>
            </div>
            <Button
              onClick={() => setStep('verify')}
              className="bg-sky-600 hover:bg-sky-700 text-white w-full"
            >
              I've Scanned the Code
            </Button>
          </>
        )}

        {step === 'verify' && (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Verify Code</h2>
            <p className="text-slate-600 mb-6">Enter the 6-digit code from your authenticator app:</p>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              maxLength="6"
              placeholder="000000"
              className="text-center text-2xl tracking-widest mb-6"
            />
            <div className="space-y-3">
              <Button
                onClick={handleVerify}
                disabled={isLoading || code.length !== 6}
                className="bg-sky-600 hover:bg-sky-700 text-white w-full"
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </Button>
              <Button variant="outline" onClick={() => setStep('setup')} className="w-full">
                Back
              </Button>
            </div>
          </>
        )}

        {step === 'complete' && (
          <>
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">2FA Enabled!</h2>
              <p className="text-slate-600">Your account is now protected with two-factor authentication.</p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}