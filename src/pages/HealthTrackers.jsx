import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Heart, Activity, Droplet, TrendingUp, Plus,
  Scale, Gauge, Thermometer, ChevronRight, ArrowLeft, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import HealthDataImport from '../components/health/HealthDataImport';
import AddEntryModal from '../components/health/AddEntryModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function HealthTrackers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTracker, setSelectedTracker] = useState('weight');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [addEntryOpen, setAddEntryOpen] = useState(false);
  const [selectedMetricType, setSelectedMetricType] = useState('weight');

  const handleOpenModal = (metricType) => {
    setSelectedMetricType(metricType);
    setAddEntryOpen(true);
  };

  const { data: trackers = [] } = useQuery({
    queryKey: ['health-trackers'],
    queryFn: () => base44.entities.HealthTracker.list('-created_date'),
  });

  const trackerTypes = [
    { id: 'weight', label: 'Weight', icon: Scale, color: '#00BCD4', unit: 'lbs' },
    { id: 'blood_pressure', label: 'Blood Pressure', icon: Heart, color: '#E91E63', unit: 'mmHg' },
    { id: 'heart_rate', label: 'Heart Rate', icon: Activity, color: '#FF5722', unit: 'bpm' },
    { id: 'glucose', label: 'Blood Sugar', icon: Droplet, color: '#9C27B0', unit: 'mg/dL' },
    { id: 'pain_level', label: 'Pain Level', icon: Gauge, color: '#FF9800', unit: '/10' },
    { id: 'temperature', label: 'Temperature', icon: Thermometer, color: '#4CAF50', unit: '°F' },
    { id: 'steps', label: 'Steps', icon: Activity, color: '#10b981', unit: 'steps' },
    { id: 'sleep_hours', label: 'Sleep', icon: Activity, color: '#6366f1', unit: 'hrs' },
    { id: 'exercise_minutes', label: 'Exercise', icon: Activity, color: '#14b8a6', unit: 'min' }
  ];

  const selectedTrackerData = trackerTypes.find(t => t.id === selectedTracker);
  const filteredData = trackers
    .filter(t => t.tracker_type === selectedTracker)
    .slice(0, 10)
    .reverse()
    .map(t => ({
      date: format(new Date(t.created_date), 'MMM d'),
      value: t.value
    }));

  const latestValue = trackers.find(t => t.tracker_type === selectedTracker)?.value;

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
                <h1 className="text-2xl font-bold text-slate-900">Health Trackers</h1>
                <p className="text-slate-600 text-sm mt-1">Monitor your vital health metrics</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-sky-500 text-sky-600 hover:bg-sky-50">
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Import Health Data</DialogTitle>
                  </DialogHeader>
                  <HealthDataImport 
                    onImportComplete={() => {
                      setImportDialogOpen(false);
                      queryClient.invalidateQueries({ queryKey: ['health-trackers'] });
                    }}
                  />
                </DialogContent>
              </Dialog>
              <Button className="gradient-cyan text-white" onClick={() => handleOpenModal(selectedTracker)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tracker Type Selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {trackerTypes.map((tracker) => {
            const Icon = tracker.icon;
            const isSelected = selectedTracker === tracker.id;
            return (
              <button
                key={tracker.id}
                onClick={() => setSelectedTracker(tracker.id)}
                className={`p-4 rounded-xl transition-all ${
                  isSelected 
                    ? 'bg-white border-2 shadow-md scale-105' 
                    : 'bg-white border border-slate-200 hover:border-cyan-300'
                }`}
                style={{ borderColor: isSelected ? tracker.color : undefined }}
              >
                <div 
                  className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: tracker.color + '20' }}
                >
                  <Icon className="w-5 h-5" style={{ color: tracker.color }} />
                </div>
                <p className="text-xs font-medium text-slate-900 text-center">{tracker.label}</p>
              </button>
            );
          })}
        </div>

        {/* Current Value Card */}
        {latestValue && (
          <Card className="p-6 mb-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Current {selectedTrackerData?.label}</p>
                <p className="text-4xl font-bold" style={{ color: selectedTrackerData?.color }}>
                  {latestValue} <span className="text-2xl text-slate-600">{selectedTrackerData?.unit}</span>
                </p>
              </div>
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: selectedTrackerData?.color + '20' }}
              >
                {React.createElement(selectedTrackerData?.icon, { 
                  className: "w-8 h-8",
                  style: { color: selectedTrackerData?.color }
                })}
              </div>
            </div>
          </Card>
        )}

        {/* Chart */}
        {filteredData.length > 0 ? (
          <Card className="p-6 mb-6 bg-white">
            <h3 className="font-semibold text-slate-900 mb-4">Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={selectedTrackerData?.color} 
                  strokeWidth={2}
                  dot={{ fill: selectedTrackerData?.color, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        ) : (
          <Card className="p-12 text-center bg-white">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: selectedTrackerData?.color + '20' }}
            >
              {React.createElement(selectedTrackerData?.icon, { 
                className: "w-8 h-8",
                style: { color: selectedTrackerData?.color }
              })}
            </div>
            <p className="text-slate-600 mb-4">No {selectedTrackerData?.label.toLowerCase()} entries yet</p>
            <Button variant="outline" onClick={() => handleOpenModal(selectedTracker)}>
              Add Your First Entry
            </Button>
          </Card>
        )}

        {/* Recent Entries */}
        {filteredData.length > 0 && (
          <Card className="p-6 bg-white">
            <h3 className="font-semibold text-slate-900 mb-4">Recent Entries</h3>
            <div className="space-y-2">
              {trackers.filter(t => t.tracker_type === selectedTracker).slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{entry.value} {selectedTrackerData?.unit}</p>
                    <p className="text-sm text-slate-600">{format(new Date(entry.created_date), 'MMM d, yyyy • h:mm a')}</p>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-slate-600 max-w-xs truncate">{entry.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <AddEntryModal 
        open={addEntryOpen} 
        onOpenChange={setAddEntryOpen}
        initialMetricType={selectedMetricType}
      />
    </div>
  );
}