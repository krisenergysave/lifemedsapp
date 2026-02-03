import React, { useState } from 'react';
import entitiesApi from '@/api/entitiesApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Activity, Droplet, Scale, Gauge, Thermometer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AddHealthEntry() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    tracker_type: 'weight',
    value: '',
    systolic: '',
    diastolic: '',
    notes: '',
    measured_at: new Date().toISOString().slice(0, 16)
  });

  const trackerTypes = [
    { id: 'weight', label: 'Weight', icon: Scale, color: '#00BCD4', unit: 'lbs', placeholder: '150' },
    { id: 'blood_pressure', label: 'Blood Pressure', icon: Heart, color: '#E91E63', unit: 'mmHg', placeholder: '120/80' },
    { id: 'heart_rate', label: 'Heart Rate', icon: Activity, color: '#FF5722', unit: 'bpm', placeholder: '72' },
    { id: 'glucose', label: 'Blood Sugar', icon: Droplet, color: '#9C27B0', unit: 'mg/dL', placeholder: '100' },
    { id: 'pain_level', label: 'Pain Level', icon: Gauge, color: '#FF9800', unit: '/10', placeholder: '5' },
    { id: 'temperature', label: 'Temperature', icon: Thermometer, color: '#4CAF50', unit: '°F', placeholder: '98.6' },
    { id: 'steps', label: 'Steps', icon: Activity, color: '#10b981', unit: 'steps', placeholder: '8000' },
    { id: 'sleep_hours', label: 'Sleep Hours', icon: Activity, color: '#6366f1', unit: 'hours', placeholder: '7.5' },
    { id: 'exercise_minutes', label: 'Exercise Minutes', icon: Activity, color: '#14b8a6', unit: 'min', placeholder: '30' },
    { id: 'water_intake', label: 'Water Intake', icon: Droplet, color: '#06b6d4', unit: 'glasses', placeholder: '8' },
    { id: 'calories', label: 'Calories Burned', icon: Activity, color: '#f59e0b', unit: 'cal', placeholder: '2000' },
    { id: 'oxygen_saturation', label: 'Oxygen Saturation', icon: Activity, color: '#84cc16', unit: '%', placeholder: '98' }
  ];

  const selectedTracker = trackerTypes.find(t => t.id === formData.tracker_type);

  const createMutation = useMutation({
    mutationFn: (data) => entitiesApi.create('HealthTracker', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-trackers'] });
      navigate(createPageUrl('HealthTrackers'));
    },
    onError: (error) => {
      console.error('Error creating health entry:', error);
      alert(`Failed to add entry: ${error.message || 'Unknown error'}`);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.tracker_type === 'blood_pressure') {
      if (!formData.systolic || !formData.diastolic) {
        alert('Please enter both systolic and diastolic values');
        return;
      }
      const avgValue = (parseFloat(formData.systolic) + parseFloat(formData.diastolic)) / 2;
      
      const dataToSubmit = {
        tracker_type: formData.tracker_type,
        value: avgValue,
        systolic: parseFloat(formData.systolic),
        diastolic: parseFloat(formData.diastolic),
        measured_at: formData.measured_at
      };
      
      if (formData.notes.trim()) {
        dataToSubmit.notes = formData.notes.trim();
      }
      
      createMutation.mutate(dataToSubmit);
    } else {
      if (!formData.value) {
        alert('Please enter a value');
        return;
      }
      
      const dataToSubmit = {
        tracker_type: formData.tracker_type,
        value: parseFloat(formData.value),
        measured_at: formData.measured_at
      };
      
      if (formData.notes.trim()) {
        dataToSubmit.notes = formData.notes.trim();
      }
      
      createMutation.mutate(dataToSubmit);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] via-[#F0F9FC] to-white pb-20">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}>
          
          <button
            onClick={() => navigate(createPageUrl('HealthTrackers'))}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Health Trackers
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: selectedTracker.color + '20' }}>
                {React.createElement(selectedTracker.icon, { 
                  className: "w-6 h-6",
                  style: { color: selectedTracker.color }
                })}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Add Health Entry</h1>
                <p className="text-slate-600">Record your health measurement</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="tracker_type">Metric Type *</Label>
                <Select value={formData.tracker_type} onValueChange={(value) => setFormData({ ...formData, tracker_type: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {trackerTypes.map(tracker => (
                      <SelectItem key={tracker.id} value={tracker.id}>
                        {tracker.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.tracker_type === 'blood_pressure' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="systolic">Systolic *</Label>
                    <Input
                      id="systolic"
                      type="number"
                      required
                      value={formData.systolic}
                      onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
                      placeholder="120"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="diastolic">Diastolic *</Label>
                    <Input
                      id="diastolic"
                      type="number"
                      required
                      value={formData.diastolic}
                      onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
                      placeholder="80"
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="value">Value ({selectedTracker.unit}) *</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.1"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={selectedTracker.placeholder}
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="measured_at">Date & Time *</Label>
                <Input
                  id="measured_at"
                  type="datetime-local"
                  required
                  value={formData.measured_at}
                  onChange={(e) => setFormData({ ...formData, measured_at: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional context or observations..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl('HealthTrackers'))}
                  className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 text-white hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${selectedTracker.color} 0%, ${selectedTracker.color}dd 100%)` }}>
                  {createMutation.isPending ? 'Adding...' : 'Add Entry'}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}