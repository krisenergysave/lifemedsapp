import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import entitiesApi from '@/api/entitiesApi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Pill, Calendar, TrendingUp, FileText, 
  Plus, Edit, Trash2, Shield, Bell, AlertCircle,
  Check, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, isToday, parseISO } from 'date-fns';
import CaregiverLinkManager from '../components/family/CaregiverLinkManager';

export default function FamilyMemberDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const memberId = searchParams.get('id');
  const queryClient = useQueryClient();
  
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [editingObservation, setEditingObservation] = useState(null);
  const [observationForm, setObservationForm] = useState({
    observation_type: 'general_note',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    severity: null
  });

  const { data: member, isLoading: loadingMember } = useQuery({
    queryKey: ['family-member', memberId],
    queryFn: async () => {
      const members = await entitiesApi.filter('FamilyMember', { id: memberId });
      return (members && members.length) ? members[0] : null;
    },
    enabled: !!memberId
  });

  const { data: medications = [] } = useQuery({
    queryKey: ['family-medications', memberId],
    queryFn: () => entitiesApi.filter('Medication', { family_member_id: memberId }),
    enabled: !!memberId
  });

  const { data: observations = [] } = useQuery({
    queryKey: ['family-observations', memberId],
    queryFn: () => entitiesApi.filter('FamilyObservation', { family_member_id: memberId }),
    enabled: !!memberId
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['family-logs', memberId],
    queryFn: async () => {
      const medIds = medications.map(m => m.id);
      if (medIds.length === 0) return [];
      return entitiesApi.filter('MedicationLog', {});
    },
    enabled: medications.length > 0
  });

  const createObservationMutation = useMutation({
    mutationFn: (data) => entitiesApi.create('FamilyObservation', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-observations', memberId] });
      setShowObservationModal(false);
      resetObservationForm();
    }
  });

  const updateObservationMutation = useMutation({
    mutationFn: ({ id, data }) => entitiesApi.update('FamilyObservation', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-observations', memberId] });
      setShowObservationModal(false);
      resetObservationForm();
      setEditingObservation(null);
    }
  });

  const deleteObservationMutation = useMutation({
    mutationFn: (id) => entitiesApi.delete('FamilyObservation', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-observations', memberId] });
    }
  });

  const updateMemberMutation = useMutation({
    mutationFn: (data) => entitiesApi.update('FamilyMember', memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-member', memberId] });
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
    }
  });

  const resetObservationForm = () => {
    setObservationForm({
      observation_type: 'general_note',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      severity: null
    });
  };

  const handleSaveObservation = () => {
    const data = {
      ...observationForm,
      family_member_id: memberId
    };
    
    if (!data.severity) delete data.severity;
    
    if (editingObservation) {
      updateObservationMutation.mutate({ id: editingObservation.id, data });
    } else {
      createObservationMutation.mutate(data);
    }
  };

  const handleEditObservation = (obs) => {
    setEditingObservation(obs);
    setObservationForm({
      observation_type: obs.observation_type,
      title: obs.title,
      description: obs.description,
      date: obs.date,
      severity: obs.severity || null
    });
    setShowObservationModal(true);
  };

  const todayLogs = logs.filter(log => {
    const med = medications.find(m => m.id === log.medication_id);
    return med && isToday(parseISO(log.scheduled_time));
  });

  const adherenceRate = todayLogs.length > 0 
    ? Math.round((todayLogs.filter(l => l.status === 'taken').length / todayLogs.length) * 100)
    : 0;

  const accessLevelLabels = {
    view_only: 'View Only',
    edit: 'Can Edit',
    full_access: 'Full Access'
  };

  const observationTypeColors = {
    general_note: 'bg-blue-100 text-blue-800',
    symptom: 'bg-orange-100 text-orange-800',
    side_effect: 'bg-red-100 text-red-800',
    improvement: 'bg-green-100 text-green-800',
    concern: 'bg-purple-100 text-purple-800'
  };

  if (loadingMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] via-[#F0F9FC] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] via-[#F0F9FC] to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Family member not found</p>
          <Button onClick={() => navigate(createPageUrl('FamilyMembers'))}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] via-[#F0F9FC] to-white pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate(createPageUrl('FamilyMembers'))}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Family Members
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: member.avatar_color }}>
                {member.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{member.name}</h1>
                <div className="flex items-center gap-2">
                  <p className="text-slate-600 capitalize">{member.relationship.replace('_', ' ')}</p>
                  <Badge className={member.role === 'caregiver' ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'}>
                    {member.role || 'patient'}
                  </Badge>
                </div>
                {member.date_of_birth && (
                  <p className="text-sm text-slate-500 mt-1">
                    Born: {format(parseISO(member.date_of_birth), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className={member.notification_enabled ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}>
                <Bell className="w-3 h-3 mr-1" />
                {member.notification_enabled ? 'Notifications On' : 'Notifications Off'}
              </Badge>
              <Badge className="bg-sky-100 text-sky-800">
                <Shield className="w-3 h-3 mr-1" />
                {accessLevelLabels[member.access_level]}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">Active Medications</span>
              <Pill className="w-5 h-5 text-sky-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{medications.length}</p>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">Today's Adherence</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{adherenceRate}%</p>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">Observations</span>
              <FileText className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{observations.length}</p>
          </Card>
        </div>

        {/* Caregiver Management */}
        {(member.role === 'patient' || !member.role) && (
          <Card className="p-6 bg-white mb-8">
            <CaregiverLinkManager familyMember={member} />
          </Card>
        )}

        {/* Access & Notifications Settings */}
        <Card className="p-6 bg-white mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Access & Notifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Access Level</Label>
              <Select 
                value={member.access_level} 
                onValueChange={(value) => updateMemberMutation.mutate({ access_level: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view_only">View Only - Can only see information</SelectItem>
                  <SelectItem value="edit">Can Edit - Can update medications and logs</SelectItem>
                  <SelectItem value="full_access">Full Access - Can add, edit, and delete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Email Notifications</Label>
              <div className="flex items-center gap-4 mt-2">
                <Button
                  variant={member.notification_enabled ? "default" : "outline"}
                  onClick={() => updateMemberMutation.mutate({ notification_enabled: !member.notification_enabled })}
                  className={member.notification_enabled ? "gradient-cyan text-white" : ""}>
                  <Bell className="w-4 h-4 mr-2" />
                  {member.notification_enabled ? 'Enabled' : 'Disabled'}
                </Button>
                {member.notification_enabled && (
                  <Input
                    type="email"
                    placeholder="Email for notifications"
                    value={member.email || ''}
                    onChange={(e) => updateMemberMutation.mutate({ email: e.target.value })}
                    className="flex-1"
                  />
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Medications */}
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Medications</h2>
              <Button 
                size="sm" 
                onClick={() => navigate(createPageUrl('AddMedication') + `?family_member_id=${memberId}`)}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            {medications.length === 0 ? (
              <div className="text-center py-8">
                <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 text-sm">No medications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medications.map(med => (
                  <div 
                    key={med.id}
                    className="p-4 rounded-lg border border-slate-200 hover:border-sky-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: med.color + '20' }}>
                        <Pill className="w-5 h-5" style={{ color: med.color }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{med.name}</h3>
                        <p className="text-sm text-slate-600">{med.dosage} • {med.frequency.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Observations */}
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Health Observations</h2>
              <Button 
                size="sm"
                onClick={() => {
                  resetObservationForm();
                  setEditingObservation(null);
                  setShowObservationModal(true);
                }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </div>

            {observations.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 text-sm">No observations yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {observations.sort((a, b) => new Date(b.date) - new Date(a.date)).map(obs => (
                  <motion.div
                    key={obs.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={observationTypeColors[obs.observation_type]}>
                          {obs.observation_type.replace('_', ' ')}
                        </Badge>
                        {obs.severity && (
                          <Badge variant="outline" className={
                            obs.severity === 'high' ? 'border-red-300 text-red-700' :
                            obs.severity === 'medium' ? 'border-orange-300 text-orange-700' :
                            'border-slate-300 text-slate-700'
                          }>
                            {obs.severity}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditObservation(obs)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600"
                          onClick={() => deleteObservationMutation.mutate(obs.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">{obs.title}</h3>
                    <p className="text-sm text-slate-600 mb-2">{obs.description}</p>
                    <p className="text-xs text-slate-500">
                      {format(parseISO(obs.date), 'MMM d, yyyy')}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Observation Modal */}
      <Dialog open={showObservationModal} onOpenChange={setShowObservationModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingObservation ? 'Edit' : 'Add'} Observation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <Select 
                value={observationForm.observation_type}
                onValueChange={(value) => setObservationForm({ ...observationForm, observation_type: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general_note">General Note</SelectItem>
                  <SelectItem value="symptom">Symptom</SelectItem>
                  <SelectItem value="side_effect">Side Effect</SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                  <SelectItem value="concern">Concern</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {['symptom', 'side_effect', 'concern'].includes(observationForm.observation_type) && (
              <div>
                <Label>Severity</Label>
                <Select 
                  value={observationForm.severity || ''}
                  onValueChange={(value) => setObservationForm({ ...observationForm, severity: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={observationForm.date}
                onChange={(e) => setObservationForm({ ...observationForm, date: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Title</Label>
              <Input
                value={observationForm.title}
                onChange={(e) => setObservationForm({ ...observationForm, title: e.target.value })}
                placeholder="Brief description"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={observationForm.description}
                onChange={(e) => setObservationForm({ ...observationForm, description: e.target.value })}
                placeholder="Detailed notes..."
                className="mt-2"
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowObservationModal(false);
                  resetObservationForm();
                  setEditingObservation(null);
                }}
                className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSaveObservation}
                disabled={!observationForm.title || !observationForm.description}
                className="flex-1 gradient-cyan text-white">
                {editingObservation ? 'Update' : 'Save'} Observation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}