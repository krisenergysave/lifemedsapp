import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Calendar, Clock, MapPin, Phone, Plus, 
  Trash2, ArrowLeft, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, isFuture, isPast, isToday, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { motion } from 'framer-motion';

export default function Appointments() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState('calendar'); // 'calendar' or 'list'
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list('-appointment_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Appointment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const upcoming = appointments.filter(a => isFuture(new Date(a.appointment_date)));
  const past = appointments.filter(a => isPast(new Date(a.appointment_date)) && !isToday(new Date(a.appointment_date)));

  const getStatusBadge = (date) => {
    const appointmentDate = new Date(date);
    if (isToday(appointmentDate)) {
      return <Badge className="bg-orange-100 text-orange-800">Today</Badge>;
    }
    if (isFuture(appointmentDate)) {
      return <Badge className="bg-cyan-100 text-cyan-800">Upcoming</Badge>;
    }
    return <Badge className="bg-slate-100 text-slate-600">Completed</Badge>;
  };

  const AppointmentCard = ({ appointment }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-5 bg-white hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl gradient-cyan-light flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-[#00BCD4]" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{appointment.doctor_name}</h3>
              <p className="text-sm text-slate-600 capitalize">{appointment.appointment_type.replace('_', ' ')}</p>
            </div>
          </div>
          {getStatusBadge(appointment.appointment_date)}
        </div>

        <div className="space-y-2 ml-15">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4 text-[#00BCD4]" />
            <span>{format(new Date(appointment.appointment_date), 'MMM d, yyyy • h:mm a')}</span>
          </div>
          
          {appointment.location && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-[#00BCD4]" />
              <span>{appointment.location}</span>
            </div>
          )}
          
          {appointment.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="w-4 h-4 text-[#00BCD4]" />
              <span>{appointment.phone}</span>
            </div>
          )}
          
          {appointment.notes && (
            <p className="text-sm text-slate-600 mt-2 pt-2 border-t border-slate-100">
              {appointment.notes}
            </p>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteMutation.mutate(appointment.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const firstDayOfWeek = monthStart.getDay();
  const calendarDays = [...Array(firstDayOfWeek).fill(null), ...daysInMonth];

  const getAppointmentsForDay = (day) => {
    return appointments.filter(apt => 
      isSameDay(new Date(apt.appointment_date), day)
    );
  };

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
                <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
                <p className="text-slate-600 text-sm mt-1">Manage your medical appointments</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                <Button
                  variant={view === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('calendar')}
                  className={view === 'calendar' ? 'gradient-cyan text-white' : ''}>
                  Calendar
                </Button>
                <Button
                  variant={view === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('list')}
                  className={view === 'list' ? 'gradient-cyan text-white' : ''}>
                  List
                </Button>
              </div>
              <Link to={createPageUrl('AddAppointment')}>
                <Button className="gradient-cyan text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {view === 'calendar' ? (
          <Card className="p-6 bg-white">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentMonth(new Date())}>
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-sm text-slate-600 py-2">
                  {day}
                </div>
              ))}
              
              {calendarDays.map((day, idx) => {
                if (!day) {
                  return <div key={idx} className="aspect-square" />;
                }
                
                const dayAppointments = getAppointmentsForDay(day);
                const isCurrentDay = isToday(day);
                
                return (
                  <div
                    key={idx}
                    className={`aspect-square border rounded-lg p-2 transition-all ${
                      isCurrentDay 
                        ? 'bg-cyan-50 border-cyan-300' 
                        : 'bg-slate-50 border-slate-200 hover:border-cyan-200'
                    }`}>
                    <div className={`text-sm font-medium mb-1 ${
                      isCurrentDay ? 'text-cyan-600' : 'text-slate-900'
                    }`}>
                      {format(day, 'd')}
                    </div>
                    
                    {dayAppointments.length > 0 && (
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 2).map(apt => (
                          <div
                            key={apt.id}
                            onClick={() => setSelectedAppointment(apt)}
                            className="text-xs bg-cyan-100 text-cyan-800 rounded px-1 py-0.5 truncate cursor-pointer hover:bg-cyan-200"
                            title={`${format(new Date(apt.appointment_date), 'h:mm a')} - ${apt.doctor_name}`}>
                            {format(new Date(apt.appointment_date), 'h:mm a')}
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div 
                            onClick={() => setSelectedAppointment(dayAppointments[2])}
                            className="text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                            +{dayAppointments.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Upcoming Today */}
            {upcoming.filter(a => isToday(new Date(a.appointment_date))).length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">Today's Appointments</h3>
                <div className="space-y-3">
                  {upcoming.filter(a => isToday(new Date(a.appointment_date))).map(apt => (
                    <div key={apt.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{apt.doctor_name}</p>
                        <p className="text-sm text-slate-600">
                          {format(new Date(apt.appointment_date), 'h:mm a')} • {apt.appointment_type.replace('_', ' ')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(apt.id)}
                        className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ) : (
          <>
            {appointments.length === 0 ? (
              <Card className="p-12 text-center bg-white">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 gradient-cyan-light flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-[#00BCD4]" />
                </div>
                <p className="text-slate-600 mb-4">No appointments scheduled yet</p>
                <Link to={createPageUrl('AddAppointment')}>
                  <Button variant="outline">Schedule Your First Appointment</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-6">
                {upcoming.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Appointments</h2>
                    <div className="grid gap-4">
                      {upcoming.map(appointment => (
                        <AppointmentCard key={appointment.id} appointment={appointment} />
                      ))}
                    </div>
                  </div>
                )}

                {past.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Past Appointments</h2>
                    <div className="grid gap-4">
                      {past.map(appointment => (
                        <AppointmentCard key={appointment.id} appointment={appointment} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Appointment Details Dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-cyan-light flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[#00BCD4]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{selectedAppointment.doctor_name}</h3>
                    <p className="text-sm text-slate-600 capitalize">{selectedAppointment.appointment_type.replace('_', ' ')}</p>
                  </div>
                </div>
                {getStatusBadge(selectedAppointment.appointment_date)}
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-[#00BCD4]" />
                  <span>{format(new Date(selectedAppointment.appointment_date), 'EEEE, MMM d, yyyy • h:mm a')}</span>
                </div>
                
                {selectedAppointment.location && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-[#00BCD4]" />
                    <span>{selectedAppointment.location}</span>
                  </div>
                )}
                
                {selectedAppointment.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-[#00BCD4]" />
                    <span>{selectedAppointment.phone}</span>
                  </div>
                )}
                
                {selectedAppointment.notes && (
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-sm font-medium text-slate-900 mb-1">Notes</p>
                    <p className="text-sm text-slate-600">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedAppointment(null)}
                  className="flex-1">
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteMutation.mutate(selectedAppointment.id);
                    setSelectedAppointment(null);
                  }}
                  className="flex-1">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}