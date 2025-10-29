import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/types';
import { Calendar, MapPin, QrCode, Users, FileText, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface EventCardProps {
  event: Event;
  onViewDetails?: () => void;
  onGenerateQR?: () => void;
  onGenerateGoogleFormQR?: () => void;
  onViewAttendance?: () => void;
  onManageInvites?: () => void;
}

export function EventCard({ event, onViewDetails, onGenerateQR, onGenerateGoogleFormQR, onViewAttendance, onManageInvites }: EventCardProps) {
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
  const awaitingApproval = event.approval_status !== 'approved';

  return (
    <Card className="bg-gradient-card shadow-card hover:shadow-glow transition-all duration-300 border-0">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
            {event.title}
          </CardTitle>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={isUpcoming ? 'default' : 'secondary'}>
              {isUpcoming ? 'Upcoming' : 'Past'}
            </Badge>
            <Badge variant={awaitingApproval ? 'outline' : 'secondary'} className="capitalize">
              {event.approval_status}
            </Badge>
          </div>
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
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline" className="capitalize">{event.category.replace('-', ' ')}</Badge>
            <Badge variant="outline" className="capitalize">{event.delivery_mode.replace('-', ' ')}</Badge>
            <Badge variant="outline">{event.invitation_mode === 'invite-only' ? 'Invite-only' : 'Open'}</Badge>
            <Badge variant="outline" className="capitalize">{event.status}</Badge>
            {event.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary">#{tag}</Badge>
            ))}
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
                variant="outline" 
                size="sm" 
                onClick={onManageInvites}
                className="gap-1"
                disabled={awaitingApproval}
              >
                <UserPlus className="w-4 h-4" />
                Invite
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={onGenerateQR}
                className="gap-1"
                disabled={awaitingApproval}
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
                disabled={awaitingApproval}
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
