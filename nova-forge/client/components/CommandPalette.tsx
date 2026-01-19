import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Search, User, FileText, CheckSquare, Settings as SettingsIcon, LayoutDashboard, Building2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';

interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isEmployee = user?.role === 'employee';

    // Handle routing and closing
    const runCommand = (command: () => void) => {
        onOpenChange(false);
        command();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 overflow-hidden bg-[#1a1c2e] border-white/10 shadow-2xl max-w-[600px]">
                <Command className="bg-transparent text-white">
                    <div className="flex items-center border-b border-white/10 px-3" cmdk-input-wrapper="">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-gray-400" />
                        <Command.Input
                            placeholder="Type to search..."
                            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <Command.List className="max-h-[300px] overflow-y-auto p-2">
                        <Command.Empty className="py-6 text-center text-sm text-gray-500">No results found.</Command.Empty>

                        <Command.Group heading="Navigation" className="text-gray-400 text-xs font-bold px-2 py-1.5 mb-1 bg-white/5 rounded-sm">
                            <Command.Item
                                onSelect={() => runCommand(() => navigate(isEmployee ? '/employee/dashboard' : '/admin/dashboard'))}
                                className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-gray-300 hover:bg-white/10 cursor-pointer aria-selected:bg-white/10 aria-selected:text-white"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                <span>Dashboard</span>
                            </Command.Item>

                            {!isEmployee && (
                                <>
                                    <Command.Item
                                        onSelect={() => runCommand(() => navigate('/admin/reports'))}
                                        className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-gray-300 hover:bg-white/10 cursor-pointer aria-selected:bg-white/10 aria-selected:text-white"
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span>Reports</span>
                                    </Command.Item>
                                </>
                            )}

                            {isEmployee && (
                                <>
                                    <Command.Item
                                        onSelect={() => runCommand(() => navigate('/employee/daily-reports'))}
                                        className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-gray-300 hover:bg-white/10 cursor-pointer aria-selected:bg-white/10 aria-selected:text-white"
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span>Daily Reports</span>
                                    </Command.Item>
                                    <Command.Item
                                        onSelect={() => runCommand(() => navigate('/employee/tasks'))}
                                        className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-gray-300 hover:bg-white/10 cursor-pointer aria-selected:bg-white/10 aria-selected:text-white"
                                    >
                                        <CheckSquare className="w-4 h-4" />
                                        <span>My Tasks</span>
                                    </Command.Item>
                                </>
                            )}

                            <Command.Item
                                onSelect={() => runCommand(() => navigate('/settings'))}
                                className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-gray-300 hover:bg-white/10 cursor-pointer aria-selected:bg-white/10 aria-selected:text-white"
                            >
                                <SettingsIcon className="w-4 h-4" />
                                <span>Settings</span>
                            </Command.Item>
                        </Command.Group>

                        {!isEmployee && (
                            <Command.Group heading="Modules" className="text-gray-400 text-xs font-bold px-2 py-1.5 mt-2 mb-1 bg-white/5 rounded-sm">
                                <Command.Item
                                    onSelect={() => runCommand(() => navigate('/admin/employees/directory'))}
                                    className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-gray-300 hover:bg-white/10 cursor-pointer aria-selected:bg-white/10 aria-selected:text-white"
                                >
                                    <Users className="w-4 h-4" />
                                    <span>Employees</span>
                                </Command.Item>
                                <Command.Item
                                    onSelect={() => runCommand(() => navigate('/admin/organization/departments'))}
                                    className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-gray-300 hover:bg-white/10 cursor-pointer aria-selected:bg-white/10 aria-selected:text-white"
                                >
                                    <Building2 className="w-4 h-4" />
                                    <span>Departments</span>
                                </Command.Item>
                                <Command.Item
                                    onSelect={() => runCommand(() => navigate('/admin/tasks'))}
                                    className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-gray-300 hover:bg-white/10 cursor-pointer aria-selected:bg-white/10 aria-selected:text-white"
                                >
                                    <CheckSquare className="w-4 h-4" />
                                    <span>Tasks</span>
                                </Command.Item>
                            </Command.Group>
                        )}

                        {isEmployee && (
                            <Command.Group heading="Quick Actions" className="text-gray-400 text-xs font-bold px-2 py-1.5 mt-2 mb-1 bg-white/5 rounded-sm">
                                <Command.Item
                                    onSelect={() => runCommand(() => navigate('/employee/leave'))}
                                    className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-gray-300 hover:bg-white/10 cursor-pointer aria-selected:bg-white/10 aria-selected:text-white"
                                >
                                    <FileText className="w-4 h-4" />
                                    <span>Apply for Leave</span>
                                </Command.Item>
                            </Command.Group>
                        )}
                    </Command.List>
                </Command>
            </DialogContent>
        </Dialog>
    );
};

export default CommandPalette;
