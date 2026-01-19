export interface Holiday {
    date: string; // YYYY-MM-DD
    name: string;
    type: 'Festival' | 'National' | 'Optional';
}

// Simple in-memory storage for the session
let holidays: Holiday[] = [
    { date: '2026-01-01', name: 'New Year\'s Day', type: 'National' },
    { date: '2026-01-26', name: 'Republic Day', type: 'National' },
    { date: '2026-03-25', name: 'Holi', type: 'Festival' },
    { date: '2026-04-14', name: 'Ambedkar Jayanti', type: 'National' },
    { date: '2026-08-15', name: 'Independence Day', type: 'National' },
    { date: '2026-10-02', name: 'Gandhi Jayanti', type: 'National' },
    { date: '2026-10-20', name: 'Dussehra', type: 'Festival' },
    { date: '2026-11-08', name: 'Diwali', type: 'Festival' },
    { date: '2026-12-25', name: 'Christmas', type: 'Festival' },
];

export const holidayService = {
    getHolidays: async (year: number): Promise<Holiday[]> => {
        return [...holidays];
    },

    addHoliday: async (holiday: Holiday): Promise<void> => {
        // Remove existing if any
        holidays = holidays.filter(h => h.date !== holiday.date);
        holidays.push(holiday);
    },

    deleteHoliday: async (date: string): Promise<void> => {
        holidays = holidays.filter(h => h.date !== date);
    }
};
