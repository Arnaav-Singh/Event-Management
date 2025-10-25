import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { EventCard } from '@/components/EventCard';
import { QRScanner } from '@/components/QRScanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, CheckCircle, QrCode, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Event } from '@/types';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [attendedEvents, setAttendedEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    attendedEvents: 0,
    upcomingEvents: 0,
    feedbackGiven: 0
  });
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    if (!user) return;
    
    try {
      const [allEvents, attendanceData, statsData] = await Promise.all([
        apiService.getEvents(),
        apiService.getStudentAttendance(user.id),
        apiService.getStudentStats(user.id)
      ]);

      const now = new Date();
      const upcoming = allEvents.filter(event => new Date(event.date) > now);
      
      setUpcomingEvents(upcoming);
      setAttendedEvents(attendanceData.events);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load student data:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const handleQRScanSuccess = async (eventId: string) => {
    if (!user) return;
    
    setShowQRScanner(false);
    try {
      await apiService.markAttendance(eventId, user.id);
      toast({
        title: "Attendance Marked!",
        description: `Successfully marked attendance for event.`
      });
      // Refresh data
      loadData();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: (error instanceof Error ? error.message : "Failed to mark attendance"),
        variant: "destructive"
      });
    }
  };

  const statsDisplay = [
    { label: 'Upcoming Events', value: stats.upcomingEvents, icon: CalendarDays, color: 'bg-primary' },
    { label: 'Events Attended', value: stats.attendedEvents, icon: CheckCircle, color: 'bg-success' },
    { label: 'Feedback Given', value: stats.feedbackGiven, icon: Star, color: 'bg-accent' }
  ];

  return (
    <Layout title="Student Dashboard">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            <p className="text-muted-foreground">Discover and attend college events</p>
          </div>
          <Dialog open={showQRScanner} onOpenChange={setShowQRScanner}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <QrCode className="w-4 h-4" />
                Scan QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Mark Attendance</DialogTitle>
              </DialogHeader>
              <QRScanner onScanSuccess={handleQRScanSuccess} />
            </DialogContent>
          </Dialog>
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
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={() => console.log('View details:', event.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Attended Events
              <Badge variant="secondary">{attendedEvents.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attendedEvents.map((event) => (
                <div key={event.id} className="relative">
                  <EventCard
                    event={event}
                    onViewDetails={() => console.log('View details:', event.id)}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-success text-success-foreground">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Attended
                    </Badge>
                  </div>
                </div>
              ))}
              {attendedEvents.length === 0 && (
                <p className="text-center text-muted-foreground py-8 col-span-2">
                  No events attended yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}