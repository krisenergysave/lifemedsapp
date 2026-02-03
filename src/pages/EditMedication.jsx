import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Minus, Pill, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const medicationColors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
];

export default function EditMedication() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const medicationId = urlParams.get('id');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    form: 'tablet',
    frequency: 'once_daily',
    times: ['08:00'],
    start_date: '',
    end_date: '',
    notes: '',
    color: medicationColors[0],
    reminder_enabled: true,
    refill_enabled: false,
    current_supply: '',
    refill_threshold_days: 7,
    pharmacy_name: '',
    pharmacy_phone: ''
  });

  const { data: medication, isLoading } = useQuery({
    queryKey: ['medication', medicationId],
    queryFn: async () => {
      const meds = await base44.entities.Medication.list();
      return meds.find(m => m.id === medicationId);
    },
    enabled: !!medicationId
  });

  const { data: familyMembers = [] } = useQuery({
    queryKey: ['family-members'],
    queryFn: () => base44.entities.FamilyMember.list(),
  });

  useEffect(() => {
    if (medication) {
      setFormData({
        name: medication.name || '',
        dosage: medication.dosage || '',
        form: medication.form || 'tablet',
        frequency: medication.frequency || 'once_daily',
        times: medication.times || ['08:00'],
        start_date: medication.start_date || '',
        end_date: medication.end_date || '',
        notes: medication.notes || '',
        color: medication.color || medicationColors[0],
        reminder_enabled: medication.reminder_enabled !== false,
        family_member_id: medication.family_member_id,
        refill_enabled: medication.refill_enabled || false,
        current_supply: medication.current_supply || '',
        refill_threshold_days: medication.refill_threshold_days || 7,
        pharmacy_name: medication.pharmacy_name || '',
        pharmacy_phone: medication.pharmacy_phone || ''
      });
    }
  }, [medication]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Medication.update(medicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      queryClient.invalidateQueries({ queryKey: ['medication', medicationId] });
      navigate(createPageUrl('MedicationsList'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Medication.delete(medicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      navigate(createPageUrl('MedicationsList'));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Convert local times to UTC
    const timesUTC = formData.times.map(localTime => {
      const [hours, minutes] = localTime.split(':');
      const localDate = new Date();
      localDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // Create date in user's timezone and convert to UTC
      const utcHours = localDate.getUTCHours();
      const utcMinutes = localDate.getUTCMinutes();
      return `${String(utcHours).padStart(2, '0')}:${String(utcMinutes).padStart(2, '0')}`;
    });
    
    const dataToSubmit = {
      name: formData.name,
      dosage: formData.dosage,
      form: formData.form,
      frequency: formData.frequency,
      times: formData.times,
      times_utc: timesUTC,
      user_timezone: userTimezone,
      start_date: formData.start_date,
      color: formData.color,
      reminder_enabled: formData.reminder_enabled
    };
    
    if (formData.end_date) dataToSubmit.end_date = formData.end_date;
    if (formData.notes) dataToSubmit.notes = formData.notes;
    if (formData.family_member_id) dataToSubmit.family_member_id = formData.family_member_id;
    
    if (formData.refill_enabled) {
      dataToSubmit.refill_enabled = true;
      if (formData.current_supply) dataToSubmit.current_supply = formData.current_supply;
      if (formData.refill_threshold_days) dataToSubmit.refill_threshold_days = formData.refill_threshold_days;
      if (formData.pharmacy_name) dataToSubmit.pharmacy_name = formData.pharmacy_name;
      if (formData.pharmacy_phone) dataToSubmit.pharmacy_phone = formData.pharmacy_phone;
    }
    
    updateMutation.mutate(dataToSubmit);
  };

  const addTime = () => {
    setFormData({ ...formData, times: [...formData.times, '12:00'] });
  };

  const removeTime = (index) => {
    const newTimes = formData.times.filter((_, i) => i !== index);
    setFormData({ ...formData, times: newTimes });
  };

  const updateTime = (index, value) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({ ...formData, times: newTimes });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-teal-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!medication) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Medication not found</p>
          <Button onClick={() => navigate(createPageUrl('MedicationsList'))}>
            Back to Medications
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] via-[#F0F9FC] to-white pb-20">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}>
          
          <button
            onClick={() => navigate(createPageUrl('MedicationsList'))}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Medications
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-teal-100 rounded-xl flex items-center justify-center">
                  <Pill className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Edit Medication</h1>
                  <p className="text-slate-600">Update medication details</p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Medication Name *</Label>
                <Input
                  id="name"
                  required
                  list="common-medications"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Aspirin, Lisinopril"
                  className="mt-1"
                />
                <datalist id="common-medications">
                  <option value="Acetaminophen" />
                  <option value="Ibuprofen" />
                  <option value="Amoxicillin" />
                  <option value="Azithromycin" />
                  <option value="Sertraline" />
                  <option value="Escitalopram" />
                  <option value="Lisinopril" />
                  <option value="Amlodipine" />
                  <option value="Atorvastatin" />
                  <option value="Simvastatin" />
                  <option value="Metformin" />
                  <option value="Glipizide" />
                  <option value="Omeprazole" />
                  <option value="Esomeprazole" />
                  <option value="Warfarin" />
                  <option value="Apixaban" />
                  <option value="Levothyroxine" />
                  <option value="Estrogen" />
                  <option value="Albuterol" />
                  <option value="Fluticasone" />
                </datalist>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input
                    id="dosage"
                    required
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g., 10mg, 500mg"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="form">Form</Label>
                  <Select value={formData.form} onValueChange={(value) => setFormData({ ...formData, form: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="capsule">Capsule</SelectItem>
                      <SelectItem value="liquid">Liquid</SelectItem>
                      <SelectItem value="injection">Injection</SelectItem>
                      <SelectItem value="cream">Cream</SelectItem>
                      <SelectItem value="inhaler">Inhaler</SelectItem>
                      <SelectItem value="patch">Patch</SelectItem>
                      <SelectItem value="drops">Drops</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="frequency">Frequency *</Label>
                <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once_daily">Once Daily</SelectItem>
                    <SelectItem value="twice_daily">Twice Daily</SelectItem>
                    <SelectItem value="three_times_daily">Three Times Daily</SelectItem>
                    <SelectItem value="four_times_daily">Four Times Daily</SelectItem>
                    <SelectItem value="every_other_day">Every Other Day</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="as_needed">As Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Reminder Times *</Label>
                <div className="space-y-2 mt-2">
                  {formData.times.map((time, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => updateTime(index, e.target.value)}
                        className="flex-1"
                      />
                      {formData.times.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeTime(index)}>
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTime}
                    className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Time
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date (Optional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              {familyMembers.length > 0 && (
                <div>
                  <Label htmlFor="family_member">For Family Member (Optional)</Label>
                  <Select 
                    value={formData.family_member_id || ''} 
                    onValueChange={(value) => setFormData({ ...formData, family_member_id: value || undefined })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select family member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>For Me</SelectItem>
                      {familyMembers.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} ({member.relationship})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Reminders */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="reminder_enabled"
                    checked={formData.reminder_enabled}
                    onChange={(e) => setFormData({ ...formData, reminder_enabled: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <Label htmlFor="reminder_enabled" className="cursor-pointer">
                    Enable Email Reminders
                  </Label>
                </div>
                <p className="text-xs text-slate-500 ml-6">Receive email notifications at scheduled times</p>
              </div>

              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-2">
                  {medicationColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-xl transition-all ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-slate-900' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Refill Tracking */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="refill_enabled"
                    checked={formData.refill_enabled}
                    onChange={(e) => setFormData({ ...formData, refill_enabled: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <Label htmlFor="refill_enabled" className="cursor-pointer">
                    Enable Refill Reminders
                  </Label>
                </div>

                {formData.refill_enabled && (
                  <div className="space-y-4 ml-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="current_supply">Current Supply (doses)</Label>
                        <Input
                          id="current_supply"
                          type="number"
                          value={formData.current_supply}
                          onChange={(e) => setFormData({ ...formData, current_supply: parseInt(e.target.value) || '' })}
                          placeholder="e.g., 30"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="refill_threshold_days">Remind When (days left)</Label>
                        <Input
                          id="refill_threshold_days"
                          type="number"
                          value={formData.refill_threshold_days}
                          onChange={(e) => setFormData({ ...formData, refill_threshold_days: parseInt(e.target.value) || 7 })}
                          placeholder="7"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pharmacy_name">Pharmacy Name (Optional)</Label>
                        <Input
                          id="pharmacy_name"
                          value={formData.pharmacy_name}
                          onChange={(e) => setFormData({ ...formData, pharmacy_name: e.target.value })}
                          placeholder="e.g., CVS Pharmacy"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pharmacy_phone">Pharmacy Phone (Optional)</Label>
                        <Input
                          id="pharmacy_phone"
                          type="tel"
                          value={formData.pharmacy_phone}
                          onChange={(e) => setFormData({ ...formData, pharmacy_phone: e.target.value })}
                          placeholder="e.g., (555) 123-4567"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special instructions or notes..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl('MedicationsList'))}
                  className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 gradient-cyan text-white hover:opacity-90">
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medication</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {medication.name}? This action cannot be undone and will remove all associated logs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}