import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import entitiesApi from '@/api/entitiesApi';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Pill, Edit, Trash2, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export default function MedicationsList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState(null);

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => entitiesApi.list('Medication', { sort: '-created_date' }),
  });

  const { data: familyMembers = [] } = useQuery({
    queryKey: ['family-members'],
    queryFn: () => entitiesApi.list('FamilyMember'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => entitiesApi.delete('Medication', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      setDeleteId(null);
    },
  });

  const getFamilyMemberName = (id) => {
    const member = familyMembers.find(m => m.id === id);
    return member ? member.name : null;
  };

  const frequencyLabels = {
    once_daily: 'Once Daily',
    twice_daily: 'Twice Daily',
    three_times_daily: '3x Daily',
    four_times_daily: '4x Daily',
    every_other_day: 'Every Other Day',
    weekly: 'Weekly',
    as_needed: 'As Needed'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] via-[#F0F9FC] to-white pb-20">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}>
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(createPageUrl('Dashboard'))}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">My Medications</h1>
                <p className="text-slate-600">Manage all your medications</p>
              </div>
            </div>
            <Link to={createPageUrl('AddMedication')}>
              <Button className="gradient-cyan text-white hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
            </Link>
          </div>

          {medications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
              <Pill className="w-20 h-20 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">No medications yet</h2>
              <p className="text-slate-600 mb-6">Start by adding your first medication</p>
              <Link to={createPageUrl('AddMedication')}>
                <Button className="gradient-cyan text-white hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medication
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {medications.map((med, idx) => (
                <motion.div
                  key={med.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: med.color + '20' }}>
                        <Pill className="w-7 h-7" style={{ color: med.color }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{med.name}</h3>
                        <p className="text-sm text-slate-600">{med.dosage} • {med.form}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-slate-600 hover:text-sky-600"
                        onClick={() => navigate(createPageUrl('EditMedication') + '?id=' + med.id)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-slate-600 hover:text-red-600"
                        onClick={() => setDeleteId(med.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">
                        {frequencyLabels[med.frequency]} • {med.times?.join(', ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">
                        Started {new Date(med.start_date).toLocaleDateString()}
                        {med.end_date && ` • Ends ${new Date(med.end_date).toLocaleDateString()}`}
                      </span>
                    </div>

                    {med.family_member_id && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-lg">
                        <span className="text-sm text-purple-700 font-medium">
                          For {getFamilyMemberName(med.family_member_id)}
                        </span>
                      </div>
                    )}

                    {med.notes && (
                      <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 mt-3">
                        {med.notes}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medication</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this medication? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteId)}
              className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}