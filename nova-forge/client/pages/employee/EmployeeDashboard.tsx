import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { statsService } from '@/services/stats';
import { useAuth } from '@/hooks/useAuth';
import { attendanceService } from '@/services/attendance';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Play,
  FileText,
  Megaphone
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['employeeStats', user?.id],
    queryFn: () => statsService.getEmployeeStats(user?.id || ''),
    enabled: !!user?.id,
  });

  const { data: attendance, isLoading: attendanceLoading, isError: attendanceError } = useQuery({
    queryKey: ['myAttendance', user?.id],
    queryFn: () => attendanceService.getMyAttendance(user?.id || ''),
    enabled: !!user?.id,
  });

  const { data: leaves, isError: leavesError } = useQuery({
    queryKey: ['myLeaves', user?.id],
    queryFn: () => import('@/services/leave').then(m => m.leaveService.getMyLeaves(user?.id || '')),
    enabled: !!user?.id
  });

  const { data: messages, isError: messagesError } = useQuery({
    queryKey: ['myMessages', user?.id],
    queryFn: () => import('@/services/messages').then(m => m.messageService.getAllMessages()),
    enabled: !!user?.id
  });

  const { data: holidays = [] } = useQuery({
    queryKey: ['holidays', new Date().getFullYear()],
    queryFn: () => import('@/services/holidays').then(m => m.holidayService.getHolidays(new Date().getFullYear()))
  });

  const isLoading = statsLoading || attendanceLoading;

  // Safe checks for attendance
  const todayStr = new Date().toISOString().split('T')[0];
  const validAttendance = Array.isArray(attendance) ? attendance.filter(Boolean) : [];
  const todayRecord = validAttendance.find(r => r?.date === todayStr);
  const isClockedIn = !!todayRecord;
  const isCheckedOut = !!todayRecord?.checkOut;

  // Time & Status Logic
  const now = new Date();
  const currentHour = now.getHours();
  // const currentHour = 10; // Debugging: Check late mark logic

  const isBefore9AM = currentHour < 9;
  const isLate = currentHour >= 10;

  const isHolidayToday = holidays.some(h => h.date === todayStr);
  const isOnLeaveToday = leaves?.some(l =>
    l.status === 'approved' &&
    (l.startDate <= todayStr && l.endDate >= todayStr)
  );

  const canClockIn = !isClockedIn && !isBefore9AM && !isHolidayToday && !isOnLeaveToday;
  const canCheckOut = isClockedIn && !isCheckedOut;

  const clockInMutation = useMutation({
    mutationFn: attendanceService.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeStats'] });
      queryClient.invalidateQueries({ queryKey: ['myAttendance'] });
      if (isLate) {
        toast.warning('Clocked in (Late Mark)');
      } else {
        toast.success('Clocked in successfully');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data || error.message || 'Failed to clock in');
    }
  });

  const checkOutMutation = useMutation({
    mutationFn: attendanceService.checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeStats'] });
      queryClient.invalidateQueries({ queryKey: ['myAttendance'] });
      toast.success('Checked out successfully');
    },
    onError: () => {
      toast.error('Failed to check out');
    }
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUserFirstName = () => {
    if (user && user.name) {
      return user.name.split(' ')[0];
    }
    return 'Employee';
  };

  // ... (rest of the file content until the button section)
  // Combine and sort recent activity (Leaves + Messages)
  const recentActivity = React.useMemo(() => {
    const combined = [];

    if (!leavesError && Array.isArray(leaves)) {
      combined.push(...leaves.filter(l => l && (l.createdAt || l.startDate)).map(l => ({
        title: `Applied for ${l.type} Leave`,
        time: l.createdAt || l.startDate,
        type: 'leave',
        color: 'text-neon-magenta',
        timestamp: new Date(l.createdAt || l.startDate).getTime() || 0
      })));
    }

    if (!messagesError && Array.isArray(messages) && user) {
      combined.push(...messages.filter(m => m && (m.senderId === user.id || m.receiverId === user.id)).map(m => ({
        title: m.senderId === user.id ? `Sent message to ${m.receiverName || 'Admin'}` : `Message from ${m.senderName}`,
        time: m.timestamp,
        type: 'message',
        color: 'text-neon-cyan',
        timestamp: new Date(m.timestamp).getTime() || 0
      })));
    }

    return combined.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  }, [leaves, messages, user, leavesError, messagesError]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If critical data fails completely
  if (statsError && attendanceError) {
    return (
      <div className="p-8 text-center text-red-400">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Failed to load dashboard data</h2>
        <p>Please check your connection and try again.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative p-8 rounded-2xl bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-border overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            {getGreeting()}, {getUserFirstName()}!
          </h1>
          <p className="text-gray-100 max-w-xl">
            You have <span className="text-neon-cyan font-bold">{stats?.pendingTasks || 0} pending tasks</span>.
            Have a productive day!
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {!isClockedIn ? (
              <div className="flex flex-col gap-2">
                <Button
                  className={`font-semibold ${isLate
                    ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                    : "bg-neon-lime text-black hover:bg-neon-lime/90"
                    }`}
                  onClick={() => clockInMutation.mutate(user?.id || '')}
                  disabled={!canClockIn || clockInMutation.isPending}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {clockInMutation.isPending ? 'Clocking In...' : isLate ? 'Clock In (Late)' : 'Clock In'}
                </Button>

                {/* Status Messages for blocked state */}
                {isBefore9AM && <p className="text-xs text-gray-400">Check-in starts at 9:00 AM</p>}
                {isHolidayToday && <p className="text-xs text-neon-purple">Today is a Holiday</p>}
                {isOnLeaveToday && <p className="text-xs text-neon-magenta">You are on Leave</p>}
              </div>
            ) : (
              <Button
                variant={canCheckOut ? "default" : "secondary"}
                className={canCheckOut ? "bg-neon-magenta text-white hover:bg-neon-magenta/90" : "bg-white/10 text-white/50 cursor-not-allowed border-white/5"}
                onClick={() => checkOutMutation.mutate(user?.id || '')}
                disabled={!canCheckOut || checkOutMutation.isPending || isCheckedOut}
              >
                <Clock className="w-4 h-4 mr-2" />
                {isCheckedOut ? 'Checked Out' : 'Check Out'}
              </Button>
            )}
          </div>
        </div>

        {/* Decorative Background */}
        <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-10 translate-y-10">
          <Briefcase className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Stats Grid */}
      < div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" >
        {
          [
            { label: 'Attendance', value: `${stats?.attendancePercentage || 0}%`, icon: <CheckCircle className="text-neon-lime" />, color: 'neon-lime', link: '/employee/attendance' },
            { label: 'Leave Balance', value: `${stats?.leaveBalance || 0} Days`, icon: <Calendar className="text-neon-magenta" />, color: 'neon-magenta', link: '/employee/leave' },
            { label: 'Working Hours', value: `${stats?.workingHours || 0} Hrs`, icon: <Clock className="text-neon-cyan" />, color: 'neon-cyan', link: '/employee/attendance' },
            { label: 'Pending Tasks', value: stats?.pendingTasks || 0, icon: <AlertCircle className="text-neon-purple" />, color: 'neon-purple', link: '/employee/tasks' },
          ].map((stat, i) => (
            <Card
              key={i}
              className="border-border bg-card/50 backdrop-blur-xl hover:bg-accent/10 transition-colors cursor-pointer"
              onClick={() => navigate(stat.link)}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}/10 border border-${stat.color}/20`}>
                  {stat.icon}
                </div>
              </CardContent>
            </Card>
          ))
        }
      </div >

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-border bg-card/50">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-accent/5 border border-border">
                    <div className={`p-2 rounded-full bg-accent/10 ${activity.color}`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">Updated recently</p>
                    </div>
                    <span className="text-sm text-muted-foreground font-mono">{activity.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {leavesError || messagesError ? "Failed to load activity" : "No recent activity"}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="border-border bg-card/50">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start border-border text-muted-foreground hover:text-foreground hover:bg-accent h-12"
                onClick={() => navigate('/employee/leave')}
              >
                <Calendar className="w-4 h-4 mr-3 text-neon-magenta" />
                Apply for Leave
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-border text-muted-foreground hover:text-foreground hover:bg-accent h-12"
                onClick={() => navigate('/employee/documents')}
              >
                <FileText className="w-4 h-4 mr-3 text-neon-cyan" />
                View Payslip
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-border text-muted-foreground hover:text-foreground hover:bg-accent h-12"
                onClick={() => navigate('/employee/daily-reports')}
              >
                <FileText className="w-4 h-4 mr-3 text-neon-cyan" />
                Daily Work Report
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-border text-muted-foreground hover:text-foreground hover:bg-accent h-12"
                onClick={() => navigate('/employee/daily-reports')}
              >
                <AlertCircle className="w-4 h-4 mr-3 text-red-400" />
                Report Issue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Announcements at Bottom */}
      <AnnouncementsWidget />
    </div >
  );
};



// Sub-component for Announcements
const AnnouncementsWidget = () => {
  const [selectedAnnouncement, setSelectedAnnouncement] = React.useState<any>(null);
  const { data: announcements, isLoading, isError } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => import('@/services/announcements').then(m => m.announcementService.getAll())
  });

  if (isLoading) return <div className="text-sm text-gray-500">Loading updates...</div>;
  if (isError) return <div className="text-sm text-red-400">Failed to load announcements.</div>;

  if (!announcements || announcements.length === 0) {
    return <div className="text-sm text-gray-500">No new announcements.</div>;
  }

  return (
    <>
      <Card className="border-border bg-card/50 px-0">
        <CardHeader>
          <CardTitle className="text-foreground text-lg flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-neon-cyan" /> Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {announcements.slice(0, 3).map((ann: any) => (
              <div key={ann.id} className="p-4 rounded-lg bg-accent/5 border border-border hover:bg-accent/10 transition-colors flex justify-between items-center group cursor-pointer"
                onClick={() => setSelectedAnnouncement(ann)}>
                <div className="flex-1 mr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground text-base">{ann.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium
                                       ${ann.priority === 'High' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                        ann.priority === 'Low' ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' :
                          'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'}`}>
                      {ann.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-1">{ann.content}</p>
                  <p className="text-[11px] text-gray-500 mt-1">Posted on {ann.date} by {ann.postedBy}</p>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-neon-cyan">
                  Read More
                </Button>
              </div>
            ))}
            {announcements.length > 3 && (
              <div className="text-center mt-2">
                <Button variant="link" className="text-sm text-neon-cyan p-0 h-auto">View All Announcements</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Announcement Details Dialog */}
      {selectedAnnouncement && (
        <Dialog open={!!selectedAnnouncement} onOpenChange={() => setSelectedAnnouncement(null)}>
          <DialogContent className="bg-[#0a0b14] border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center justify-between">
                {selectedAnnouncement.title}
                <span className={`text-xs px-3 py-1 rounded-full border font-normal
                             ${selectedAnnouncement.priority === 'High' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                    selectedAnnouncement.priority === 'Low' ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' :
                      'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'}`}>
                  {selectedAnnouncement.priority} Priority
                </span>
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-400 border-b border-white/10 pb-4">
                <span>📅 {selectedAnnouncement.date}</span>
                <span>•</span>
                <span>👤 Posted by ID: {selectedAnnouncement.postedBy}</span>
              </div>
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
                {selectedAnnouncement.content}
              </div>
            </div>
            <div className="flex justify-end mt-4 pt-4 border-t border-white/10">
              <Button onClick={() => setSelectedAnnouncement(null)} className="bg-white/10 hover:bg-white/20 text-white">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default EmployeeDashboard;
