import React from 'react';
import { useQuery } from '@tanstack/react-query';
import entitiesApi from '@/api/entitiesApi';
import { motion } from 'framer-motion';
import { Users, Bell, Check, X, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

export default function CaregiverMonitor() {
  const { data: caregiverLinks = [] } = useQuery({
    queryKey: ['caregiver-links'],
    queryFn: () => entitiesApi.filter('CaregiverLink', { status: 'active' }),
  });

  const { data: familyMembers = [] } = useQuery({
    queryKey: ['family-members'],
    queryFn: () => entitiesApi.list('FamilyMember'),
  });

  const { data: allMedications = [] } = useQuery({
    queryKey: ['all-medications-caregiver'],
    queryFn: () => entitiesApi.list('Medication', { sort: '-created_date' }),
    enabled: caregiverLinks.length > 0,
  });

  const { data: allLogs = [] } = useQuery({
    queryKey: ['all-logs-caregiver'],
    queryFn: () => entitiesApi.list('MedicationLog', { sort: '-scheduled_time', limit: 50 }),
    enabled: caregiverLinks.length > 0,
  });

  if (caregiverLinks.length === 0) {
    return null;
  }

  // Get patient family member IDs we're monitoring
  const monitoredPatientIds = caregiverLinks.map(link => link.patient_family_member_id);

  // Filter medications for monitored patients
  const monitoredMedications = allMedications.filter(med => 
    monitoredPatientIds.includes(med.family_member_id || 'self')
  );

  // Get recent activity for monitored patients
  const recentActivity = allLogs
    .filter(log => {
      const medication = allMedications.find(m => m.id === log.medication_id);
      return medication && monitoredPatientIds.includes(medication.family_member_id || 'self');
    })
    .slice(0, 10);

  const getPatientName = (familyMemberId) => {
    if (familyMemberId === 'self') return 'You';
    const member = familyMembers.find(m => m.id === familyMemberId);
    return member?.name || 'Patient';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'taken':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'missed':
        return <X className="w-4 h-4 text-red-500" />;
      case 'skipped':
        return <X className="w-4 h-4 text-slate-400" />;
      default:
        return <Clock className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'taken':
        return 'bg-green-50 border-green-200';
      case 'missed':
        return 'bg-red-50 border-red-200';
      case 'skipped':
        return 'bg-slate-50 border-slate-200';
      default:
        return 'bg-orange-50 border-orange-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Caregiver Monitor</h2>
            <p className="text-sm text-slate-600">Monitoring {monitoredPatientIds.length} patient{monitoredPatientIds.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Link to={createPageUrl('FamilyMembers')}>
          <Button variant="outline" size="sm">
            Manage
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-700">
            {recentActivity.filter(a => a.status === 'taken').length}
          </div>
          <div className="text-xs text-green-600">Taken</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4">
          <div className="text-2xl font-bold text-orange-700">
            {recentActivity.filter(a => a.status === 'pending').length}
          </div>
          <div className="text-xs text-orange-600">Pending</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4">
          <div className="text-2xl font-bold text-red-700">
            {recentActivity.filter(a => a.status === 'missed').length}
          </div>
          <div className="text-xs text-red-600">Missed</div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Recent Activity
        </h3>
        
        {recentActivity.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentActivity.map((log) => {
              const medication = allMedications.find(m => m.id === log.medication_id);
              if (!medication) return null;

              const patientName = getPatientName(medication.family_member_id);
              const scheduledTime = new Date(log.scheduled_time);

              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border ${getStatusColor(log.status)} flex items-center gap-3`}>
                  {getStatusIcon(log.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {patientName} - {medication.name}
                    </p>
                    <p className="text-xs text-slate-600">
                      {medication.dosage} • {format(scheduledTime, 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <div className="text-xs font-medium capitalize text-slate-600">
                    {log.status}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}