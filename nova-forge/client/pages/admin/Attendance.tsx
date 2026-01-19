import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceService } from '@/services/attendance';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Download, Search, Filter } from 'lucide-react';

const AdminAttendance: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: attendance, isLoading } = useQuery({
    queryKey: ['allAttendance'],
    queryFn: attendanceService.getAllAttendance,
  });

  const filteredAttendance = attendance?.filter((record) =>
    (record.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Attendance Monitoring</h1>
          <p className="text-gray-400">Track organization-wide attendance and working hours.</p>
        </div>
        <Button
          variant="outline"
          className="border-white/10 text-gray-300 hover:text-white"
          onClick={() => {
            if (!filteredAttendance) return;
            const csvContent = [
              ['Employee', 'Date', 'Check In', 'Check Out', 'Status'],
              ...filteredAttendance.map(r => [
                `"${r.employeeName}"`,
                r.date,
                r.checkIn,
                r.checkOut || '--:--',
                r.status.toUpperCase()
              ])
            ].map(e => e.join(',')).join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
        <Button
          variant="outline"
          className="border-white/10 text-gray-300 hover:text-white print:hidden"
          onClick={() => window.print()}
        >
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>

        <style>{`
            @media print {
                .print\\:hidden { display: none !important; }
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
      </div>

      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <CardTitle className="text-white">Daily Logs</CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="outline" className="border-white/10 text-gray-300">
                <Filter className="w-4 h-4 mr-2" />
                Filter Date
              </Button>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search employee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
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
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-gray-400">Employee</TableHead>
                  <TableHead className="text-gray-400">Date</TableHead>
                  <TableHead className="text-gray-400">Check In</TableHead>
                  <TableHead className="text-gray-400">Check Out</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance?.map((record) => (
                  <TableRow key={record.id} className="border-white/10 hover:bg-white/5 transition-colors">
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {(record.employeeName || '?').charAt(0)}
                        </div>
                        {record.employeeName}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">{record.date}</TableCell>
                    <TableCell className="text-gray-300">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-neon-lime" />
                        {record.checkIn}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {record.checkOut ? (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-neon-magenta" />
                          {record.checkOut}
                        </div>
                      ) : (
                        <span className="text-gray-600">--:--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                            ${record.status === 'present' ? 'bg-emerald-500/10 text-emerald-400' :
                          record.status === 'late' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-red-500/10 text-red-400'}`}>
                        {record.status.toUpperCase()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAttendance;
