import React from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService } from '@/services/messages';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface NotificationPopoverProps {
    children?: React.ReactNode;
}

const NotificationPopover: React.FC<NotificationPopoverProps> = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const { data: messages = [] } = useQuery({
        queryKey: ['messages'],
        queryFn: messageService.getAllMessages,
        enabled: !!user,
        refetchInterval: 30000,
    });

    const { data: announcements = [] } = useQuery({
        queryKey: ['announcements'],
        queryFn: () => import('@/services/announcements').then(m => m.announcementService.getAll()),
        enabled: !!user,
    });

    // State for locally read announcements (since backend doesn't track this per user)
    const [readAnnouncementIds, setReadAnnouncementIds] = React.useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('read_announcements');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const markAnnouncementAsRead = (id: string) => {
        const newIds = [...readAnnouncementIds, id];
        setReadAnnouncementIds(newIds);
        localStorage.setItem('read_announcements', JSON.stringify(newIds));
        toast.success('Announcement marked as read');
    };

    // Unified Notification Logic
    const isAdmin = user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'MASTER_ADMIN';

    const unreadMessages = messages.filter(m => {
        if (m.isRead) return false;

        const userId = String(user?.id);
        const senderId = String(m.senderId);
        const receiverId = String(m.receiverId);

        if (isAdmin) {
            // Admin sees all unread messages, except those they sent themselves (e.g. replies)
            // AND ensure generic "admin" sender doesn't show up if user is admin
            return senderId !== userId && senderId !== 'admin';
        }

        // Employee sees messages sent TO them
        return receiverId === userId;
    });


    // 2. Announcements for Employees (and Admin too if they want)
    // Filter out announcements that are in readAnnouncementIds
    const recentAnnouncements = announcements
        .filter(a => !readAnnouncementIds.includes(String(a.id)))
        .slice(0, 5)
        .map(a => ({
            id: `ann-${a.id}`,
            title: `Announcement: ${a.title}`,
            content: a.content,
            time: a.date, // Assuming date string
            type: 'announcement',
            read: false,
            originalId: String(a.id)
        }));

    // Combine
    // user sees Messages + Announcements
    const notifications = [
        ...unreadMessages.map(m => ({
            id: m.id,
            title: isAdmin ? m.senderName : `Reply from ${m.senderName || 'Admin'}`,
            content: m.content,
            time: m.timestamp,
            type: 'message',
            read: m.isRead,
            originalId: m.id
        })),
        ...recentAnnouncements
    ];

    // Sort by time?
    // messages have ISO timestamp, announcements have 'date' (YYYY-MM-DD or similar).
    // Simple concat for now.

    const unreadCount = notifications.length;

    const markAsReadMutation = useMutation({
        mutationFn: messageService.markAsRead,
        onMutate: async (id) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['messages'] });

            // Snapshot previous value
            const previousMessages = queryClient.getQueryData(['messages']);

            // Optimistically update
            queryClient.setQueryData(['messages'], (old: any[]) => {
                return old?.map(msg =>
                    msg.id === id ? { ...msg, isRead: true } : msg
                ) || [];
            });

            return { previousMessages };
        },
        onError: (err, newTodo, context: any) => {
            queryClient.setQueryData(['messages'], context.previousMessages);
            toast.error("Failed to mark as read");
        },
        onSuccess: () => {
            // Still invalidate to ensure sync
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            queryClient.invalidateQueries({ queryKey: ['myMessages'] }); // Sync message page too
            toast.success('Marked as read');
        },
    });

    const handleMarkAsRead = (id: string, e: React.MouseEvent, type: 'message' | 'announcement') => {
        e.stopPropagation(); // Prevent closing popover if needed, or bubble up
        if (type === 'message') {
            markAsReadMutation.mutate(id);
        } else {
            markAnnouncementAsRead(id);
        }
    };

    const navigate = useNavigate();
    const handleItemClick = (notification: any) => {
        if (notification.type === 'message') {
            // Mark as read immediately when clicked to view
            markAsReadMutation.mutate(notification.originalId);

            if (isAdmin) {
                navigate('/admin/messages');
            } else {
                navigate('/employee/messages');
            }
        } else if (notification.type === 'announcement') {
            // Just mark as read and maybe navigate to dashboard where they can read full?
            markAnnouncementAsRead(notification.originalId);
            if (!isAdmin) {
                navigate('/employee/dashboard'); // Or wherever announcements are
            }
        }
    };



    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-neon-cyan hover:text-neon-cyan/80 hover:bg-slate-800/50">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-slate-900 border-slate-800" align="end">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h4 className="font-semibold text-white">Notifications</h4>
                    {unreadCount > 0 && (
                        <span className="text-xs text-slate-400">{unreadCount} new</span>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {unreadCount === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No new notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
                                    onClick={() => handleItemClick(notification)}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-sm font-medium ${notification.type === 'announcement' ? 'text-neon-cyan' : 'text-white'}`}>
                                            {notification.title}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {notification.type === 'message'
                                                ? new Date(notification.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : notification.time}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-300 mb-2 line-clamp-2">
                                        {notification.content}
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs text-neon-cyan hover:text-neon-cyan/80 p-0"
                                        onClick={(e) => handleMarkAsRead(notification.originalId, e, notification.type as 'message' | 'announcement')}
                                    >
                                        <Check className="h-3 w-3 mr-1" />
                                        Mark as read
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationPopover;
