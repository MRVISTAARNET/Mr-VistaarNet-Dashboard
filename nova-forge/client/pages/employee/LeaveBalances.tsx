import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { LeaveRequest } from '@/services/leave';

export const LeaveBalances: React.FC<{ policies?: Record<string, number>, leaves?: LeaveRequest[] }> = ({ policies, leaves }) => {

    const calculateTaken = (type: string) => {
        if (!leaves) return 0;
        return leaves
            .filter(l => l.status === 'approved' && l.type.toLowerCase() === type.split(' ')[0].toLowerCase()) // Match "Sick" with "Sick Leave"
            .reduce((acc, l) => {
                const start = new Date(l.startDate);
                const end = new Date(l.endDate);
                const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                return acc + days;
            }, 0);
    };

    // Default structure if no policies loaded yet
    const policyMap = policies || {
        'Casual Leave': 12,
        'Sick Leave': 7,
        'Earned Leave': 15
    };

    const items = Object.entries(policyMap).map(([label, total]) => {
        const typeKey = label.split(' ')[0]; // "Casual" from "Casual Leave"
        const taken = calculateTaken(typeKey);

        let color = 'gray-400';
        if (label.includes('Casual')) color = 'neon-cyan';
        else if (label.includes('Sick')) color = 'neon-lime';
        else if (label.includes('Earned')) color = 'neon-purple';

        return { label, taken, total, color };
    });

    // Add Unpaid separately as it's typically infinite/not policy capped in the same way
    items.push({ label: 'Unpaid Leave', taken: calculateTaken('Unpaid'), total: 999, color: 'gray-400' });

    return (
        <>
            {items.map((type, i) => (
                <Card key={i} className="border-white/10 bg-black/40 backdrop-blur-xl">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-medium text-gray-400">{type.label}</p>
                            <FileText className={`w-4 h-4 text-${type.color}`} />
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-white">
                                {type.total === 999 ? type.taken : (type.total - type.taken)}
                            </span>
                            <span className="text-xs text-gray-500">{type.total === 999 ? 'used' : 'available'}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden">
                            {type.total !== 999 && (
                                <div
                                    className={`h-full bg-${type.color}`}
                                    style={{ width: `${Math.min(100, (type.taken / type.total) * 100)}%` }}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </>
    );
};
