import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { EventCard } from '@/components/EventCard';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Users, QrCode } from 'lucide-react';
import { Event, User } from '@/types';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function CoordinatorDashboard() {
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [assignedEvents, setAssignedEvents] = useState<Event[]>([]);
  const [attendanceData, setAttendanceData] = useState<User[]>([]);
  const [stats, setStats] = useState({
    assignedEvents: 0,
    totalAttendees: 0,
    avgFeedbackRating: 0
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const [eventsData, statsData] = await Promise.all([
        apiService.getEventsByCoordinator(user.id),
        apiService.getCoordinatorStats(user.id)
      ]);
      setAssignedEvents(eventsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load coordinator data:', error);
    }
  };

  const handleGenerateQR = (event: Event) => {
    setSelectedEvent(event);
    setShowQRDialog(true);
  };

  const handleViewAttendance = async (event: Event) => {
    setSelectedEvent(event);
    try {
      const { attendees } = await apiService.getEventAttendance(event.id);
      setAttendanceData(attendees);
      setShowAttendanceDialog(true);
    } catch (error) {
      console.error('Failed to load attendance data:', error);
      setAttendanceData([]);
      setShowAttendanceDialog(true);
    }
  };

  const statsDisplay = [
    { label: 'Assigned Events', value: stats.assignedEvents, icon: CalendarDays, color: 'bg-primary' },
    { label: 'Total Attendees', value: stats.totalAttendees, icon: Users, color: 'bg-success' },
    { label: 'Avg Rating', value: stats.avgFeedbackRating || 0, icon: QrCode, color: 'bg-accent' }
  ];

  return (
    <Layout title="Coordinator Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Coordinator Dashboard</h1>
          <p className="text-muted-foreground">Manage your assigned events</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statsDisplay.map((stat) => (
            <Card key={stat.label} className="bg-gradient-card shadow-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle>Your Assigned Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={() => console.log('View details:', event.id)}
                  onGenerateQR={() => handleGenerateQR(event)}
                  onViewAttendance={() => handleViewAttendance(event)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* QR Code Dialog */}
        <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>QR Code Generator</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <QRCodeGenerator 
                eventId={selectedEvent.id}
                eventTitle={selectedEvent.title}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Attendance Dialog */}
        <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Event Attendance</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{selectedEvent.title}</h3>
                  <Badge variant="secondary">{attendanceData.length} attendees</Badge>
                </div>
                <div className="space-y-2">
                  {attendanceData.map((attendee) => (
                    <div key={attendee.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{attendee.name}</p>
                        <p className="text-sm text-muted-foreground">{attendee.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Attended
                        </p>
                      </div>
                    </div>
                  ))}
                  {attendanceData.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No attendees yet
                    </p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}