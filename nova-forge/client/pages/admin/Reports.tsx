import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { statsService } from '@/services/stats';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Reports: React.FC = () => {
    // Fetch Real Data
    const { data: reportsData, isLoading } = useQuery({
        queryKey: ['reportsData'],
        queryFn: statsService.getReportsData,
    });

    // Mock Fallbacks if loading or error
    const attendanceData = reportsData?.attendanceTrend || [
        { name: 'Mon', present: 0, absent: 0, late: 0 },
        { name: 'Tue', present: 0, absent: 0, late: 0 },
        { name: 'Wed', present: 0, absent: 0, late: 0 },
        { name: 'Thu', present: 0, absent: 0, late: 0 },
        { name: 'Fri', present: 0, absent: 0, late: 0 },
    ];

    const departmentData = reportsData?.departmentDistribution || [
        { name: 'No Data', value: 1 },
    ];

    const taskStatusData = reportsData?.taskStatusDistribution || [
        { name: 'No Data', value: 1 },
    ];

    const COLORS = ['#00f3ff', '#ff00ff', '#fbbf24', '#a855f7'];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Reports & Analytics</h1>
                    <p className="text-gray-400">Comprehensive insights into organization performance.</p>
                </div>
                <Button
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/5 print:hidden"
                    onClick={() => window.print()}
                >
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                </Button>
            </div>

            <style>{`
                @media print {
                    .print\\:hidden { display: none !important; }
                    /* Try to hide sidebar if possible, assuming it has a specific class or we print specific area.
                       For now, simple print. */
                    body * {
                        visibility: hidden;
                    }
                    .animate-fade-in, .animate-fade-in * {
                        visibility: visible;
                    }
                    .animate-fade-in {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Attendance Trend */}
                <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white">Attendance Trends (Weekly)</CardTitle>
                        <CardDescription>Daily presence vs absence tracking</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={attendanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="name" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="present" stroke="#00f3ff" strokeWidth={2} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Department Distribution */}
                <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white">Department Distribution</CardTitle>
                        <CardDescription>Employee count by department</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={departmentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {departmentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Task Status */}
                <Card className="border-white/10 bg-black/40 backdrop-blur-xl md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-white">Task Completion Status</CardTitle>
                        <CardDescription>Overview of task progress across all teams</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={taskStatusData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }}
                                />
                                <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                                    {taskStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
