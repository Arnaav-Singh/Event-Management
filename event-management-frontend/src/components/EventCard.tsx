import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/types';
import { Calendar, MapPin, User, QrCode, Users, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface EventCardProps {
  event: Event;
  onViewDetails?: () => void;
  onGenerateQR?: () => void;
  onGenerateGoogleFormQR?: () => void;
  onViewAttendance?: () => void;
}

export function EventCard({ event, onViewDetails, onGenerateQR, onGenerateGoogleFormQR, onViewAttendance }: EventCardProps) {
  const { user } = useAuth();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = new Date(event.date) > new Date();

  return (
    <Card className="bg-gradient-card shadow-card hover:shadow-glow transition-all duration-300 border-0">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
            {event.title}
          </CardTitle>
          <Badge variant={isUpcoming ? 'default' : 'secondary'} className="ml-2">
            {isUpcoming ? 'Upcoming' : 'Past'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm line-clamp-3">
          {event.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-accent" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-accent" />
            <span>{event.location}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewDetails}
            className="flex-1 min-w-24"
          >
            View Details
          </Button>
          
          {user?.role === 'coordinator' && (
            <>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={onGenerateQR}
                className="gap-1"
              >
                <QrCode className="w-4 h-4" />
                QR Code
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onGenerateGoogleFormQR}
                className="gap-1"
              >
                <FileText className="w-4 h-4" />
                Form QR
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={onViewAttendance}
                className="gap-1"
              >
                <Users className="w-4 h-4" />
                Attendance
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}