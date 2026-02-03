import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Search, Users, Edit, Calendar, CreditCard, 
  Crown, AlertCircle, Check, X, Loader2, Trash2, Pill 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { format, addDays, addMonths, addYears } from 'date-fns';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [sortBy, setSortBy] = useState('email');

  // Modal form state
  const [planType, setPlanType] = useState('trial');
  const [billingMethod, setBillingMethod] = useState('stripe'); // 'stripe' or 'manual'
  const [duration, setDuration] = useState('30'); // days
  const [customDate, setCustomDate] = useState('');
  const [userRole, setUserRole] = useState('user');

  useEffect(() => {
    base44.auth.me().then(user => {
      if (!user || user.role !== 'admin') {
        navigate(createPageUrl('Dashboard'));
        return;
      }
      setCurrentUser(user);
      // Update last_seen
      base44.auth.updateMe({ last_seen: new Date().toISOString() }).catch(console.error);
    });
  }, [navigate]);

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const response = await base44.functions.invoke('listAllUsers');
      return response.data.users || [];
    },
    enabled: !!currentUser && currentUser.role === 'admin',
    retry: 1
  });

  // Log any errors
  useEffect(() => {
    if (error) {
      console.error('Query error:', error);
      toast.error('Failed to load users');
    }
  }, [error]);

  const updatePlanMutation = useMutation({
    mutationFn: async (data) => {
      return base44.functions.invoke('adminUpdateUserPlan', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      toast.success('User plan updated successfully');
      setShowModal(false);
      resetModalForm();
    },
    onError: (error) => {
      const errorMsg = error?.response?.data?.error || error?.message || 'Failed to update user permissions. Please check the Activity Monitor.';
      toast.error(`Error: ${errorMsg}`);
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (email) => {
      return base44.functions.invoke('adminDeleteUser', { user_email: email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      toast.success('User deleted successfully');
      setShowDeleteDialog(false);
      setUserToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    }
  });

  const resetModalForm = () => {
    setPlanType('trial');
    setBillingMethod('stripe');
    setDuration('30');
    setCustomDate('');
    setUserRole('user');
    setSelectedUser(null);
  };

  const handleManageUser = (user) => {
    setSelectedUser(user);
    setPlanType(user.current_plan || 'trial');
    setBillingMethod(user.manual_override ? 'manual' : 'stripe');
    setUserRole(user.role || 'user');
    setShowModal(true);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.email);
    }
  };

  const handleSubmitPlanUpdate = () => {
    if (!selectedUser) return;

    const data = {
      user_email: selectedUser.email,
      plan_type: planType,
      billing_method: billingMethod,
      role: userRole
    };

    if (billingMethod === 'manual') {
      if (customDate) {
        data.access_expires_at = new Date(customDate).toISOString();
      } else {
        const durationDays = parseInt(duration);
        if (durationDays === 9999) {
          // Lifetime
          data.access_expires_at = addYears(new Date(), 100).toISOString();
        } else {
          data.access_expires_at = addDays(new Date(), durationDays).toISOString();
        }
      }
    }

    updatePlanMutation.mutate(data);
  };

  const filteredUsers = users
    .filter(user => 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'email') return (a.email || '').localeCompare(b.email || '');
      if (sortBy === 'plan') return (a.current_plan || '').localeCompare(b.current_plan || '');
      if (sortBy === 'status') return (a.subscription_status || '').localeCompare(b.subscription_status || '');
      return 0;
    });

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      trial: 'bg-blue-100 text-blue-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      none: 'bg-slate-100 text-slate-800'
    };
    return styles[status] || styles.none;
  };

  // Calculate stats
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.subscription_status === 'active').length,
    trialUsers: users.filter(u => u.subscription_status === 'trial').length,
    expiredUsers: users.filter(u => u.subscription_status === 'expired').length,
    mrr: users
      .filter(u => u.subscription_status === 'active' && u.current_plan === 'monthly')
      .length * 4.99 +
      users
        .filter(u => u.subscription_status === 'active' && u.current_plan === 'yearly')
        .length * 4.16
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] via-[#F0F9FC] to-white pb-20">

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user account for <strong>{userToDelete?.email}</strong>.
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteUserMutation.isPending}>
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Manage User Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage User Plan</DialogTitle>
            <DialogDescription>
              Update subscription plan for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* User Role */}
            <div className="space-y-2">
              <Label>User Role</Label>
              <Select 
                value={userRole} 
                onValueChange={setUserRole}
                disabled={selectedUser?.email === currentUser?.email}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              {selectedUser?.email === currentUser?.email && (
                <p className="text-xs text-amber-600">You cannot change your own role</p>
              )}
            </div>

            {/* Plan Type */}
            <div className="space-y-2">
              <Label>Plan Type</Label>
              <Select value={planType} onValueChange={setPlanType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="monthly">Monthly ($4.99/mo)</SelectItem>
                  <SelectItem value="yearly">Yearly ($49.99/yr)</SelectItem>
                  <SelectItem value="none">No Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Billing Method */}
            <div className="space-y-2">
              <Label>Billing Method</Label>
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={billingMethod === 'manual'}
                    onCheckedChange={(checked) => setBillingMethod(checked ? 'manual' : 'stripe')}
                  />
                  <Label className="cursor-pointer">
                    {billingMethod === 'stripe' ? 'Bill via Stripe' : 'Manual Override (Free)'}
                  </Label>
                </div>
                {billingMethod === 'stripe' && (
                  <CreditCard className="w-4 h-4 text-sky-600" />
                )}
                {billingMethod === 'manual' && (
                  <Crown className="w-4 h-4 text-amber-600" />
                )}
              </div>
            </div>

            {/* Duration (only for manual override) */}
            {billingMethod === 'manual' && (
              <div className="space-y-2">
                <Label>Access Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="90">3 Months</SelectItem>
                    <SelectItem value="180">6 Months</SelectItem>
                    <SelectItem value="365">1 Year</SelectItem>
                    <SelectItem value="9999">Lifetime</SelectItem>
                  </SelectContent>
                </Select>

                <div className="mt-4">
                  <Label>Or set custom expiration date</Label>
                  <Input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="mt-2"
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <p className="text-sm text-amber-900">
                      Manual override will grant free access and bypass Stripe billing. This action will be logged.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {billingMethod === 'stripe' && planType !== 'trial' && planType !== 'none' && (
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <CreditCard className="w-5 h-5 text-sky-600 flex-shrink-0" />
                  <p className="text-sm text-sky-900">
                    This will create a Stripe invoice or send a payment link to the user's email.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitPlanUpdate}
              disabled={updatePlanMutation.isPending}
              className="gradient-cyan text-white">
              {updatePlanMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Plan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate(createPageUrl('Dashboard'))}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">Total Users</span>
              <Users className="w-5 h-5 text-sky-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">Active</span>
              <Check className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.activeUsers}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">Trial</span>
              <Crown className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.trialUsers}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">Expired</span>
              <X className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.expiredUsers}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">MRR</span>
              <CreditCard className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">${stats.mrr.toFixed(2)}</p>
          </motion.div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">User Management</h1>
              <p className="text-slate-600">Manage user subscriptions and access</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl('MasterMedications'))}
                className="flex items-center gap-2">
                <Pill className="w-4 h-4" />
                Master Medications
              </Button>
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg">
                <Crown className="w-5 h-5" />
                <span className="font-semibold">Admin Panel</span>
              </div>
            </div>
          </div>

          {/* Search and Sort */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Sort by Email</SelectItem>
                <SelectItem value="plan">Sort by Plan</SelectItem>
                <SelectItem value="status">Sort by Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Table */}
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-4" />
              <p className="text-slate-600">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Expires</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Last Seen</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-slate-900">{user.full_name || 'N/A'}</p>
                          <p className="text-sm text-slate-600">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {user.role === 'admin' ? (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                            Admin
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                            User
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="capitalize text-slate-900">
                          {user.current_plan === 'none' ? 'No plan' : user.current_plan || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(user.subscription_status)}`}>
                          {user.subscription_status || 'none'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {user.manual_override ? (
                          <div className="flex items-center gap-1 text-amber-600">
                            <Crown className="w-4 h-4" />
                            <span className="text-xs font-semibold">Manual</span>
                          </div>
                        ) : user.stripe_subscription_id ? (
                          <div className="flex items-center gap-1 text-sky-600">
                            <CreditCard className="w-4 h-4" />
                            <span className="text-xs font-semibold">Stripe</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600">
                        {user.access_expires_at 
                          ? format(new Date(user.access_expires_at), 'MMM d, yyyy')
                          : user.trial_end_date
                          ? format(new Date(user.trial_end_date), 'MMM d, yyyy')
                          : '—'}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600">
                        {user.last_seen 
                          ? format(new Date(user.last_seen), 'MMM d, yyyy')
                          : '—'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleManageUser(user)}
                            className="text-sky-600 hover:text-sky-700">
                            <Edit className="w-4 h-4 mr-1" />
                            Manage
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(user)}
                            disabled={user.email === currentUser?.email}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No users found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}