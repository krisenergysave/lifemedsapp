import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function AddEntryModal({ open, onOpenChange, initialMetricType = 'weight' }) {
  const queryClient = useQueryClient();
  const [metricType, setMetricType] = useState(initialMetricType);
  const [value, setValue] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [notes, setNotes] = useState('');

  // Update metricType when initialMetricType changes
  useEffect(() => {
    if (open) {
      setMetricType(initialMetricType);
      // Reset form fields
      setValue('');
      setSystolic('');
      setDiastolic('');
      setNotes('');
    }
  }, [open, initialMetricType]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.HealthTracker.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-trackers'] });
      toast.success('Health entry added successfully');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Failed to add entry: ' + error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (metricType === 'blood_pressure') {
      if (!systolic || !diastolic) {
        toast.error('Please enter both systolic and diastolic values');
        return;
      }
    } else {
      if (!value) {
        toast.error('Please enter a value');
        return;
      }
    }

    const data = {
      tracker_type: metricType,
      value: metricType === 'blood_pressure' ? parseFloat(systolic) : parseFloat(value),
      systolic: metricType === 'blood_pressure' ? parseFloat(systolic) : undefined,
      diastolic: metricType === 'blood_pressure' ? parseFloat(diastolic) : undefined,
      notes: notes || undefined,
      measured_at: new Date().toISOString(),
      source: 'manual',
    };

    createMutation.mutate(data);
  };

  const renderFormFields = () => {
    switch (metricType) {
      case 'weight':
        return (
          <div>
            <Label htmlFor="value">Weight (lbs/kg)</Label>
            <Input
              id="value"
              type="number"
              step="0.1"
              placeholder="Enter weight"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
        );

      case 'heart_rate':
        return (
          <div>
            <Label htmlFor="value">Heart Rate (BPM)</Label>
            <Input
              id="value"
              type="number"
              placeholder="Enter heart rate"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
        );

      case 'blood_pressure':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="systolic">Systolic (mmHg)</Label>
              <Input
                id="systolic"
                type="number"
                placeholder="e.g., 120"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="diastolic">Diastolic (mmHg)</Label>
              <Input
                id="diastolic"
                type="number"
                placeholder="e.g., 80"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                required
              />
            </div>
          </div>
        );

      case 'glucose':
        return (
          <div>
            <Label htmlFor="value">Blood Sugar (mg/dL)</Label>
            <Input
              id="value"
              type="number"
              placeholder="Enter glucose level"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
        );

      case 'pain_level':
        return (
          <div>
            <Label htmlFor="value">Pain Level (0-10)</Label>
            <Input
              id="value"
              type="number"
              min="0"
              max="10"
              placeholder="Enter pain level"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
        );

      case 'temperature':
        return (
          <div>
            <Label htmlFor="value">Temperature (°F)</Label>
            <Input
              id="value"
              type="number"
              step="0.1"
              placeholder="Enter temperature"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
        );

      case 'steps':
        return (
          <div>
            <Label htmlFor="value">Steps</Label>
            <Input
              id="value"
              type="number"
              placeholder="Enter step count"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
        );

      case 'sleep_hours':
        return (
          <div>
            <Label htmlFor="value">Sleep Hours</Label>
            <Input
              id="value"
              type="number"
              step="0.1"
              placeholder="Enter hours slept"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
        );

      case 'exercise_minutes':
        return (
          <div>
            <Label htmlFor="value">Exercise Minutes</Label>
            <Input
              id="value"
              type="number"
              placeholder="Enter exercise duration"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
        );

      default:
        return (
          <div>
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              type="number"
              placeholder="Enter value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Health Entry</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Metric Type</Label>
            <Select value={metricType} onValueChange={setMetricType}>
              <SelectTrigger>
                <SelectValue placeholder="Select metric type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight">Weight</SelectItem>
                <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
                <SelectItem value="heart_rate">Heart Rate</SelectItem>
                <SelectItem value="glucose">Blood Sugar</SelectItem>
                <SelectItem value="pain_level">Pain Level</SelectItem>
                <SelectItem value="temperature">Temperature</SelectItem>
                <SelectItem value="steps">Steps</SelectItem>
                <SelectItem value="sleep_hours">Sleep Hours</SelectItem>
                <SelectItem value="exercise_minutes">Exercise Minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderFormFields()}

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this entry"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gradient-cyan text-white" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Adding...' : 'Add Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}