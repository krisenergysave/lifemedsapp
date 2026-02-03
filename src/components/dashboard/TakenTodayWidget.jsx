import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CircleCheck, CircleAlert, CircleX } from 'lucide-react';

export default function TakenTodayWidget() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  // Fetch caregiver links to get linked patients
  const { data: caregiverLinks = [] } = useQuery({
    queryKey: ['caregiver-links'],
    queryFn: () => base44.entities.CaregiverLink.filter({ 
      caregiver_email: currentUser?.email,
      status: 'active'
    }),
    enabled: !!currentUser,
  });

  // Fetch family members to get patient details
  const { data: familyMembers = [] } = useQuery({
    queryKey: ['family-members-for-caregiver'],
    queryFn: () => base44.entities.FamilyMember.list(),
    enabled: caregiverLinks.length > 0,
  });

  // Fetch all medications for user and linked patients
  const { data: medications = [], refetch: refetchMedications } = useQuery({
    queryKey: ['medications-adherence'],
    queryFn: async () => {
      const userMeds = await base44.entities.Medication.filter({ created_by: currentUser?.email });
      
      // Get medications for linked patients
      const linkedPatientIds = caregiverLinks.map(link => link.patient_family_member_id);
      const linkedMeds = userMeds.filter(med => linkedPatientIds.includes(med.family_member_id));
      
      return userMeds;
    },
    enabled: !!currentUser,
  });

  // Fetch today's logs
  const { data: logs = [], refetch: refetchLogs } = useQuery({
    queryKey: ['logs-today-adherence'],
    queryFn: async () => {
      const allLogs = await base44.entities.MedicationLog.list();
      const today = new Date().toDateString();
      return allLogs.filter(log => new Date(log.scheduled_time).toDateString() === today);
    },
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribeLogs = base44.entities.MedicationLog.subscribe((event) => {
      refetchLogs();
    });

    const unsubscribeMeds = base44.entities.Medication.subscribe((event) => {
      refetchMedications();
    });

    return () => {
      unsubscribeLogs();
      unsubscribeMeds();
    };
  }, []);

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
  });

  const totalToday = todaySchedule.length;
  const takenToday = todaySchedule.filter(s => s.status === 'taken').length;
  
  // Determine icon and color based on progress
  const getStatusDisplay = () => {
    if (totalToday === 0) {
      return {
        icon: CircleCheck,
        color: 'text-slate-400',
        bgColor: 'bg-slate-100'
      };
    }
    
    if (takenToday === 0) {
      return {
        icon: CircleX,
        color: 'text-red-500',
        bgColor: 'bg-red-50'
      };
    }
    
    if (takenToday < totalToday) {
      return {
        icon: CircleAlert,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50'
      };
    }
    
    return {
      icon: CircleCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    };
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-600 text-sm">Taken Today</span>
        <div className={`w-8 h-8 rounded-full ${statusDisplay.bgColor} flex items-center justify-center`}>
          <StatusIcon className={`w-5 h-5 ${statusDisplay.color}`} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-slate-900">{takenToday}</p>
        {totalToday > 0 && (
          <span className="text-lg text-slate-500">/ {totalToday}</span>
        )}
      </div>
      {totalToday > 0 && (
        <p className="text-xs text-slate-500 mt-1">
          {takenToday === totalToday ? 'All done!' : `${totalToday - takenToday} remaining`}
        </p>
      )}
    </motion.div>
  );
}