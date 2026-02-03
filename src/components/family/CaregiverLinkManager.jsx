import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import entitiesApi from '@/api/entitiesApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Mail, Bell, Smartphone, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CaregiverLinkManager({ familyMember }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [caregiverType, setCaregiverType] = useState('self'); // 'self', 'existing', 'invite', 'email_only'
  const [caregiverEmail, setCaregiverEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [notifyOnSuccess, setNotifyOnSuccess] = useState(true);
  const [notifyOnMissed, setNotifyOnMissed] = useState(true);
  const [notificationMethods, setNotificationMethods] = useState(['email']);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    authApi.me().then(setCurrentUser);
  }, []);

  const { data: myFamilyMembers = [] } = useQuery({
    queryKey: ['my-family-members-with-accounts'],
    queryFn: async () => {
      const members = await entitiesApi.filter('FamilyMember', { created_by: currentUser.email });
      // Filter to only members who have an email set
      const membersWithEmail = members.filter(m => m.email);
      
      // Verify those emails exist as users
      const allUsers = await entitiesApi.list('User');
      const userEmails = allUsers.map(u => u.email);
      
      return membersWithEmail.filter(m => userEmails.includes(m.email));
    },
    enabled: open && !!currentUser,
  });

  const { data: caregiverLinks = [] } = useQuery({
    queryKey: ['caregiver-links', familyMember.id],
    queryFn: () => entitiesApi.filter('CaregiverLink', {
      patient_family_member_id: familyMember.id
    }),
  });

  const createLinkMutation = useMutation({
    mutationFn: (data) => entitiesApi.create('CaregiverLink', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregiver-links'] });
      toast.success('Caregiver added successfully');
      setOpen(false);
      setCaregiverType('self');
      setCaregiverEmail('');
      setSelectedUser(null);
      setNotifyOnSuccess(true);
      setNotifyOnMissed(true);
      setNotificationMethods(['email']);
    },
    onError: (error) => {
      toast.error('Failed to add caregiver: ' + error.message);
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: (id) => entitiesApi.delete('CaregiverLink', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregiver-links'] });
      toast.success('Caregiver removed');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let emailToUse = '';
    
    if (caregiverType === 'self') {
      emailToUse = currentUser.email;
    } else if (caregiverType === 'existing') {
      if (!selectedUser) {
        toast.error('Please select a user');
        return;
      }
      emailToUse = selectedUser;
    } else if (caregiverType === 'invite') {
      if (!caregiverEmail) {
        toast.error('Please enter an email address');
        return;
      }
      emailToUse = caregiverEmail;
      // Send invitation
      try {
        await base44.users.inviteUser(caregiverEmail, 'user');
        toast.success('Invitation sent to ' + caregiverEmail);
      } catch (error) {
        toast.error('Failed to send invitation: ' + error.message);
        return;
      }
    } else if (caregiverType === 'email_only') {
      if (!caregiverEmail) {
        toast.error('Please enter an email address');
        return;
      }
      emailToUse = caregiverEmail;
    }

    createLinkMutation.mutate({
      patient_family_member_id: familyMember.id,
      caregiver_email: emailToUse,
      status: 'active',
      notify_on_success: notifyOnSuccess,
      notify_on_missed: notifyOnMissed,
      notification_methods: caregiverType === 'email_only' ? ['email'] : notificationMethods,
    });
  };

  const toggleNotificationMethod = (method) => {
    setNotificationMethods(prev => 
      prev.includes(method) 
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Caregivers</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gradient-cyan text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Caregiver
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Caregiver for {familyMember.name}</DialogTitle>
              <DialogDescription>
                Invite someone to monitor {familyMember.name}'s medication adherence
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Who will be the caregiver?</Label>
                <RadioGroup value={caregiverType} onValueChange={setCaregiverType} className="mt-3 space-y-3">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50">
                    <RadioGroupItem value="self" id="self" />
                    <Label htmlFor="self" className="flex-1 cursor-pointer">
                      <div className="font-medium">Myself</div>
                      <div className="text-xs text-slate-500">Add yourself as a caregiver</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50">
                    <RadioGroupItem value="existing" id="existing" />
                    <Label htmlFor="existing" className="flex-1 cursor-pointer">
                      <div className="font-medium">Existing User</div>
                      <div className="text-xs text-slate-500">Select from registered users</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50">
                    <RadioGroupItem value="invite" id="invite" />
                    <Label htmlFor="invite" className="flex-1 cursor-pointer">
                      <div className="font-medium">Invite New User</div>
                      <div className="text-xs text-slate-500">Send invitation to create account</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50">
                    <RadioGroupItem value="email_only" id="email_only" />
                    <Label htmlFor="email_only" className="flex-1 cursor-pointer">
                      <div className="font-medium">Email Only</div>
                      <div className="text-xs text-slate-500">No account - email notifications only</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {caregiverType === 'existing' && (
                <div>
                  <Label>Select Family Member</Label>
                  <select
                    value={selectedUser || ''}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required>
                    <option value="">Choose a family member...</option>
                    {myFamilyMembers.filter(m => m.email !== currentUser?.email).map(member => (
                      <option key={member.id} value={member.email}>
                        {member.name} ({member.email})
                      </option>
                    ))}
                  </select>
                  {myFamilyMembers.length === 0 && (
                    <p className="text-xs text-slate-500 mt-2">
                      No family members with user accounts found. Add an email to a family member or invite a new user.
                    </p>
                  )}
                </div>
              )}

              {(caregiverType === 'invite' || caregiverType === 'email_only') && (
                <div>
                  <Label htmlFor="caregiver-email">Email Address</Label>
                  <Input
                    id="caregiver-email"
                    type="email"
                    placeholder="caregiver@example.com"
                    value={caregiverEmail}
                    onChange={(e) => setCaregiverEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-3">
                <Label>Notification Preferences</Label>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Notify when medication is taken</span>
                  <Switch
                    checked={notifyOnSuccess}
                    onCheckedChange={setNotifyOnSuccess}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Notify when medication is missed</span>
                  <Switch
                    checked={notifyOnMissed}
                    onCheckedChange={setNotifyOnMissed}
                  />
                </div>
              </div>

              {caregiverType !== 'email_only' && (
                <div className="space-y-3">
                  <Label>Notification Methods</Label>
                
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => toggleNotificationMethod('email')}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      notificationMethods.includes('email')
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-slate-200 bg-white'
                    }`}>
                    <Mail className="w-5 h-5 text-sky-600" />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">Email</div>
                      <div className="text-xs text-slate-500">Get notifications via email</div>
                    </div>
                    {notificationMethods.includes('email') && (
                      <div className="w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center">
                        <Bell className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleNotificationMethod('push')}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      notificationMethods.includes('push')
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 bg-white'
                    }`}>
                    <Smartphone className="w-5 h-5 text-purple-600" />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">Push Notifications</div>
                      <div className="text-xs text-slate-500">Instant mobile alerts</div>
                    </div>
                    {notificationMethods.includes('push') && (
                      <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <Bell className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleNotificationMethod('in_app')}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      notificationMethods.includes('in_app')
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-slate-200 bg-white'
                    }`}>
                    <Bell className="w-5 h-5 text-teal-600" />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">In-App</div>
                      <div className="text-xs text-slate-500">View in dashboard</div>
                    </div>
                    {notificationMethods.includes('in_app') && (
                      <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                        <Bell className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 gradient-cyan text-white">
                  Add Caregiver
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Existing Caregivers */}
      {caregiverLinks.length > 0 ? (
        <div className="space-y-2">
          {caregiverLinks.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="font-medium text-slate-900">{link.caregiver_email}</p>
                <div className="flex gap-2 mt-1">
                  {link.notification_methods?.map((method) => (
                    <span
                      key={method}
                      className="text-xs px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full capitalize">
                      {method}
                    </span>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteLinkMutation.mutate(link.id)}
                className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm">No caregivers added yet</p>
        </div>
      )}
    </div>
  );
}