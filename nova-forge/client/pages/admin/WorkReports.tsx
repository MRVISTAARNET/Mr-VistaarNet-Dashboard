import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { workReportService, WorkReport } from '@/services/workReports';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Search, Calendar, User, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AdminWorkReports: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [selectedReport, setSelectedReport] = useState<WorkReport | null>(null);

    const { data: reports, isLoading } = useQuery({
        queryKey: ['allWorkReports'],
        queryFn: workReportService.getAllReports,
    });

    const filteredReports = reports?.filter(report => {
        const matchesSearch = report.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = dateFilter ? report.date === dateFilter : true;
        return matchesSearch && matchesDate;
    });

    return (
        <div className="space-y-6 animate-fade-in">

            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Work Reports</h1>
                <p className="text-muted-foreground">Monitor daily work submissions from all employees.</p>
            </div>

            <Card className="border-border bg-card/50 backdrop-blur-xl">
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <CardTitle className="text-foreground flex items-center gap-2">
                            <FileText className="w-5 h-5 text-neon-cyan" />
                            Submission Log
                        </CardTitle>
                        <div className="flex gap-4 w-full md:w-auto">
                            <Input
                                placeholder="Search by employee..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 bg-accent/5 border-border text-foreground placeholder:text-muted-foreground"
                            />
                        </div>
                        <Input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full md:w-auto bg-accent/5 border-border text-foreground"
                        />
                        <Button
                            onClick={() => {
                                if (!reports) return;
                                const csvContent = [
                                    ['Employee', 'Date', 'Time', 'Hours', 'Description'],
                                    ...reports.map(r => [
                                        `"${r.employeeName}"`,
                                        r.date,
                                        r.timestamp,
                                        r.hoursWorked.toString(),
                                        `"${r.description.replace(/"/g, '""')}"`
                                    ])
                                ].map(e => e.join(',')).join('\n');

                                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                const link = document.createElement('a');
                                link.href = URL.createObjectURL(blob);
                                link.download = `work_reports_${new Date().toISOString().split('T')[0]}.csv`;
                                link.click();
                            }}
                            className="bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/20"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            export CSV
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-muted/50">
                                    <TableHead className="text-muted-foreground">Employee</TableHead>
                                    <TableHead className="text-muted-foreground">Date & Time</TableHead>
                                    <TableHead className="text-muted-foreground">Work Summary</TableHead>
                                    <TableHead className="text-muted-foreground">Hours</TableHead>
                                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredReports?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No reports found matching your filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {filteredReports?.map((report) => (
                                    <TableRow key={report.id} className="border-border hover:bg-muted/50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8 border border-border">
                                                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(report.employeeName)}&background=random`} />
                                                    <AvatarFallback>{report.employeeName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium text-foreground">{report.employeeName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            <div className="flex flex-col">
                                                <span>{report.date}</span>
                                                <span className="text-xs text-muted-foreground">{report.timestamp}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-foreground max-w-md">
                                            <p className="truncate text-sm opacity-80">{report.description}</p>
                                        </TableCell>
                                        <TableCell className="text-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3 h-3 text-neon-cyan" />
                                                {report.hoursWorked}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-neon-cyan hover:text-neon-cyan/80 hover:bg-neon-cyan/10"
                                                        onClick={() => setSelectedReport(report)}
                                                    >
                                                        View Details
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="bg-card border-border text-foreground max-w-lg">
                                                    <DialogHeader>
                                                        <DialogTitle className="flex items-center gap-2">
                                                            <FileText className="w-5 h-5 text-neon-cyan" />
                                                            Report Detail
                                                        </DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-6 pt-4">
                                                        <div className="flex items-center gap-4 p-4 bg-accent/5 rounded-lg border border-border">
                                                            <Avatar className="w-12 h-12 border border-border">
                                                                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedReport?.employeeName || '')}&background=random`} />
                                                                <AvatarFallback>U</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <h3 className="font-semibold text-lg">{selectedReport?.employeeName}</h3>
                                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {selectedReport?.date}</span>
                                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {selectedReport?.timestamp}</span>
                                                                </div>
                                                            </div>
                                                            <div className="ml-auto text-2xl font-bold text-neon-cyan">
                                                                {selectedReport?.hoursWorked}<span className="text-sm font-normal text-muted-foreground ml-1">hrs</span>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Work Description</h4>
                                                            <div className="p-4 rounded-lg bg-accent/5 border border-border min-h-[200px] text-foreground whitespace-pre-wrap">
                                                                {selectedReport?.description}
                                                            </div>
                                                        </div>
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
        </div >
    );
};

export default AdminWorkReports;
