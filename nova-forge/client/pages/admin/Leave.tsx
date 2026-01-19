import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveService, LeaveRequest } from '@/services/leave';
import { api } from '@/services/api';
import { holidayService, Holiday } from '@/services/holidays';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Check,
  X,
  Calendar,
  Clock,
  Search,
  CheckCircle,
  XCircle,
  Edit2,
  ChevronLeft,
  ChevronRight,
  PartyPopper
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AdminLeave: React.FC = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'pending'>('all');
  const [editingPolicy, setEditingPolicy] = useState<{ type: string, days: number } | null>(null);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: leaves, isLoading } = useQuery({
    queryKey: ['allLeaves'],
    queryFn: leaveService.getAllLeaves,
  });

  const { data: policies, isLoading: policiesLoading } = useQuery({
    queryKey: ['leavePolicies'],
    queryFn: () => api.get<Record<string, number>>('/analytics/policies'),
  });

  const { data: holidays = [] } = useQuery({
    queryKey: ['holidays', currentDate.getFullYear()],
    queryFn: () => holidayService.getHolidays(currentDate.getFullYear())
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
      leaveService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allLeaves'] });
      toast.success('Leave status updated');
    }
  });

  const policyMutation = useMutation({
    mutationFn: (data: { type: string, days: number }) => api.post('/analytics/policies', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leavePolicies'] });
      toast.success('Policy updated successfully');
      setEditingPolicy(null);
    },
    onError: () => toast.error('Failed to update policy')
  });

  const handleAction = (id: string, status: 'approved' | 'rejected') => {
    updateMutation.mutate({ id, status });
  };

  const handleUpdatePolicy = () => {
    if (editingPolicy) {
      policyMutation.mutate(editingPolicy);
    }
  };

  const filteredLeaves = leaves?.filter(l =>
    filter === 'all' ? true : l.status === 'pending'
  ).sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return 0;
  });

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Leave Requests</h1>
          <p className="text-gray-400">Manage and approve employee leave applications.</p>
        </div>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="policies">Leave Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-6">
          <div className="flex justify-end mb-4 bg-white/5 p-1 rounded-lg border border-white/10 w-fit ml-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'all'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              All Requests
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'pending'
                ? 'bg-neon-magenta text-white hover:text-white shadow-lg shadow-neon-magenta/20'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              Pending Approval
            </button>
          </div>
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="rounded-md border border-white/10 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-white/5">
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-gray-400">Employee</TableHead>
                        <TableHead className="text-gray-400">Leave Type</TableHead>
                        <TableHead className="text-gray-400">Duration</TableHead>
                        <TableHead className="text-gray-400">Reason</TableHead>
                        <TableHead className="text-gray-400 w-[200px]">Actions / Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeaves?.map((leave) => (
                        <TableRow key={leave.id} className="border-white/10 hover:bg-white/5 transition-colors">
                          <TableCell className="font-medium text-white">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                                {(leave.employeeName || '?').charAt(0)}
                              </div>
                              <div>
                                <p>{leave.employeeName}</p>
                                <p className="text-xs text-gray-500">Applied on {new Date(leave.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                                    ${leave.type.toLowerCase() === 'sick' ? 'bg-neon-lime/10 text-neon-lime' :
                                leave.type.toLowerCase() === 'casual' ? 'bg-neon-cyan/10 text-neon-cyan' :
                                  leave.type.toLowerCase() === 'earned' ? 'bg-neon-purple/10 text-neon-purple' :
                                    'bg-gray-500/10 text-gray-400'}`}>
                              {leave.type}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            <div className="flex flex-col text-sm">
                              <span>From: {leave.startDate}</span>
                              <span>To: {leave.endDate}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-400 italic max-w-xs truncate">
                            "{leave.reason}"
                          </TableCell>
                          <TableCell>
                            {leave.status === 'pending' ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20"
                                  onClick={() => handleAction(leave.id, 'approved')}
                                  disabled={updateMutation.isPending}
                                >
                                  <Check className="w-4 h-4 mr-1" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20"
                                  onClick={() => handleAction(leave.id, 'rejected')}
                                  disabled={updateMutation.isPending}
                                >
                                  <X className="w-4 h-4 mr-1" /> Reject
                                </Button>
                              </div>
                            ) : (
                              <div className={`flex items-center gap-2 text-sm font-medium
                                                        ${leave.status === 'approved' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {leave.status === 'approved' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredLeaves?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500 py-12">
                            No leave requests found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-neon-cyan" />
                    Leave & Festival Calendar
                  </CardTitle>
                  <CardDescription>Overview of employee leaves and upcoming holidays.</CardDescription>
                </div>
                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
                  <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 text-white hover:bg-white/10"><ChevronLeft className="h-4 w-4" /></Button>
                  <span className="text-sm font-medium text-white min-w-[120px] text-center">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 text-white hover:bg-white/10"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-px bg-white/10 border border-white/10 rounded-lg overflow-hidden">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="bg-black/60 p-3 text-center text-sm font-semibold text-gray-400 border-b border-white/5">
                    {day}
                  </div>
                ))}

                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-black/40 min-h-[120px] p-2" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isToday = dayNum === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();

                  // Check for holidays
                  const holiday = holidays.find(h => h.date === dateStr);
                  const isWeekend = new Date(currentYear, currentMonth, dayNum).getDay() === 0; // Sunday

                  const dayLeaves = leaves?.filter(l => {
                    if (l.status !== 'approved') return false;
                    const start = new Date(l.startDate || l.createdAt);
                    const end = new Date(l.endDate || l.createdAt);
                    const current = new Date(dateStr);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(0, 0, 0, 0);
                    current.setHours(0, 0, 0, 0);
                    return current >= start && current <= end;
                  }) || [];

                  return (
                    <div key={dayNum} className={`min-h-[120px] p-2 transition-colors relative group border-t border-r border-white/5 flex flex-col gap-1
                      ${isWeekend ? 'bg-black/60' : 'bg-black/20 hover:bg-white/5'}
                      ${isToday ? 'bg-primary/5' : ''}
                    `}>
                      <div className="flex justify-between items-start">
                        <span className={`text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full 
                          ${isToday ? 'bg-primary text-white' : 'text-gray-400 group-hover:text-white'}
                        `}>
                          {dayNum}
                        </span>
                        {holiday && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-500 border border-yellow-500/20">
                            Holiday
                          </span>
                        )}
                      </div>

                      {holiday && (
                        <div className="mt-1 p-1.5 rounded-md bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 text-xs text-yellow-200 flex items-center gap-1.5">
                          <PartyPopper className="w-3 h-3 text-yellow-500" />
                          <span className="truncate" title={holiday.name}>{holiday.name}</span>
                        </div>
                      )}

                      <div className="space-y-1 mt-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                        {dayLeaves.map((leave, idx) => (
                          <div
                            key={`${dayNum}-${idx}`}
                            className={`p-1.5 rounded-md text-xs truncate border cursor-help transition-all hover:scale-[1.02]
                              ${leave.type.toLowerCase() === 'sick' ? 'bg-neon-lime/10 text-neon-lime border-neon-lime/20' :
                                leave.type.toLowerCase() === 'casual' ? 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20' :
                                  'bg-neon-purple/10 text-neon-purple border-neon-purple/20'}`}
                            title={`${leave.employeeName} - ${leave.type} (${leave.reason})`}
                          >
                            <span className="font-semibold">{leave.employeeName}</span>
                            <span className="hidden group-hover:inline opacity-70"> - {leave.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="mt-6">
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-neon-lime" />
                Live Leave Policies
              </CardTitle>
              <CardDescription>Configure annual leave allocations. Changes reflect immediately in employee dashboards.</CardDescription>
            </CardHeader>
            <CardContent>
              {policiesLoading ? (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {policies && Object.entries(policies).map(([type, days], i) => (
                    <div key={i} className="group relative p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 transition-colors">
                          <Clock className="w-5 h-5 text-neon-cyan group-hover:text-primary" />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-white/10"
                          onClick={() => setEditingPolicy({ type, days })}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <h3 className="font-semibold text-lg text-white mb-1">{type}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan to-neon-lime">
                          {days}
                        </span>
                        <span className="text-sm text-gray-500">Days / Year</span>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/5">
                        <Button
                          variant="outline"
                          className="w-full border-white/10 hover:bg-white/10 hover:text-primary hover:border-primary/50 transition-all text-xs uppercase tracking-wider"
                          onClick={() => setEditingPolicy({ type, days })}
                        >
                          Edit Rules
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Add Policy Placeholder */}
                  <div className="group border border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer min-h-[200px]">
                    <div className="p-3 rounded-full bg-white/5 mb-3 group-hover:scale-110 transition-transform">
                      <Calendar className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-gray-300 font-medium">Add New Policy</h3>
                    <p className="text-xs text-gray-500 mt-1">Coming Soon</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editingPolicy} onOpenChange={(open) => !open && setEditingPolicy(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Leave Policy</DialogTitle>
            <DialogDescription>
              Update the total allocated days for <span className="text-neon-cyan font-medium">{editingPolicy?.type}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="days" className="text-gray-200">Allocated Days per Year</Label>
              <div className="relative">
                <Input
                  id="days"
                  type="number"
                  min="0"
                  value={editingPolicy?.days || 0}
                  onChange={(e) => setEditingPolicy(prev => prev ? { ...prev, days: parseInt(e.target.value) || 0 } : null)}
                  className="bg-slate-800 border-slate-700 text-white pl-10 h-12 text-lg font-medium"
                />
                <Clock className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
              </div>
              <p className="text-xs text-gray-400">This will immediately affect all employee leave balances.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingPolicy(null)} className="hover:bg-white/10 text-gray-300">Cancel</Button>
            <Button
              onClick={handleUpdatePolicy}
              disabled={policyMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[100px]"
            >
              {policyMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLeave;
