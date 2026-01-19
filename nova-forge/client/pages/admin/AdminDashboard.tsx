import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { statsService } from '@/services/stats';
import { leaveService } from '@/services/leave';
import { messageService } from '@/services/messages';
import { announcementService } from '@/services/announcements';
import {
  Users,
  BarChart3,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Calendar,
  FileText,
  ArrowRight,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface MetricCard {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  link: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // 1. Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: statsService.getAdminStats
  });

  // 2. Real Leaves for Recent Activity
  const { data: leaves, isLoading: leavesLoading } = useQuery({
    queryKey: ['allLeaves'],
    queryFn: leaveService.getAllLeaves
  });

  // 3. Real Messages for Recent Activity
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['allMessages'],
    queryFn: messageService.getAllMessages
  });

  // 4. Real Announcements
  const { data: announcements, isLoading: announcementsLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: announcementService.getAll
  });

  // 5. Data for Charts
  const { data: allAttendance } = useQuery({
    queryKey: ['allAttendance'],
    queryFn: () => import('@/services/attendance').then(m => m.attendanceService.getAllAttendance()),
  });

  // Calculate Attendance Trend (Last 5 Days)
  const attendanceTrend = React.useMemo(() => {
    const days = [];
    const today = new Date();
    const totalEmployees = stats?.totalEmployees || 1; // Avoid divide by zero

    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      // Count unique employees present on this date
      const presentCount = (allAttendance || []).filter(r => r.date === dateStr).length;
      const percentage = Math.round((presentCount / totalEmployees) * 100);

      days.push({ day: dayName, percentage: Math.min(percentage, 100) });
    }
    return days;
  }, [allAttendance, stats?.totalEmployees]);

  // Calculate Status Distribution (Today)
  const statusDistribution = React.useMemo(() => {
    const total = stats?.totalEmployees || 0;
    const present = stats?.presentToday || 0;
    const leave = stats?.onLeave || 0;
    const absent = Math.max(0, total - present - leave); // Remaining are absent/inactive

    return [
      { name: 'Present', value: present, color: '#84cc16' }, // neon-lime
      { name: 'On Leave', value: leave, color: '#22d3ee' }, // neon-cyan
      { name: 'Absent', value: absent, color: '#e879f9' }, // neon-purple (using as "Absent" color)
    ];
  }, [stats]);


  const isLoading = statsLoading || leavesLoading || messagesLoading || announcementsLoading;

  // Combine and Sort Recent Activity
  const recentActivity = React.useMemo(() => {
    const combined = [];

    if (leaves) {
      combined.push(...leaves.map(l => ({
        id: l.id,
        type: 'leave' as const,
        description: `Leave request from ${l.employeeName}`,
        timestamp: l.createdAt,
        status: l.status,
        dateObj: new Date(l.createdAt || l.startDate)
      })));
    }

    if (messages) {
      combined.push(...messages.map(m => ({
        id: m.id,
        type: 'message' as const,
        description: `Message from ${m.senderName}: "${m.content.substring(0, 30)}${m.content.length > 30 ? '...' : ''}"`,
        // Start using 'timestamp' from message, fallback to now if missing
        timestamp: m.timestamp || new Date().toISOString(),
        status: m.isRead ? 'read' : 'unread',
        dateObj: new Date(m.timestamp || new Date().toISOString())
      })));
    }

    // Sort descending by date
    return combined.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime()).slice(0, 5);
  }, [leaves, messages]);

  const metrics: MetricCard[] = [
    {
      label: 'Total Employees',
      value: stats?.totalEmployees || 0,
      change: 0, // No historical data for change yet
      icon: <Users className="w-6 h-6" />,
      color: 'neon-cyan',
      link: '/admin/employees'
    },
    {
      label: 'Present Today',
      value: stats?.presentToday || 0,
      // We could calculate change if we had yesterday's data, for now static or 0
      change: 0,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'neon-lime',
      link: '/admin/attendance'
    },
    {
      label: 'Pending Requests',
      value: stats?.pendingRequests || 0,
      change: 0,
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'neon-magenta',
      link: '/admin/leave'
    },
    {
      label: 'On Leave',
      value: stats?.onLeave || 0,
      icon: <Calendar className="w-6 h-6" />,
      color: 'neon-purple',
      link: '/admin/leave'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-neon-lime/20 text-neon-lime';
      case 'pending': return 'bg-neon-magenta/20 text-neon-magenta';
      case 'read': return 'bg-neon-cyan/20 text-neon-cyan';
      case 'unread': return 'bg-neon-purple/20 text-neon-purple';
      default: return 'bg-muted text-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-foreground/60">
          Welcome back! Here's your system overview.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            onClick={() => navigate(metric.link)}
            className="card-glass group hover:border-white/30 transition-all duration-300 hover:shadow-lg cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${metric.color}/10 text-${metric.color} group-hover:scale-110 transition-transform duration-300`}>
                {metric.icon}
              </div>
            </div>
            <p className="text-foreground/60 text-sm mb-2">{metric.label}</p>
            <p className="text-3xl font-bold text-foreground">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Charts and Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Summary */}
        <div className="card-glass lg:col-span-2 min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-neon-cyan" />
              Attendance Summary (Last 5 Days)
            </h2>
            <button
              onClick={() => navigate('/admin/attendance')}
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              View All
            </button>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrend}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="day" stroke="#888" />
                <YAxis stroke="#888" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }}
                  itemStyle={{ color: '#22d3ee' }}
                />
                <Area type="monotone" dataKey="percentage" stroke="#22d3ee" fillOpacity={1} fill="url(#colorAttendance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employee Status Distribution */}
        <div className="card-glass min-h-[400px]">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-neon-magenta" />
            Status Distribution (Today)
          </h2>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-foreground/60 text-center">
              Total: <span className="text-foreground font-semibold">{stats?.totalEmployees || 0} employees</span>
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="card-glass lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-neon-cyan" />
              Recent Activity
            </h2>
            <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {recentActivity.length > 0 ? recentActivity.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="p-2 rounded-lg bg-white/5">
                  {log.type === 'leave' && <Calendar className="w-5 h-5 text-neon-magenta" />}
                  {log.type === 'message' && <FileText className="w-5 h-5 text-neon-cyan" />}
                </div>

                <div className="flex-1">
                  <p className="text-sm text-foreground">{log.description}</p>
                  <p className="text-xs text-foreground/40 mt-1">{log.timestamp}</p>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                  {log.status.toUpperCase()}
                </div>
              </div>
            )) : (
              <div className="text-gray-500 text-center py-4">No recent activity</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-glass space-y-3">
          <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>

          <button
            onClick={() => navigate('/admin/employees/add')}
            className="w-full glass rounded-lg p-4 text-left hover:border-primary/50 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Add New Employee</span>
              <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/leave')}
            className="w-full glass rounded-lg p-4 text-left hover:border-primary/50 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Approve Leave Requests</span>
              <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/reports')}
            className="w-full glass rounded-lg p-4 text-left hover:border-primary/50 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">View Reports</span>
              <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/documents')}
            className="w-full glass rounded-lg p-4 text-left hover:border-primary/50 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Verify Documents</span>
              <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Announcements */}
      <div className="card-glass">
        <h2 className="text-xl font-bold text-foreground mb-4">Latest Announcements</h2>
        <div className="space-y-3">
          {announcements && announcements.length > 0 ? announcements.map((ann) => (
            <div
              key={ann.id}
              className={`p-4 rounded-lg border ${ann.priority === 'High'
                ? 'bg-neon-magenta/10 border-neon-magenta/30'
                : ann.priority === 'Low'
                  ? 'bg-neon-lime/10 border-neon-lime/30'
                  : 'bg-neon-cyan/10 border-neon-cyan/30'
                }`}
            >
              <div className="flex justify-between items-start mb-1">
                <p className="font-semibold text-foreground text-sm">{ann.title}</p>
                <span className="text-[10px] bg-white/10 px-1 rounded">{ann.date}</span>
              </div>
              <p className="text-foreground/60 text-xs">{ann.content}</p>
            </div>
          )) : (
            <p className="text-gray-500 text-sm">No announcements found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
