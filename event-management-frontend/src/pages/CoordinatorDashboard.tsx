// Coordinator dashboard for managing events, attendance, and invitations.
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { EventCard } from '@/components/EventCard';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { GoogleFormQRGenerator } from '@/components/GoogleFormQRGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { CalendarDays, Users, QrCode, Plus, FileText, Sparkles, UserPlus, Loader2, Clock, Building2, GraduationCap, X } from 'lucide-react';
import { DirectoryMember, DirectorySchool, Event, User, EventInvitation } from '@/types';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_SCHOOL, getAllSchools, getBranchesForSchool } from '@/lib/schools';

type DirectoryRole = 'student' | 'coordinator';

interface CoordinatorEventForm {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  school: string;
  department: string;
  invitation_mode: 'invite-only' | 'open';
  allow_self_check_in: boolean;
}

export default function CoordinatorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showGoogleFormQRDialog, setShowGoogleFormQRDialog] = useState(false);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [assignedEvents, setAssignedEvents] = useState<Event[]>([]);
  const [attendanceData, setAttendanceData] = useState<User[]>([]);
  const [stats, setStats] = useState({
    assignedEvents: 0,
    totalAttendees: 0,
    avgFeedbackRating: 0
  });
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEvent, setInviteEvent] = useState<Event | null>(null);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteRole, setInviteRole] = useState<'attendee' | 'coordinator'>('attendee');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSummary, setInviteSummary] = useState<EventInvitation[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const coordinatorSchool = user?.school || DEFAULT_SCHOOL;
  const [createForm, setCreateForm] = useState<CoordinatorEventForm>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    school: coordinatorSchool,
    department: getBranchesForSchool(coordinatorSchool)[0] ?? '',
    invitation_mode: 'invite-only',
    allow_self_check_in: true,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const schoolOptions = useMemo(() => getAllSchools(), []);
  const createBranchOptions = useMemo(() => {
    const branches = getBranchesForSchool(createForm.school);
    return branches.length > 0 ? branches : ['General'];
  }, [createForm.school]);
  const [directoryRole, setDirectoryRole] = useState<DirectoryRole>('student');
  const [directoryData, setDirectoryData] = useState<Record<DirectoryRole, DirectorySchool[]>>({
    student: [],
    coordinator: [],
  });
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [selectedDirectoryMembers, setSelectedDirectoryMembers] = useState<Record<string, DirectoryMember>>({});
  const selectedDirectoryList = useMemo(() => Object.values(selectedDirectoryMembers), [selectedDirectoryMembers]);
  const directorySchools = useMemo(() => directoryData[directoryRole], [directoryData, directoryRole]);
  const manualEmailCount = useMemo(() => inviteEmails.split(/[\n,;]+/).map((email) => email.trim()).filter(Boolean).length, [inviteEmails]);
  const pendingInviteCount = selectedDirectoryList.length + manualEmailCount;

  // Fetch assigned events and high-level stats for the current coordinator.
  const loadData = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  useEffect(() => {
    if (!user?.school) return;
    setCreateForm((prev) => {
      if (createDialogOpen || prev.title || prev.location) {
        return prev;
      }
      const defaultDepartment = getBranchesForSchool(user.school)[0] ?? prev.department;
      return {
        ...prev,
        school: user.school,
        department: defaultDepartment,
      };
    });
  }, [user?.school, createDialogOpen]);

  // Open the QR modal for attendance check-ins.
  const handleGenerateQR = (event: Event) => {
    setSelectedEvent(event);
    setShowQRDialog(true);
  };

  // Launch the Google Form QR modal so feedback links can be distributed.
  const handleGenerateGoogleFormQR = (event: Event) => {
    setSelectedEvent(event);
    setShowGoogleFormQRDialog(true);
  };

  // Pull attendance from the API before showing the roster.
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

  // Fetch directory records grouped by school for bulk invitations.
  const loadDirectoryData = useCallback(async (role: DirectoryRole) => {
    setDirectoryLoading(true);
    try {
      const response = await apiService.getDirectory(role);
      setDirectoryData((prev) => ({
        ...prev,
        [role]: response.schools,
      }));
    } catch (error) {
      toast({
        title: 'Unable to load directory',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setDirectoryLoading(false);
    }
  }, [toast]);

  // Reset selections when toggling between student/coordinator directories.
  const handleDirectoryRoleChange = useCallback(async (role: DirectoryRole) => {
    setDirectoryRole(role);
    setSelectedDirectoryMembers({});
    setInviteRole(role === 'coordinator' ? 'coordinator' : 'attendee');
    if (directoryData[role].length === 0) {
      await loadDirectoryData(role);
    }
  }, [directoryData, loadDirectoryData]);

  // Prepare the invitation dialog with existing invite summaries.
  const openInviteDialog = async (event: Event) => {
    setInviteEvent(event);
    setInviteEmails('');
    setInviteMessage('');
    setInviteDialogOpen(true);
    setInviteLoading(true);
    try {
      await handleDirectoryRoleChange('student');
      const invitations = await apiService.getEventInvitations(event.id);
      setInviteSummary(invitations);
    } catch (error) {
      toast({
        title: 'Unable to load invitations',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive'
      });
      setInviteSummary([]);
    } finally {
      setInviteLoading(false);
    }
  };

  // Send invitations to a mix of directory selections and manual emails.
  const handleSendInvites = async () => {
    if (!inviteEvent) return;
    const emails = inviteEmails.split(/[\n,;]+/).map((email) => email.trim()).filter(Boolean);
    const directoryInvitees = selectedDirectoryList.map((member) => ({
      userId: member.id,
      roleAtEvent: directoryRole === 'coordinator' ? 'coordinator' : 'attendee' as const,
      message: inviteMessage || undefined,
    }));
    const manualInvitees = emails.map((email) => ({
      email,
      roleAtEvent: inviteRole,
      message: inviteMessage || undefined,
    }));

    if (directoryInvitees.length === 0 && manualInvitees.length === 0) {
      toast({
        title: 'No invitees selected',
        description: 'Select a school/branch or provide email addresses before sending invites.',
        variant: 'destructive'
      });
      return;
    }

    const combinedInvitees = [...directoryInvitees, ...manualInvitees];
    const uniqueInvitees: { userId?: string; email?: string; roleAtEvent: 'coordinator' | 'attendee'; message?: string }[] = [];
    const seen = new Set<string>();
    for (const invitee of combinedInvitees) {
      const key = invitee.userId ? `user:${invitee.userId}` : invitee.email ? `email:${invitee.email.toLowerCase()}` : null;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      uniqueInvitees.push(invitee);
    }
    if (uniqueInvitees.length === 0) {
      toast({
        title: 'Invitees already added',
        description: 'Everyone you selected is already in the invite list.',
        variant: 'destructive'
      });
      return;
    }
    setInviteLoading(true);
    try {
      await apiService.inviteParticipants(inviteEvent.id, uniqueInvitees);
      toast({
        title: 'Invitations sent',
        description: `${uniqueInvitees.length} invitation${uniqueInvitees.length > 1 ? 's' : ''} dispatched.`,
      });
      const refreshed = await apiService.getEventInvitations(inviteEvent.id);
      setInviteSummary(refreshed);
      setInviteEmails('');
      setInviteMessage('');
      setSelectedDirectoryMembers({});
      loadData();
    } catch (error) {
      toast({
        title: 'Unable to send invitations',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setInviteLoading(false);
    }
  };

  // Bulk-select whole departments at once when inviting.
  const addDepartmentMembers = useCallback((members: DirectoryMember[]) => {
    setSelectedDirectoryMembers((prev) => {
      const next = { ...prev } as Record<string, DirectoryMember>;
      members.forEach((member) => {
        if (member?.id) {
          next[member.id] = member;
        }
      });
      return next;
    });
  }, []);

  // Remove individuals from the invite staging list.
  const removeSelectedMember = useCallback((id: string) => {
    setSelectedDirectoryMembers((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev } as Record<string, DirectoryMember>;
      delete next[id];
      return next;
    });
  }, []);

  // Normalise controlled form inputs for the event creation drawer.
  const handleCreateFormChange = useCallback((field: keyof CoordinatorEventForm, value: string | boolean) => {
    setCreateForm((prev) => {
      if (field === 'school' && typeof value === 'string') {
        const nextBranches = getBranchesForSchool(value);
        return {
          ...prev,
          school: value,
          department: nextBranches[0] ?? '',
        };
      }
      if (field === 'allow_self_check_in' && typeof value === 'boolean') {
        return { ...prev, allow_self_check_in: value };
      }
      if (field === 'invitation_mode' && typeof value === 'string') {
        return { ...prev, invitation_mode: value as CoordinatorEventForm['invitation_mode'] };
      }
      return {
        ...prev,
        [field]: value,
      } as CoordinatorEventForm;
    });
  }, []);

  // Persist a new event draft and refresh the coordinator's assignments.
  const handleCreateEvent = useCallback(async () => {
    if (!createForm.title.trim() || !createForm.date || !createForm.time || !createForm.location.trim()) {
      toast({
        title: 'Missing details',
        description: 'Please provide the event title, date, time, and location.',
        variant: 'destructive',
      });
      return;
    }
    if (!createForm.school || !createForm.department) {
      toast({
        title: 'Choose school and branch',
        description: 'Select where this event belongs so students can find it.',
        variant: 'destructive',
      });
      return;
    }

    setCreateLoading(true);
    try {
      await apiService.createCoordinatorEvent({
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        date: createForm.date,
        time: createForm.time,
        location: createForm.location.trim(),
        school: createForm.school,
        department: createForm.department,
        invitation_mode: createForm.invitation_mode,
        allow_self_check_in: createForm.allow_self_check_in,
      });
      toast({
        title: 'Event submitted for approval',
        description: 'The dean will review your request shortly.',
      });
      setCreateDialogOpen(false);
      setCreateForm((prev) => ({
        ...prev,
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        invitation_mode: 'invite-only',
        allow_self_check_in: true,
      }));
      loadData();
    } catch (error) {
      toast({
        title: 'Unable to create event',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setCreateLoading(false);
    }
  }, [createForm, loadData, toast]);

  const statsDisplay = [
    { label: 'Assigned Events', value: stats.assignedEvents, icon: CalendarDays, color: 'bg-primary' },
    { label: 'Total Attendees', value: stats.totalAttendees, icon: Users, color: 'bg-success' },
    { label: 'Pending Approvals', value: assignedEvents.filter((event) => event.approval_status !== 'approved').length, icon: Clock, color: 'bg-warning' }
  ];

  const renderDirectory = () => (
    <ScrollArea className="max-h-64 rounded-md border bg-background/60 p-2">
      {directoryLoading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading {directoryRole === 'coordinator' ? 'coordinators' : 'students'}...
        </div>
      ) : directorySchools.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          No {directoryRole === 'coordinator' ? 'coordinators' : 'students'} found in the directory.
        </div>
      ) : (
        <div className="space-y-3">
          {directorySchools.map((school) => {
            const schoolMembers = school.departments.flatMap((dept) => dept.members ?? []);
            const hasMembers = schoolMembers.length > 0;
            return (
              <div key={`${directoryRole}-${school.school}`} className="rounded-lg border bg-background p-3 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium leading-tight">{school.school}</p>
                      <p className="text-xs text-muted-foreground">
                        {school.totalMembers} {directoryRole === 'coordinator' ? 'coordinator' : 'student'}{school.totalMembers === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!hasMembers}
                    onClick={() => addDepartmentMembers(schoolMembers)}
                    className="shrink-0"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add school
                  </Button>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {school.departments.map((dept) => (
                    <button
                      key={`${school.school}-${dept.department}`}
                      type="button"
                      onClick={() => addDepartmentMembers(dept.members ?? [])}
                      className="flex items-center justify-between gap-3 rounded-md border bg-muted px-3 py-2 text-left transition-colors hover:bg-muted/80"
                      disabled={dept.count === 0}
                    >
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{dept.department}</span>
                      </div>
                      <Badge variant="outline">{dept.count}</Badge>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ScrollArea>
  );

  return (
    <Layout title="Coordinator Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Coordinator Dashboard</h1>
          <p className="text-muted-foreground">Manage your assigned events</p>
        </div>

        {assignedEvents.some((event) => event.approval_status !== 'approved') && (
          <Card className="border-warning/40 bg-warning/10">
            <CardContent className="py-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-warning-foreground">Approval in progress</p>
                <p className="text-sm text-muted-foreground">
                  QR codes and attendance tools unlock once the dean team approves your event.
                </p>
              </div>
              <Badge variant="outline" className="uppercase tracking-wide">
                {assignedEvents.filter((event) => event.approval_status !== 'approved').length} pending
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Google Form CTA Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Create Interactive Events</h3>
                  <p className="text-blue-700 text-sm">
                    Generate QR codes for Google Forms to collect feedback and registrations from attendees
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Learn More
                </Button>
                <Button 
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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
                  onGenerateGoogleFormQR={() => handleGenerateGoogleFormQR(event)}
                  onViewAttendance={() => handleViewAttendance(event)}
                  onManageInvites={() => openInviteDialog(event)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Dialog
          open={createDialogOpen}
          onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (!open) {
              setCreateLoading(false);
              setCreateForm((prev) => ({
                ...prev,
                title: '',
                description: '',
                date: '',
                time: '',
                location: '',
                invitation_mode: 'invite-only',
                allow_self_check_in: true,
              }));
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create a new event</DialogTitle>
              <DialogDescription>
                Draft your event details and send them to the dean for approval.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="eventTitle">Event Title</Label>
                  <Input
                    id="eventTitle"
                    value={createForm.title}
                    onChange={(e) => handleCreateFormChange('title', e.target.value)}
                    placeholder="AI & Emerging Tech Summit"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventLocation">Location</Label>
                  <Input
                    id="eventLocation"
                    value={createForm.location}
                    onChange={(e) => handleCreateFormChange('location', e.target.value)}
                    placeholder="Main Auditorium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Date</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={createForm.date}
                    onChange={(e) => handleCreateFormChange('date', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventTime">Time</Label>
                  <Input
                    id="eventTime"
                    type="time"
                    value={createForm.time}
                    onChange={(e) => handleCreateFormChange('time', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventDescription">Description</Label>
                <Textarea
                  id="eventDescription"
                  value={createForm.description}
                  onChange={(e) => handleCreateFormChange('description', e.target.value)}
                  placeholder="Share a short overview, agenda highlights, or special guests."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>School</Label>
                  <Select value={createForm.school} onValueChange={(value) => handleCreateFormChange('school', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select school" />
                    </SelectTrigger>
                    <SelectContent>
                      {schoolOptions.map((school) => (
                        <SelectItem key={school} value={school}>
                          {school}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Branch / Department</Label>
                  <Select value={createForm.department} onValueChange={(value) => handleCreateFormChange('department', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {createBranchOptions.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Invitation Mode</Label>
                  <Select
                    value={createForm.invitation_mode}
                    onValueChange={(value: 'invite-only' | 'open') => handleCreateFormChange('invitation_mode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invite-only">Invite only</SelectItem>
                      <SelectItem value="open">Open to all</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center justify-between text-sm font-medium">
                    Allow self check-in
                    <Switch
                      checked={createForm.allow_self_check_in}
                      onCheckedChange={(checked) => handleCreateFormChange('allow_self_check_in', checked)}
                    />
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    When disabled, only coordinators can mark attendance for attendees.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEvent} disabled={createLoading} className="gap-2">
                {createLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit for Approval
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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

        {/* Google Form QR Code Dialog */}
        <Dialog open={showGoogleFormQRDialog} onOpenChange={setShowGoogleFormQRDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Google Form QR Code Generator</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <GoogleFormQRGenerator 
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

        {/* Invite Participants Dialog */}
        <Dialog
          open={inviteDialogOpen}
          onOpenChange={(open) => {
            setInviteDialogOpen(open);
            if (!open) {
              setInviteEvent(null);
              setInviteSummary([]);
              setInviteEmails('');
              setInviteMessage('');
              setSelectedDirectoryMembers({});
              setDirectoryRole('student');
              setInviteRole('attendee');
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invite Participants</DialogTitle>
              <DialogDescription>
                Send invites to coordinators or attendees for this event.
              </DialogDescription>
            </DialogHeader>
            {inviteEvent ? (
              <div className="space-y-5">
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="font-semibold">{inviteEvent.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(inviteEvent.date).toLocaleString()} • {inviteEvent.location}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Approval status: <span className="font-medium capitalize">{inviteEvent.approval_status}</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Invite Type</Label>
                  <div className="flex flex-col gap-3 rounded-lg border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        {directoryRole === 'coordinator' ? (
                          <Users className="h-5 w-5 text-primary" />
                        ) : (
                          <GraduationCap className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium leading-tight">
                          {directoryRole === 'coordinator'
                            ? 'Invite fellow coordinators to co-host your event'
                            : 'Invite students by selecting their school and branch'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Switch tabs below to change between students and coordinators.
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="w-fit">
                      {directoryRole === 'coordinator' ? 'Co-coordinator' : 'Attendee'}
                    </Badge>
                  </div>
                </div>

                <Tabs value={directoryRole} onValueChange={(value) => handleDirectoryRoleChange(value as DirectoryRole)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="student">Students</TabsTrigger>
                    <TabsTrigger value="coordinator">Coordinators</TabsTrigger>
                  </TabsList>
                  <TabsContent value="student" className="mt-3">
                    {renderDirectory()}
                  </TabsContent>
                  <TabsContent value="coordinator" className="mt-3">
                    {renderDirectory()}
                  </TabsContent>
                </Tabs>

                {selectedDirectoryList.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected from directory</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedDirectoryList.map((member) => (
                        <Badge key={member.id} variant="secondary" className="flex items-center gap-1">
                          <span>{member.name}</span>
                          <button
                            type="button"
                            onClick={() => removeSelectedMember(member.id)}
                            className="rounded-full p-0.5 hover:bg-secondary-foreground/10"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Email addresses (optional)</Label>
                  <Textarea
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                    placeholder="someone@example.com\nanother@example.com"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use this field to invite people who are not yet in the directory.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Message (optional)</Label>
                  <Textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Add a note that will be included in the invite email"
                    rows={3}
                  />
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setInviteDialogOpen(false);
                      setInviteEvent(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSendInvites} disabled={inviteLoading} className="gap-2">
                    {inviteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {pendingInviteCount > 0
                      ? `Send ${pendingInviteCount} invite${pendingInviteCount > 1 ? 's' : ''}`
                      : 'Send Invites'}
                  </Button>
                </DialogFooter>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Existing invitations</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {inviteSummary.map((invitation) => (
                      <div key={invitation.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">{invitation.invitee.name}</p>
                          <p className="text-xs text-muted-foreground">{invitation.invitee.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={invitation.status === 'accepted' ? 'secondary' : invitation.status === 'pending' ? 'outline' : 'destructive'}>
                            {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                          </Badge>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {invitation.role_at_event === 'coordinator' ? 'Co-coordinator' : 'Attendee'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {inviteSummary.length === 0 && !inviteLoading && (
                      <p className="text-sm text-muted-foreground">No invitations yet for this event.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select an event to manage invitations.</p>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
