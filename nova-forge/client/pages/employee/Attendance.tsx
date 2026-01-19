import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceService } from '@/services/attendance';
import { useAuth } from '@/hooks/useAuth';
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
import { Clock, Calendar, AlertCircle } from 'lucide-react';

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const { data: attendance, isLoading } = useQuery({
    queryKey: ['myAttendance', user?.id],
    queryFn: () => attendanceService.getMyAttendance(user?.id || ''),
    enabled: !!user?.id,
  });

  const [selectedMonth, setSelectedMonth] = React.useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  const filteredAttendance = attendance?.filter(record => record.date.startsWith(selectedMonth));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">My Attendance</h1>
        <p className="text-gray-400">View your daily attendance logs and work hours.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white text-base">Average Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-neon-cyan">8h 45m</div>
            <p className="text-xs text-gray-500 mt-1">Per day this month</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white text-base">On-Time Arrival</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-neon-lime">95%</div>
            <p className="text-xs text-gray-500 mt-1">Excellent record</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white text-base">Late Markings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-neon-magenta">1</div>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Attendance Log</CardTitle>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="month"
              className="bg-black/20 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-primary"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
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
                  <TableHead className="text-gray-400">Date</TableHead>
                  <TableHead className="text-gray-400">Check In</TableHead>
                  <TableHead className="text-gray-400">Check Out</TableHead>
                  <TableHead className="text-gray-400">Total Hours</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance?.map((record) => (
                  <TableRow key={record.id} className="border-white/10 hover:bg-white/5 transition-colors">
                    <TableCell className="font-medium text-white">{record.date}</TableCell>
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
                    <TableCell className="text-white">{record.hoursWorked ? `${record.hoursWorked.toFixed(1)}h` : '-'}</TableCell>
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

export default Attendance;
