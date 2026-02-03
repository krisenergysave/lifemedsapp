import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Minus, Pill, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const medicationColors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
];

export default function AddMedication() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    form: 'tablet',
    frequency: 'once_daily',
    times: ['08:00'],
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: '',
    color: medicationColors[0],
    reminder_enabled: true,
    refill_enabled: false,
    current_supply: '',
    refill_threshold_days: 7,
    pharmacy_name: '',
    pharmacy_phone: '',
    family_member_id: ''
  });

  const { data: familyMembers = [] } = useQuery({
    queryKey: ['family-members'],
    queryFn: () => base44.entities.FamilyMember.list(),
  });

  const { data: masterMedications = [], isLoading: loadingMedications } = useQuery({
    queryKey: ['master-medications'],
    queryFn: () => base44.entities.MasterMedications.list(),
  });

  const filteredMedications = useMemo(() => {
    if (!searchTerm.trim()) return masterMedications;
    const term = searchTerm.toLowerCase();
    return masterMedications.filter(med => 
      med.name.toLowerCase().includes(term) || 
      (med.generic_name && med.generic_name.toLowerCase().includes(term))
    );
  }, [masterMedications, searchTerm]);

  const handleMedicationSelect = (medication) => {
    setFormData({ ...formData, name: medication.name });
    setSearchTerm(medication.name);
    setShowDropdown(false);
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Medication.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      navigate(createPageUrl('Dashboard'));
    },
    onError: (error) => {
      console.error('Error creating medication:', error);
      alert(`Failed to add medication: ${error.message || 'Unknown error'}`);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      alert('Please select a medication from the approved list');
      return;
    }
    
    // Ensure medication is from approved list
    const isApproved = masterMedications.some(med => med.name === formData.name);
    if (!isApproved) {
      alert('Please select a medication from the approved list');
      return;
    }
    if (!formData.dosage.trim()) {
      alert('Please enter the dosage');
      return;
    }
    if (!formData.start_date) {
      alert('Please select a start date');
      return;
    }
    if (formData.times.length === 0) {
      alert('Please add at least one reminder time');
      return;
    }

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

    // Build clean data object
    const dataToSubmit = {
      name: formData.name.trim(),
      dosage: formData.dosage.trim(),
      form: formData.form,
      frequency: formData.frequency,
      times: formData.times,
      times_utc: timesUTC,
      user_timezone: userTimezone,
      start_date: formData.start_date,
      color: formData.color,
      reminder_enabled: formData.reminder_enabled
    };
    
    // Add optional fields only if they have values
    if (formData.end_date) {
      dataToSubmit.end_date = formData.end_date;
    }
    if (formData.notes.trim()) {
      dataToSubmit.notes = formData.notes.trim();
    }
    if (formData.family_member_id) {
      dataToSubmit.family_member_id = formData.family_member_id;
    }
    
    // Add refill tracking fields if enabled
    if (formData.refill_enabled) {
      dataToSubmit.refill_enabled = true;
      
      if (formData.current_supply !== '') {
        const supply = parseInt(formData.current_supply);
        if (!isNaN(supply) && supply > 0) {
          dataToSubmit.current_supply = supply;
        }
      }
      
      const threshold = parseInt(formData.refill_threshold_days);
      if (!isNaN(threshold) && threshold > 0) {
        dataToSubmit.refill_threshold_days = threshold;
      }
      
      if (formData.pharmacy_name.trim()) {
        dataToSubmit.pharmacy_name = formData.pharmacy_name.trim();
      }
      if (formData.pharmacy_phone.trim()) {
        dataToSubmit.pharmacy_phone = formData.pharmacy_phone.trim();
      }
    }

    console.log('Submitting medication:', dataToSubmit);
    createMutation.mutate(dataToSubmit);
  };

  const addTime = () => {
    setFormData({ ...formData, times: [...formData.times, '12:00'] });
  };

  const removeTime = (index) => {
    if (formData.times.length > 1) {
      const newTimes = formData.times.filter((_, i) => i !== index);
      setFormData({ ...formData, times: newTimes });
    }
  };

  const updateTime = (index, value) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({ ...formData, times: newTimes });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] via-[#F0F9FC] to-white pb-20">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}>
          
          <button
            onClick={() => navigate(createPageUrl('Dashboard'))}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-teal-100 rounded-xl flex items-center justify-center">
                <Pill className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Add New Medication</h1>
                <p className="text-slate-600">Enter the details of your medication</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Medication Name */}
              <div className="relative">
                <Label htmlFor="name">Medication Name *</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="name"
                    required
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                      if (!e.target.value.trim()) {
                        setFormData({ ...formData, name: '' });
                      }
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search approved medications..."
                    className="pl-10"
                  />
                </div>

                {showDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {loadingMedications ? (
                      <div className="px-4 py-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600 mb-2"></div>
                        <p className="text-sm text-slate-500">Searching approved list...</p>
                      </div>
                    ) : filteredMedications.length > 0 ? (
                      filteredMedications.map((med) => (
                        <button
                          key={med.id}
                          type="button"
                          onClick={() => handleMedicationSelect(med)}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors">
                          <div className="font-medium text-slate-900">{med.name}</div>
                          {med.generic_name && (
                            <div className="text-xs text-slate-500 mt-0.5">Generic: {med.generic_name}</div>
                          )}
                          {med.category && (
                            <div className="text-xs text-slate-400 mt-0.5">{med.category}</div>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-slate-500">
                        <p className="text-sm">No approved medications found</p>
                        <p className="text-xs mt-1">Try a different search term</p>
                      </div>
                    )}
                  </div>
                )}

                {searchTerm && !formData.name && (
                  <p className="text-xs text-amber-600 mt-1">Please select a medication from the approved list</p>
                )}
              </div>

              {/* Dosage and Form */}
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

              {/* Frequency */}
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

              {/* Times */}
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
                        required
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

              {/* Dates */}
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

              {/* Family Member */}
              {familyMembers.length > 0 && (
                <div>
                  <Label htmlFor="family_member">For Family Member (Optional)</Label>
                  <Select 
                    value={formData.family_member_id} 
                    onValueChange={(value) => setFormData({ ...formData, family_member_id: value === 'me' ? '' : value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="For Me" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="me">For Me</SelectItem>
                      {familyMembers.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} ({member.relationship})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Color Picker */}
              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {medicationColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-xl transition-all ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

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
                          min="0"
                          value={formData.current_supply}
                          onChange={(e) => setFormData({ ...formData, current_supply: e.target.value })}
                          placeholder="e.g., 30"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="refill_threshold_days">Remind When (days left)</Label>
                        <Input
                          id="refill_threshold_days"
                          type="number"
                          min="1"
                          value={formData.refill_threshold_days}
                          onChange={(e) => setFormData({ ...formData, refill_threshold_days: e.target.value })}
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

              {/* Notes */}
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

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl('Dashboard'))}
                  className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 gradient-cyan text-white hover:opacity-90">
                  {createMutation.isPending ? 'Adding...' : 'Add Medication'}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}