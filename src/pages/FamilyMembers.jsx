import React, { useState } from 'react';
import authApi from '@/api/authApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Users, Trash2, Bell, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const avatarColors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
];

export default function FamilyMembers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'other',
    role: 'patient',
    date_of_birth: '',
    avatar_color: avatarColors[0],
    access_level: 'full_access',
    notification_enabled: true
  });

  React.useEffect(() => {
    authApi.me().then(setUser);
  }, []);

  const { data: familyMembers = [] } = useQuery({
    queryKey: ['family-members', showAll],
    queryFn: async () => {
      if (showAll && user?.role === 'admin') {
        return base44.entities.FamilyMember.list();
      }
      return base44.entities.FamilyMember.filter({ created_by: user.email });
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FamilyMember.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
      setOpen(false);
      setFormData({ 
        name: '', 
        relationship: 'other',
        role: 'patient',
        date_of_birth: '', 
        avatar_color: avatarColors[0],
        access_level: 'full_access',
        notification_enabled: true
      });
    },
    onError: (error) => {
      console.error('Failed to create family member:', error);
      alert('Failed to add family member. Please try again.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FamilyMember.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      name: formData.name,
      relationship: formData.relationship,
      role: formData.role || 'patient',
      avatar_color: formData.avatar_color
    };
    if (formData.date_of_birth) {
      dataToSubmit.date_of_birth = formData.date_of_birth;
    }
    dataToSubmit.access_level = formData.access_level;
    dataToSubmit.notification_enabled = formData.notification_enabled;
    createMutation.mutate(dataToSubmit);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] via-[#F0F9FC] to-white pb-20">
      <div className="max-w-4xl mx-auto px-6 py-8">
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
                <h1 className="text-3xl font-bold text-slate-900">Family Members</h1>
                <p className="text-slate-600">Manage medications for your loved ones</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user?.role === 'admin' && (
                <Button
                  variant={showAll ? "default" : "outline"}
                  onClick={() => setShowAll(!showAll)}
                  className={showAll ? "gradient-cyan text-white" : ""}>
                  <Users className="w-4 h-4 mr-2" />
                  {showAll ? 'All Members' : 'My Members'}
                </Button>
              )}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-cyan text-white hover:opacity-90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Family Member</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="relationship">Relationship *</Label>
                      <Select value={formData.relationship} onValueChange={(value) => setFormData({ ...formData, relationship: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="self">Self</SelectItem>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="role">Role *</Label>
                      <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="patient">Patient - Needs medication reminders</SelectItem>
                          <SelectItem value="caregiver">Caregiver - Monitors others</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dob">Date of Birth (Optional)</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Avatar Color</Label>
                      <div className="flex gap-2 mt-2">
                        {avatarColors.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData({ ...formData, avatar_color: color })}
                            className={`w-8 h-8 rounded-full transition-all ${
                              formData.avatar_color === color ? 'ring-2 ring-offset-2 ring-slate-900' : ''
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending}
                      className="w-full gradient-cyan text-white hover:opacity-90">
                      {createMutation.isPending ? 'Adding...' : 'Add Member'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {familyMembers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
              <Users className="w-20 h-20 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">No family members yet</h2>
              <p className="text-slate-600 mb-6">Add family members to manage their medications</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {familyMembers.map((member, idx) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                        style={{ backgroundColor: member.avatar_color }}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-slate-600 capitalize">{member.relationship}</p>
                          <Badge className={`text-xs ${
                            member.role === 'caregiver' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-sky-100 text-sky-700'
                          }`}>
                            {member.role || 'patient'}
                          </Badge>
                        </div>
                        {showAll && (
                          <p className="text-xs text-slate-500 mt-1">
                            Owner: {member.created_by}
                          </p>
                        )}
                        {member.date_of_birth && (
                          <p className="text-xs text-slate-500 mt-1">
                            Born {new Date(member.date_of_birth).toLocaleDateString()}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <Badge className="bg-sky-100 text-sky-800 text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            {member.access_level === 'view_only' ? 'View Only' : 
                             member.access_level === 'edit' ? 'Can Edit' : 'Full Access'}
                          </Badge>
                          {member.notification_enabled && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <Bell className="w-3 h-3 mr-1" />
                              Alerts
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => navigate(createPageUrl('FamilyMemberDetail') + `?id=${member.id}`)}
                        className="gradient-cyan text-white">
                        Manage
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-slate-600 hover:text-red-600"
                        onClick={() => deleteMutation.mutate(member.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}