import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workReportService, WorkReport } from '@/services/workReports';
import { leaveService } from '@/services/leave';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Clock, Save, History, Pencil } from 'lucide-react';
import { toast } from 'sonner';

const DailyReport: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [description, setDescription] = useState('');
    const [hours, setHours] = useState('8');
    const [editingReport, setEditingReport] = useState<WorkReport | null>(null);

    const { data: reports, isLoading } = useQuery({
        queryKey: ['myReports', user?.id],
        queryFn: () => workReportService.getEmployeeReports(user?.id || ''),
        enabled: !!user?.id
    });

    const { data: leaves } = useQuery({
        queryKey: ['myLeaves', user?.id],
        queryFn: () => leaveService.getMyLeaves(user?.id || ''),
        enabled: !!user?.id
    });

    const submitMutation = useMutation({
        mutationFn: (data: any) => workReportService.createReport(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myReports'] });
            toast.success('Work report submitted successfully');
            setDescription('');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: { id: string, updates: any }) => workReportService.updateReport(data.id, data.updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myReports'] });
            toast.success('Work report updated');
            setEditingReport(null);
        }
    });

    const handleSubmit = () => {
        if (!description.trim()) {
            toast.error('Please enter a description of your work');
            return;
        }

        submitMutation.mutate({
            employeeId: user?.id,
            employeeName: user?.name,
            date: new Date().toISOString().split('T')[0],
            description,
            hoursWorked: Number(hours)
        });
    };

    const handleUpdate = () => {
        if (!editingReport) return;
        updateMutation.mutate({
            id: editingReport.id,
            updates: {
                description: editingReport.description,
                hoursWorked: editingReport.hoursWorked
            }
        });
    };

    const today = new Date().toISOString().split('T')[0];
    const submittedToday = reports?.some(r => r.date === today);
    // Check if user is on approved leave today
    const onLeaveToday = leaves?.find(l =>
        l.status === 'approved' &&
        today >= l.startDate &&
        today <= l.endDate
    );

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Daily Work Report</h1>
                <p className="text-gray-400">Log your daily activities and track your progress.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Submission Form */}
                <Card className="lg:col-span-1 border-white/10 bg-black/40 backdrop-blur-xl h-fit">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-neon-cyan" />
                            Today's Report
                        </CardTitle>
                        <CardDescription>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {submittedToday ? (
                            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center">
                                <p className="font-semibold">You have submitted today's report.</p>
                                <p className="text-sm mt-1">Great job!</p>
                            </div>
                        ) : onLeaveToday ? (
                            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-center">
                                <p className="font-semibold">You are on {onLeaveToday.type} Leave today.</p>
                                <p className="text-sm mt-1">Enjoy your time off!</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label>Hours Worked</Label>
                                    <Input
                                        type="number"
                                        value={hours}
                                        onChange={(e) => setHours(e.target.value)}
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Work Description</Label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="List the tasks you completed today..."
                                        className="min-h-[200px] bg-white/5 border-white/10 text-white resize-none"
                                    />
                                </div>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitMutation.isPending}
                                    className="w-full bg-neon-cyan hover:bg-neon-cyan/80 text-black font-semibold"
                                >
                                    {submitMutation.isPending ? 'Submitting...' : 'Submit Report'} <Save className="w-4 h-4 ml-2" />
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* History List */}
                <Card className="lg:col-span-2 border-white/10 bg-black/40 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <History className="w-5 h-5 text-neon-purple" />
                            Report History
                        </CardTitle>
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
                                        <TableHead className="text-gray-400">Date</TableHead>
                                        <TableHead className="text-gray-400">Work Description</TableHead>
                                        <TableHead className="text-gray-400 w-[100px]">Hours</TableHead>
                                        <TableHead className="text-right text-gray-400 w-[100px] whitespace-nowrap">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reports?.map((report) => (
                                        <TableRow key={report.id} className="border-white/10 hover:bg-white/5">
                                            <TableCell className="text-gray-300 whitespace-nowrap align-top pt-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-white">{report.date}</span>
                                                    <span className="text-xs text-gray-500">{report.timestamp}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-300 align-top pt-4">
                                                <p className="whitespace-pre-wrap line-clamp-3">{report.description}</p>
                                            </TableCell>
                                            <TableCell className="text-gray-300 align-top pt-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-neon-cyan" />
                                                    {report.hoursWorked}h
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right align-top pt-4">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-gray-400 hover:text-white"
                                                            onClick={() => setEditingReport(report)}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="bg-gray-900 border-white/10 text-white">
                                                        <DialogHeader>
                                                            <DialogTitle>Edit Report - {report.date}</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4 pt-4">
                                                            <div className="space-y-2">
                                                                <Label>Hours Worked</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={editingReport?.hoursWorked}
                                                                    onChange={(e) => setEditingReport(prev => prev ? { ...prev, hoursWorked: Number(e.target.value) } : null)}
                                                                    className="bg-white/5 border-white/10 text-white"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Work Description</Label>
                                                                <Textarea
                                                                    value={editingReport?.description}
                                                                    onChange={(e) => setEditingReport(prev => prev ? { ...prev, description: e.target.value } : null)}
                                                                    className="min-h-[200px] bg-white/5 border-white/10 text-white resize-none"
                                                                />
                                                            </div>
                                                            <Button
                                                                onClick={handleUpdate}
                                                                disabled={updateMutation.isPending}
                                                                className="w-full bg-neon-cyan hover:bg-neon-cyan/80 text-black font-semibold"
                                                            >
                                                                Save Changes
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DailyReport;
