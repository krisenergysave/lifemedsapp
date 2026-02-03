import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AddAppointment() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    doctor_name: '',
    appointment_type: 'checkup',
    appointment_date: '',
    appointment_time: '',
    location: '',
    phone: '',
    notes: ''
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Appointment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      navigate(createPageUrl('Appointments'));
    },
    onError: (error) => {
      console.error('Error creating appointment:', error);
      alert(`Failed to schedule appointment: ${error.message || 'Unknown error'}`);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.doctor_name.trim()) {
      alert('Please enter the doctor\'s name');
      return;
    }
    if (!formData.appointment_date) {
      alert('Please select a date');
      return;
    }
    if (!formData.appointment_time) {
      alert('Please select a time');
      return;
    }

    const dateTimeString = `${formData.appointment_date}T${formData.appointment_time}:00`;
    
    const dataToSubmit = {
      doctor_name: formData.doctor_name.trim(),
      appointment_type: formData.appointment_type,
      appointment_date: dateTimeString
    };
    
    if (formData.location.trim()) {
      dataToSubmit.location = formData.location.trim();
    }
    if (formData.phone.trim()) {
      dataToSubmit.phone = formData.phone.trim();
    }
    if (formData.notes.trim()) {
      dataToSubmit.notes = formData.notes.trim();
    }

    console.log('Submitting appointment:', dataToSubmit);
    createMutation.mutate(dataToSubmit);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] via-[#F0F9FC] to-white pb-20">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}>
          
          <button
            onClick={() => navigate(createPageUrl('Appointments'))}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Appointments
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 gradient-cyan-light rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[#00BCD4]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Schedule Appointment</h1>
                <p className="text-slate-600">Add a new medical appointment</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="doctor_name">Doctor/Provider Name *</Label>
                <Input
                  id="doctor_name"
                  required
                  value={formData.doctor_name}
                  onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                  placeholder="e.g., Dr. Smith"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="appointment_type">Appointment Type *</Label>
                <Select value={formData.appointment_type} onValueChange={(value) => setFormData({ ...formData, appointment_type: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkup">Checkup</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="procedure">Procedure</SelectItem>
                    <SelectItem value="lab_work">Lab Work</SelectItem>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="vaccination">Vaccination</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appointment_date">Date *</Label>
                  <Input
                    id="appointment_date"
                    type="date"
                    required
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="appointment_time">Time *</Label>
                  <Input
                    id="appointment_time"
                    type="time"
                    required
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., 123 Main St, Suite 100"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g., (555) 123-4567"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special instructions or reminders..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl('Appointments'))}
                  className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 gradient-cyan text-white hover:opacity-90">
                  {createMutation.isPending ? 'Scheduling...' : 'Schedule Appointment'}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}