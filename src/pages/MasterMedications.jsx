import React, { useState, useEffect } from 'react';
import authApi from '@/api/authApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Edit, Trash2, Search, Pill, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

export default function MasterMedications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [medicationToDelete, setMedicationToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    category: '',
    common_dosages: ''
  });

  useEffect(() => {
    authApi.me().then(user => {
      if (!user || user.role !== 'admin') {
        navigate(createPageUrl('Dashboard'));
        return;
      }
      setCurrentUser(user);
    });
  }, [navigate]);

  const { data: medications = [], isLoading } = useQuery({
    queryKey: ['master-medications'],
    queryFn: () => base44.entities.MasterMedications.list('-name'),
    enabled: !!currentUser && currentUser.role === 'admin',
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MasterMedications.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-medications'] });
      toast.success('Medication added successfully');
      resetForm();
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add medication');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MasterMedications.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-medications'] });
      toast.success('Medication updated successfully');
      resetForm();
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update medication');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MasterMedications.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-medications'] });
      toast.success('Medication deleted successfully');
      setShowDeleteDialog(false);
      setMedicationToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete medication');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      generic_name: '',
      category: '',
      common_dosages: ''
    });
    setSelectedMedication(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (medication) => {
    setSelectedMedication(medication);
    setFormData({
      name: medication.name || '',
      generic_name: medication.generic_name || '',
      category: medication.category || '',
      common_dosages: medication.common_dosages ? medication.common_dosages.join(', ') : ''
    });
    setShowModal(true);
  };

  const handleDelete = (medication) => {
    setMedicationToDelete(medication);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (medicationToDelete) {
      deleteMutation.mutate(medicationToDelete.id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Medication name is required');
      return;
    }

    const dataToSubmit = {
      name: formData.name.trim(),
    };

    if (formData.generic_name.trim()) {
      dataToSubmit.generic_name = formData.generic_name.trim();
    }

    if (formData.category.trim()) {
      dataToSubmit.category = formData.category.trim();
    }

    if (formData.common_dosages.trim()) {
      const dosages = formData.common_dosages
        .split(',')
        .map(d => d.trim())
        .filter(d => d);
      if (dosages.length > 0) {
        dataToSubmit.common_dosages = dosages;
      }
    }

    if (selectedMedication) {
      updateMutation.mutate({ id: selectedMedication.id, data: dataToSubmit });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  const filteredMedications = medications.filter(med =>
    med.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] via-[#F0F9FC] to-white pb-20">

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Medication</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{medicationToDelete?.name}</strong>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add/Edit Dialog */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedMedication ? 'Edit Medication' : 'Add Medication'}</DialogTitle>
              <DialogDescription>
                {selectedMedication ? 'Update the medication details' : 'Add a new approved medication to the master list'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Medication Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Acetaminophen"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="generic_name">Generic Name (Optional)</Label>
                <Input
                  id="generic_name"
                  value={formData.generic_name}
                  onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                  placeholder="e.g., Paracetamol"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category">Category (Optional)</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Pain Relief, Blood Pressure"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="common_dosages">Common Dosages (Optional)</Label>
                <Input
                  id="common_dosages"
                  value={formData.common_dosages}
                  onChange={(e) => setFormData({ ...formData, common_dosages: e.target.value })}
                  placeholder="e.g., 10mg, 20mg, 40mg (comma-separated)"
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">Separate multiple dosages with commas</p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="gradient-cyan text-white">
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    selectedMedication ? 'Update' : 'Add Medication'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate(createPageUrl('AdminDashboard'))}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Admin Dashboard
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-teal-100 rounded-xl flex items-center justify-center">
                  <Pill className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Master Medications</h1>
                  <p className="text-slate-600">Manage approved medication list</p>
                </div>
              </div>
              <Button onClick={handleAdd} className="gradient-cyan text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search medications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Medications List */}
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-4" />
                <p className="text-slate-600">Loading medications...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMedications.length > 0 ? (
                  filteredMedications.map((medication) => (
                    <motion.div
                      key={medication.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{medication.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {medication.generic_name && (
                            <span className="text-xs text-slate-600">
                              Generic: {medication.generic_name}
                            </span>
                          )}
                          {medication.category && (
                            <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-xs rounded-full">
                              {medication.category}
                            </span>
                          )}
                        </div>
                        {medication.common_dosages && medication.common_dosages.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {medication.common_dosages.map((dosage, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                                {dosage}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(medication)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(medication)}
                          className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Pill className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">
                      {searchTerm ? 'No medications found' : 'No medications added yet'}
                    </p>
                    {!searchTerm && (
                      <Button onClick={handleAdd} variant="outline" className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Medication
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}