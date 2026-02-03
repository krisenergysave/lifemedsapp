import React from 'react';
import { useQuery } from '@tanstack/react-query';
import entitiesApi from '@/api/entitiesApi';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Calendar, Award, Target } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Progress() {
  const navigate = useNavigate();

  const { data: logs = [] } = useQuery({
    queryKey: ['all-logs'],
    queryFn: () => entitiesApi.list('MedicationLog', { sort: '-scheduled_time', limit: 100 }),
  });

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => entitiesApi.list('Medication'),
  });

  // Calculate stats for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLogs = logs.filter(log => 
      format(new Date(log.scheduled_time), 'yyyy-MM-dd') === dateStr
    );
    
    const taken = dayLogs.filter(l => l.status === 'taken').length;
    const total = dayLogs.length;
    const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

    return {
      date: format(date, 'EEE'),
      fullDate: dateStr,
      taken,
      total,
      adherence
    };
  });

  const totalTaken = logs.filter(l => l.status === 'taken').length;
  const totalScheduled = logs.length;
  const overallAdherence = totalScheduled > 0 
    ? Math.round((totalTaken / totalScheduled) * 100) 
    : 0;

  const currentStreak = (() => {
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const dayLogs = logs.filter(log => 
        format(new Date(log.scheduled_time), 'yyyy-MM-dd') === date
      );
      if (dayLogs.length === 0) continue;
      const dayAdherence = dayLogs.filter(l => l.status === 'taken').length / dayLogs.length;
      if (dayAdherence >= 0.8) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-teal-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}>
          
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate(createPageUrl('Dashboard'))}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Progress & Analytics</h1>
              <p className="text-slate-600">Track your medication adherence</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-sky-500 to-teal-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sky-100 text-sm">Overall Adherence</span>
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-4xl font-bold">{overallAdherence}%</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600 text-sm">Current Streak</span>
                <Award className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-4xl font-bold text-slate-900">{currentStreak}</p>
              <p className="text-sm text-slate-600">days</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600 text-sm">Doses Taken</span>
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-4xl font-bold text-slate-900">{totalTaken}</p>
              <p className="text-sm text-slate-600">total</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600 text-sm">Active Medications</span>
                <Calendar className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-4xl font-bold text-slate-900">{medications.length}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Adherence Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">7-Day Adherence</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="adherence" 
                    stroke="#0ea5e9" 
                    strokeWidth={3}
                    dot={{ fill: '#0ea5e9', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Doses Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Doses Taken vs Scheduled</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="taken" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="total" fill="#e2e8f0" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl border-2 ${currentStreak >= 7 ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-3xl mb-2">🔥</div>
                <h3 className="font-semibold text-slate-900">7-Day Streak</h3>
                <p className="text-sm text-slate-600">
                  {currentStreak >= 7 ? 'Unlocked!' : `${7 - currentStreak} days to go`}
                </p>
              </div>

              <div className={`p-4 rounded-xl border-2 ${totalTaken >= 50 ? 'bg-gradient-to-br from-blue-50 to-sky-50 border-sky-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-3xl mb-2">💊</div>
                <h3 className="font-semibold text-slate-900">50 Doses</h3>
                <p className="text-sm text-slate-600">
                  {totalTaken >= 50 ? 'Unlocked!' : `${50 - totalTaken} doses to go`}
                </p>
              </div>

              <div className={`p-4 rounded-xl border-2 ${overallAdherence >= 90 ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="font-semibold text-slate-900">90% Adherence</h3>
                <p className="text-sm text-slate-600">
                  {overallAdherence >= 90 ? 'Unlocked!' : `${90 - overallAdherence}% to go`}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}