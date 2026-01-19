import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, PartyPopper } from 'lucide-react';
import { Holiday } from '@/services/holidays';
import { LeaveRequest } from '@/services/leave';

interface LeaveCalendarProps {
    leaves: LeaveRequest[];
    holidays: Holiday[];
    onDayClick?: (date: Date) => void;
    title?: string;
    className?: string;
    isAdmin?: boolean;
}

export const LeaveCalendar: React.FC<LeaveCalendarProps> = ({
    leaves,
    holidays,
    onDayClick,
    title = "Leave & Festival Calendar",
    className = "",
    isAdmin = false
}) => {
    const [currentDate, setCurrentDate] = React.useState(new Date());

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

    return (
        <Card className={`border-white/10 bg-black/40 backdrop-blur-xl ${className}`}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-white flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-neon-cyan" />
                            {title}
                        </CardTitle>
                        <CardDescription>Overview of leaves and upcoming holidays.</CardDescription>
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
                        const dateObj = new Date(currentYear, currentMonth, dayNum);
                        const isToday = dayNum === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();

                        // Check for holidays
                        const holiday = holidays.find(h => h.date === dateStr);
                        const isWeekend = dateObj.getDay() === 0; // Sunday

                        const dayLeaves = leaves?.filter(l => {
                            if (l.status !== 'approved') return false;
                            const start = new Date(l.startDate);
                            const end = new Date(l.endDate);
                            const current = new Date(dateStr);
                            start.setHours(0, 0, 0, 0);
                            end.setHours(0, 0, 0, 0);
                            current.setHours(0, 0, 0, 0);
                            return current >= start && current <= end;
                        }) || [];

                        return (
                            <div
                                key={dayNum}
                                onClick={() => onDayClick && onDayClick(dateObj)}
                                className={`min-h-[120px] p-2 transition-colors relative group border-t border-r border-white/5 flex flex-col gap-1
                  ${isWeekend ? 'bg-black/60' : 'bg-black/20 hover:bg-white/5'}
                  ${isToday ? 'bg-primary/5' : ''}
                  ${onDayClick ? 'cursor-pointer' : ''}
                `}
                            >
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

                                {/* On Admin view, hint that clicking adds a holiday */}
                                {isAdmin && !holiday && !dayLeaves.length && (
                                    <div className="hidden group-hover:flex absolute inset-0 items-center justify-center bg-black/40 text-xs text-gray-400">
                                        + Add Event
                                    </div>
                                )}

                                <div className="space-y-1 mt-1 overflow-y-auto max-h-[80px] custom-scrollbar z-10">
                                    {dayLeaves.map((leave, idx) => (
                                        <div
                                            key={`${dayNum}-${idx}`}
                                            className={`p-1.5 rounded-md text-xs truncate border cursor-help transition-all hover:scale-[1.02]
                        ${leave.type === 'Sick' ? 'bg-neon-lime/10 text-neon-lime border-neon-lime/20' :
                                                    leave.type === 'Casual' ? 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20' :
                                                        'bg-neon-purple/10 text-neon-purple border-neon-purple/20'}`}
                                            title={`${leave.employeeName} - ${leave.type} (${leave.reason})`}
                                            onClick={(e) => e.stopPropagation()}
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
    );
};
