import React, { useState, useEffect } from 'react';
import authApi from '@/api/authApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bell, Check, X, Clock, Pill, AlertCircle, Mail, Smartphone, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { format, isToday, isPast, parseISO } from 'date-fns';
import { toast } from 'sonner';
import entitiesApi from '@/api/entitiesApi';

export default function Reminders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'taken'
  const [user, setUser] = useState(null);
  const [showSettings, setShowSettings] = useState(true);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    in_app: true
  });

  useEffect(() => {
    authApi.me().then((currentUser) => {
      setUser(currentUser);
      // Load notification preferences from user metadata
      if (currentUser.notification_settings) {
        setNotificationSettings(currentUser.notification_settings);
      }
    });
  }, []);

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => entitiesApi.list('Medication', { sort: '-created_date' }),
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['logs-today'],
    queryFn: async () => {
      const res = await entitiesApi.filter('MedicationLog', {});
      return res || [];
    },
  });

  const updateLogMutation = useMutation({
    mutationFn: ({ id, data }) => entitiesApi.update('MedicationLog', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs-today'] });
    },
  });

  const createLogMutation = useMutation({
    mutationFn: (logData) => entitiesApi.create('MedicationLog', logData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs-today'] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => authApi.updateMe(data),
    onSuccess: () => {
      toast.success('Notification settings updated');
    },
    onError: () => {
      toast.error('Failed to update settings');
    }
  });

  // Generate today's schedule
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

      const now = new Date();
      const isOverdue = scheduledTime < now && (!existingLog || existingLog.status === 'pending');
      const isUpcoming = scheduledTime > now;

      return {
        medication: med,
        scheduledTime,
        time,
        log: existingLog,
        status: existingLog?.status || 'pending',
        isOverdue,
        isUpcoming
      };
    });
  }).sort((a, b) => a.scheduledTime - b.scheduledTime);

  const handleMarkTaken = async (scheduleItem) => {
    if (scheduleItem.log) {
      await updateLogMutation.mutateAsync({
        id: scheduleItem.log.id,
        data: {
          status: 'taken',
          taken_at: new Date().toISOString()
        }
      });
    } else {
      await createLogMutation.mutateAsync({
        medication_id: scheduleItem.medication.id,
        scheduled_time: scheduleItem.scheduledTime.toISOString(),
        status: 'taken',
        taken_at: new Date().toISOString()
      });
    }
  };

  const handleMarkSkipped = async (scheduleItem) => {
    if (scheduleItem.log) {
      await updateLogMutation.mutateAsync({
        id: scheduleItem.log.id,
        data: { status: 'skipped' }
      });
    } else {
      await createLogMutation.mutateAsync({
        medication_id: scheduleItem.medication.id,
        scheduled_time: scheduleItem.scheduledTime.toISOString(),
        status: 'skipped'
      });
    }
  };

  const filteredSchedule = todaySchedule.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'pending') return item.status === 'pending';
    if (filter === 'taken') return item.status === 'taken';
    return true;
  });

  const pendingCount = todaySchedule.filter(s => s.status === 'pending').length;
  const overdueCount = todaySchedule.filter(s => s.isOverdue).length;
  const takenCount = todaySchedule.filter(s => s.status === 'taken').length;

  const toggleNotificationMethod = (method) => {
    const updatedSettings = {
      ...notificationSettings,
      [method]: !notificationSettings[method]
    };
    setNotificationSettings(updatedSettings);
    updateUserMutation.mutate({ notification_settings: updatedSettings });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] via-[#F0F9FC] to-white pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(createPageUrl('Dashboard'))}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">Medication Reminders</h1>
                  {overdueCount > 0 && (
                    <Badge className="bg-red-500 text-white">
                      {overdueCount} Overdue
                    </Badge>
                  )}
                </div>
                <p className="text-slate-600 text-sm mt-1">Today's medication schedule</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2">
              {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showSettings ? 'Hide' : 'Show'} Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Notification Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 overflow-hidden">
              <Card className="p-6 bg-white">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-sky-600" />
                  Notification Settings
                </h3>
                
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Choose how you want to receive medication reminders
                  </p>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => toggleNotificationMethod('email')}
                      className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                        notificationSettings.email
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-slate-200 bg-white'
                      }`}>
                      <Mail className="w-5 h-5 text-sky-600" />
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">Email Notifications</div>
                        <div className="text-xs text-slate-500">Receive reminders via email</div>
                      </div>
                      <Switch
                        checked={notificationSettings.email}
                        onCheckedChange={() => toggleNotificationMethod('email')}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleNotificationMethod('push')}
                      className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                        notificationSettings.push
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-slate-200 bg-white'
                      }`}>
                      <Smartphone className="w-5 h-5 text-purple-600" />
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">Push Notifications</div>
                        <div className="text-xs text-slate-500">Instant mobile alerts</div>
                      </div>
                      <Switch
                        checked={notificationSettings.push}
                        onCheckedChange={() => toggleNotificationMethod('push')}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleNotificationMethod('in_app')}
                      className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                        notificationSettings.in_app
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-slate-200 bg-white'
                      }`}>
                      <Bell className="w-5 h-5 text-teal-600" />
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">In-App Notifications</div>
                        <div className="text-xs text-slate-500">View reminders in the app</div>
                      </div>
                      <Switch
                        checked={notificationSettings.in_app}
                        onCheckedChange={() => toggleNotificationMethod('in_app')}
                      />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
                <p className="text-xs text-slate-600">Pending</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{overdueCount}</p>
                <p className="text-xs text-slate-600">Overdue</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{takenCount}</p>
                <p className="text-xs text-slate-600">Taken</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
            className={filter === 'pending' ? 'gradient-cyan text-white' : ''}>
            Pending ({pendingCount})
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'gradient-cyan text-white' : ''}>
            All ({todaySchedule.length})
          </Button>
          <Button
            variant={filter === 'taken' ? 'default' : 'outline'}
            onClick={() => setFilter('taken')}
            className={filter === 'taken' ? 'gradient-cyan text-white' : ''}>
            Taken ({takenCount})
          </Button>
        </div>

        {/* Schedule List */}
        {filteredSchedule.length === 0 ? (
          <Card className="p-12 text-center bg-white">
            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-2">No {filter} reminders</p>
            <p className="text-sm text-slate-500">You're all caught up!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredSchedule.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className={`p-5 transition-all ${
                    item.isOverdue && item.status === 'pending'
                      ? 'bg-red-50 border-2 border-red-200' 
                      : item.status === 'taken'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white hover:shadow-md'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: item.medication.color + '20' }}>
                          <Pill className="w-7 h-7" style={{ color: item.medication.color }} />
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{item.medication.name}</h3>
                            {item.isOverdue && item.status === 'pending' && (
                              <Badge className="bg-red-500 text-white text-xs">Overdue</Badge>
                            )}
                            {item.isUpcoming && item.status === 'pending' && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">Upcoming</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">{item.medication.dosage}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <p className="text-sm text-slate-600">
                              {format(item.scheduledTime, 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {item.status === 'pending' ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleMarkTaken(item)}
                            disabled={updateLogMutation.isPending || createLogMutation.isPending}
                            className="bg-green-500 hover:bg-green-600 text-white">
                            <Check className="w-4 h-4 mr-1" />
                            Take
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkSkipped(item)}
                            disabled={updateLogMutation.isPending || createLogMutation.isPending}>
                            <X className="w-4 h-4 mr-1" />
                            Skip
                          </Button>
                        </div>
                      ) : item.status === 'taken' ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <Check className="w-6 h-6" />
                          <span className="text-sm font-medium">Taken</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400">
                          <X className="w-6 h-6" />
                          <span className="text-sm font-medium">Skipped</span>
                        </div>
                      )}
                    </div>
                    
                    {item.medication.notes && item.status === 'pending' && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Note:</span> {item.medication.notes}
                        </p>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}