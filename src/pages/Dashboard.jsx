import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  Plus, Bell, Calendar, TrendingUp, Users, 
  Check, X, Clock, Pill, ChevronRight, CloudOff, Wifi, RefreshCw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, isToday, parseISO, isBefore, isAfter } from 'date-fns';
import RefillAlerts from '../components/dashboard/RefillAlerts';
import SubscriptionGuard from '../components/SubscriptionGuard';
import HealthInsights from '../components/health/HealthInsights';
import FeedbackDialog from '../components/dashboard/FeedbackDialog';
import DashboardHeader from '../components/DashboardHeader';
import CaregiverMonitor from '../components/dashboard/CaregiverMonitor';
import TakenTodayWidget from '../components/dashboard/TakenTodayWidget';
import { useSyncEngine } from '../components/hooks/useSyncEngine';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  
  // Offline-first sync engine
  const syncEngine = useSyncEngine();

  useEffect(() => {
    base44.auth.me().then(async (currentUser) => {
      setUser(currentUser);
      // Update last_seen timestamp
      if (currentUser) {
        try {
          await base44.auth.updateMe({ last_seen: new Date().toISOString() });
        } catch (error) {
          console.error('Failed to update last_seen:', error);
        }
      }
    });

    // Register service worker for offline support (web only)
    if ('serviceWorker' in navigator && !window.Capacitor) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    }
    
    // Initialize native app features if on mobile
    if (window.Capacitor) {
      import('../components/utils/nativeBridge').then(({ initializeApp }) => {
        initializeApp();
      });
    }
  }, []);

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.Medication.list('-created_date'),
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['logs-today'],
    queryFn: async () => {
      // Load logs using offline-first sync engine
      return await syncEngine.loadMedicationLogs();
    },
  });

  const { data: familyMembers = [] } = useQuery({
    queryKey: ['family-members'],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      return base44.entities.FamilyMember.filter({ created_by: currentUser.email });
    },
  });

  const { data: healthData = [] } = useQuery({
    queryKey: ['health-data-recent'],
    queryFn: () => base44.entities.HealthTracker.list('-measured_at', 100),
  });

  const logMutation = useMutation({
    mutationFn: (logData) => syncEngine.createMedicationLog(logData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs-today'] });
    },
  });

  const updateLogMutation = useMutation({
    mutationFn: ({ id, data }) => syncEngine.updateMedicationLog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs-today'] });
    },
  });

  // Calculate today's schedule
  const todaySchedule = medications.flatMap(med => {
    if (!med.times || med.times.length === 0) return [];
    
    return med.times.map(time => {
      const [hours, minutes] = time.split(':');
      const scheduledTime = new Date();
      scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const existingLog = logs.find(log => 
        log.medication_id === med.id && 
        new Date(log.scheduled_time).toDateString() === scheduledTime.toDateString() &&
        new Date(log.scheduled_time).getHours() === scheduledTime.getHours()
      );

      return {
        medication: med,
        scheduledTime,
        time,
        log: existingLog,
        status: existingLog?.status || 'pending'
      };
    });
  }).sort((a, b) => a.scheduledTime - b.scheduledTime);

  const handleMarkTaken = async (scheduleItem) => {
    let logResult;
    if (scheduleItem.log) {
      logResult = await updateLogMutation.mutateAsync({
        id: scheduleItem.log.id,
        data: {
          status: 'taken',
          taken_at: new Date().toISOString()
        }
      });
    } else {
      logResult = await logMutation.mutateAsync({
        medication_id: scheduleItem.medication.id,
        scheduled_time: scheduleItem.scheduledTime.toISOString(),
        status: 'taken',
        taken_at: new Date().toISOString()
      });
    }

    // Notify caregivers
    try {
      await base44.functions.invoke('notifyCaregivers', {
        medicationLog: scheduleItem.log || logResult,
        medication: scheduleItem.medication,
        familyMemberId: scheduleItem.medication.family_member_id || 'self',
        eventType: 'taken'
      });
    } catch (error) {
      console.error('Failed to notify caregivers:', error);
    }
  };

  const handleMarkSkipped = async (scheduleItem) => {
    if (scheduleItem.log) {
      await updateLogMutation.mutateAsync({
        id: scheduleItem.log.id,
        data: { status: 'skipped' }
      });
    } else {
      await logMutation.mutateAsync({
        medication_id: scheduleItem.medication.id,
        scheduled_time: scheduleItem.scheduledTime.toISOString(),
        status: 'skipped'
      });
    }
  };

  const stats = {
    totalMedications: medications.length,
    todayDoses: todaySchedule.length,
    takenToday: todaySchedule.filter(s => s.status === 'taken').length,
    adherenceRate: todaySchedule.length > 0 
      ? Math.round((todaySchedule.filter(s => s.status === 'taken').length / todaySchedule.length) * 100)
      : 0
  };

  return (
    <SubscriptionGuard>
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
      <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] via-[#F0F9FC] to-white pb-20">
      
      {/* Offline/Sync Status Bar */}
      {(!syncEngine.isOnline || syncEngine.pendingSyncCount > 0) && (
        <div className={`${
          !syncEngine.isOnline ? 'bg-orange-500' : 'bg-blue-500'
        } text-white py-2 px-4`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!syncEngine.isOnline ? (
                <>
                  <CloudOff className="w-4 h-4" />
                  <span className="text-sm font-medium">You're offline - Changes will sync when connection is restored</span>
                </>
              ) : syncEngine.isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Syncing data...</span>
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm font-medium">{syncEngine.pendingSyncCount} item(s) pending sync</span>
                </>
              )}
            </div>
            {syncEngine.isOnline && syncEngine.pendingSyncCount > 0 && !syncEngine.isSyncing && (
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => syncEngine.syncData()}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Sync Now
              </Button>
            )}
          </div>
        </div>
      )}
      
      <DashboardHeader
        user={user}
        pendingNotifications={todaySchedule.filter(s => s.status === 'pending').length}
        onFeedbackClick={() => setFeedbackOpen(true)}
        onNotificationsClick={() => window.location.href = createPageUrl('Reminders')}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">Active Medications</span>
              <Pill className="w-5 h-5 text-sky-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.totalMedications}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">Today's Doses</span>
              <Calendar className="w-5 h-5 text-teal-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.todayDoses}</p>
          </motion.div>

          <TakenTodayWidget />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">Adherence Rate</span>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.adherenceRate}%</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2 space-y-6">
              {/* Caregiver Monitor */}
              <CaregiverMonitor />

              {/* Health Insights */}
              <HealthInsights healthData={healthData} />

              {/* Refill Alerts */}
              <RefillAlerts medications={medications} />
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Today's Schedule</h2>
                <Link to={createPageUrl('AddMedication')}>
                  <Button className="gradient-cyan text-white hover:opacity-90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medication
                  </Button>
                </Link>
              </div>

              {todaySchedule.length === 0 ? (
                <div className="text-center py-12">
                  <Pill className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">No medications scheduled yet</p>
                  <Link to={createPageUrl('AddMedication')}>
                    <Button variant="outline">Add Your First Medication</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {todaySchedule.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        item.status === 'taken' 
                          ? 'bg-green-50 border-green-200' 
                          : item.status === 'skipped'
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-white border-slate-200 hover:border-sky-300'
                      }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: item.medication.color + '20' }}>
                            <Pill className="w-6 h-6" style={{ color: item.medication.color }} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900">{item.medication.name}</h3>
                              {item.log?.isOffline && (
                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                  <CloudOff className="w-3 h-3" />
                                  Pending Sync
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">{item.medication.dosage} • {item.time}</p>
                          </div>
                        </div>
                        
                        {item.status === 'pending' ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleMarkTaken(item)}
                              className="bg-green-500 hover:bg-green-600">
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkSkipped(item)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : item.status === 'taken' ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <Check className="w-5 h-5" />
                            <span className="text-sm font-medium">Taken</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-400">
                            <X className="w-5 h-5" />
                            <span className="text-sm font-medium">Skipped</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link to={createPageUrl('MedicationsList')}>
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#E0F7FA] to-[#B2EBF2] hover:from-[#B2EBF2] hover:to-[#80DEEA] transition-all">
                    <div className="flex items-center gap-3">
                      <Pill className="w-5 h-5 text-[#00BCD4]" />
                      <span className="font-medium text-slate-900">My Medications</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                </Link>

                <Link to={createPageUrl('HealthTrackers')}>
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-slate-900">Health Trackers</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                </Link>

                <Link to={createPageUrl('Appointments')}>
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-slate-900">Appointments</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                </Link>

                <Link to={createPageUrl('Progress')}>
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-slate-900">Progress</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                </Link>

                <Link to={createPageUrl('FamilyMembers')}>
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 transition-all">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-rose-600" />
                      <span className="font-medium text-slate-900">Family Members</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                </Link>

                <Link to={createPageUrl('Reminders')}>
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 transition-all">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-slate-900">Medication Reminders</span>
                    </div>
                    {todaySchedule.filter(s => s.status === 'pending').length > 0 && (
                      <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                        {todaySchedule.filter(s => s.status === 'pending').length}
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                </Link>

                <Link to={createPageUrl('Subscription')}>
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 transition-all">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-violet-600" />
                      <span className="font-medium text-slate-900">Subscription</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                </Link>

                {user?.role === 'admin' && (
                  <Link to={createPageUrl('AdminDashboard')}>
                    <button className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 transition-all border-2 border-slate-300">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-slate-700" />
                        <span className="font-medium text-slate-900">User Management</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </button>
                  </Link>
                )}
                </div>
                </div>

            {familyMembers.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Family Members</h2>
                <div className="space-y-3">
                  {familyMembers.slice(0, 3).map(member => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: member.avatar_color }}>
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-600 capitalize">{member.relationship}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          </div>
          </div>

          {/* Footer Links */}
          <div className="border-t border-slate-200 mt-12">
          <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-500">
            <Link to={createPageUrl('Privacy')} className="hover:text-sky-600 transition-colors">
              Privacy Policy
            </Link>
            <Link to={createPageUrl('Terms')} className="hover:text-sky-600 transition-colors">
              Terms of Service
            </Link>
          </div>
          </div>
          </div>
          </div>
          </SubscriptionGuard>
          );
          }