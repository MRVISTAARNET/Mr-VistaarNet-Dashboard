import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveService } from '@/services/leave';
import { useAuth } from '@/hooks/useAuth';
import { LeaveCalendar } from '@/components/LeaveCalendar';
import { LeaveBalances } from './LeaveBalances';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';

const Leave: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    type: 'Sick' as const,
    startDate: '',
    endDate: '',
    reason: ''
  });

  const { data: leaves, isLoading } = useQuery({
    queryKey: ['myLeaves', user?.id],
    queryFn: () => leaveService.getMyLeaves(user?.id || ''),
    enabled: !!user?.id,
  });

  const { data: holidays = [] } = useQuery({
    queryKey: ['holidays', new Date().getFullYear()],
    queryFn: () => import('@/services/holidays').then(m => m.holidayService.getHolidays(new Date().getFullYear()))
  });

  const { data: policies } = useQuery({
    queryKey: ['leavePolicies'],
    queryFn: () => import('@/services/api').then(m => m.api.get<Record<string, number>>('/analytics/policies')),
  });

  const applyMutation = useMutation({
    mutationFn: leaveService.applyLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLeaves'] });
      setIsDialogOpen(false);
      toast.success('Leave application submitted');
      setFormData({ type: 'Sick', startDate: '', endDate: '', reason: '' });
    },
    onError: () => {
      toast.error('Failed to submit application');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.startDate || !formData.endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    applyMutation.mutate({
      ...formData,
      employeeId: user.id,
      employeeName: user.name
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Leave Management</h1>
          <p className="text-gray-400">Track balance and apply for time off.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-neon-magenta hover:bg-neon-magenta/80 text-white shadow-lg shadow-neon-magenta/20 transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Apply for Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-white/10 text-white sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Apply for Leave</DialogTitle>
              <DialogDescription className="text-gray-400">
                Fill in the details below. Admin approval required.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/10 text-white">
                    <SelectItem value="Sick">Sick Leave</SelectItem>
                    <SelectItem value="Casual">Casual Leave</SelectItem>
                    <SelectItem value="Earned">Earned Leave</SelectItem>
                    <SelectItem value="Unpaid">Unpaid Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    className="bg-white/5 border-white/10"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    className="bg-white/5 border-white/10"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Input
                  placeholder="E.g., Medical emergency"
                  className="bg-white/5 border-white/10"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                />
              </div>
              <DialogFooter className="mt-6">
                <Button type="submit" disabled={applyMutation.isPending} className="bg-neon-magenta hover:bg-neon-magenta/90 text-white w-full">
                  {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Balances - Dynamic */}
            <LeaveBalances policies={policies} leaves={leaves} />
          </div>

          <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-gray-400">Type</TableHead>
                      <TableHead className="text-gray-400">Duration</TableHead>
                      <TableHead className="text-gray-400">Reason</TableHead>
                      <TableHead className="text-gray-400">Applied On</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaves?.map((leave) => (
                      <TableRow key={leave.id} className="border-white/10 hover:bg-white/5 transition-colors">
                        <TableCell className="font-medium text-white">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full 
                                                        ${leave.type === 'Sick' ? 'bg-neon-lime' :
                                leave.type === 'Casual' ? 'bg-neon-cyan' :
                                  'bg-neon-purple'}`}
                            />
                            {leave.type}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {leave.startDate} <span className="text-gray-600 px-1">to</span> {leave.endDate}
                        </TableCell>
                        <TableCell className="text-gray-400 italic">"{leave.reason}"</TableCell>
                        <TableCell className="text-gray-500">
                          {new Date(leave.createdAt).toLocaleDateString([], {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                    ${leave.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              leave.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {leaves?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          No leave applications found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <LeaveCalendar
            leaves={leaves || []}
            holidays={holidays}
            title="My Leave Calendar"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leave;
