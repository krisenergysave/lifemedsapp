import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Heart, Moon, Footprints, Droplets, Wind } from 'lucide-react';
import { format, subDays } from 'date-fns';

const getMetricIcon = (type) => {
  const icons = {
    steps: Footprints,
    heart_rate: Heart,
    sleep_hours: Moon,
    water_intake: Droplets,
    exercise_minutes: Activity,
    oxygen_saturation: Wind
  };
  return icons[type] || Activity;
};

const getMetricColor = (type) => {
  const colors = {
    steps: '#3b82f6',
    heart_rate: '#ef4444',
    sleep_hours: '#8b5cf6',
    water_intake: '#06b6d4',
    exercise_minutes: '#10b981',
    oxygen_saturation: '#f59e0b'
  };
  return colors[type] || '#6b7280';
};

const getMetricUnit = (type) => {
  const units = {
    steps: 'steps',
    heart_rate: 'bpm',
    sleep_hours: 'hours',
    water_intake: 'glasses',
    exercise_minutes: 'min',
    oxygen_saturation: '%'
  };
  return units[type] || '';
};

export default function HealthInsights({ healthData }) {
  // Group data by type and calculate today's values and trends
  const metricTypes = ['steps', 'heart_rate', 'sleep_hours', 'exercise_minutes', 'water_intake', 'oxygen_saturation'];
  
  const insights = metricTypes.map(type => {
    const typeData = healthData.filter(d => d.tracker_type === type);
    if (typeData.length === 0) return null;

    // Get today's data
    const today = new Date();
    const todayData = typeData.filter(d => 
      format(new Date(d.measured_at), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
    );

    // Get yesterday's data for comparison
    const yesterday = subDays(today, 1);
    const yesterdayData = typeData.filter(d => 
      format(new Date(d.measured_at), 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')
    );

    if (todayData.length === 0) return null;

    const todayValue = todayData.reduce((sum, d) => sum + d.value, 0) / todayData.length;
    const yesterdayValue = yesterdayData.length > 0 
      ? yesterdayData.reduce((sum, d) => sum + d.value, 0) / yesterdayData.length 
      : todayValue;

    const change = todayValue - yesterdayValue;
    const percentChange = yesterdayValue > 0 ? ((change / yesterdayValue) * 100).toFixed(1) : 0;

    const Icon = getMetricIcon(type);
    const color = getMetricColor(type);

    return {
      type,
      value: Math.round(todayValue),
      change,
      percentChange,
      Icon,
      color,
      unit: getMetricUnit(type),
      label: type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    };
  }).filter(Boolean);

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-4">Today's Health Insights</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {insights.map((insight, idx) => (
          <motion.div
            key={insight.type}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="p-4 rounded-xl border-2 border-slate-100 hover:border-slate-200 transition-all">
            <div className="flex items-center justify-between mb-2">
              <insight.Icon className="w-5 h-5" style={{ color: insight.color }} />
              {insight.change !== 0 && (
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  insight.change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {insight.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(insight.percentChange)}%
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-900">{insight.value}</p>
            <p className="text-xs text-slate-600">{insight.label}</p>
            <p className="text-xs text-slate-500 mt-1">{insight.unit}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}