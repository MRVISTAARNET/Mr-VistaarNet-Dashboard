import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService } from '@/services/messages';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Check, User, Clock, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';

const EmployeeMessages: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: messages = [], isLoading } = useQuery({
        queryKey: ['myMessages', user?.id],
        queryFn: messageService.getAllMessages,
    });

    // Filter for messages sent BY user OR received BY user (handle string vs number ID mismatch)
    const myMessages = messages.filter(m => String(m.senderId) === String(user?.id) || String(m.receiverId) === String(user?.id));

    // Sort by timestamp desc
    const sortedMessages = myMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Auto-mark unread messages as read when viewed
    React.useEffect(() => {
        const unreadReceivedMessages = myMessages.filter(
            m => !m.isRead && String(m.receiverId) === String(user?.id)
        );

        if (unreadReceivedMessages.length > 0) {
            // Mark all as read
            Promise.all(unreadReceivedMessages.map(msg => messageService.markAsRead(msg.id)))
                .then(() => {
                    queryClient.invalidateQueries({ queryKey: ['myMessages'] });
                    queryClient.invalidateQueries({ queryKey: ['messages'] }); // Update global notification count anywhere
                })
                .catch(err => console.error("Failed to mark messages as read", err));
        }
    }, [messages, user?.id, queryClient]);

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">My Messages</h1>
                <p className="text-muted-foreground">History of your requests and replies from Admin.</p>
            </div>

            <Card className="border-border bg-card/50 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                        <Bell className="w-5 h-5 text-neon-cyan" />
                        Inbox & Sent Requests
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : sortedMessages.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>You haven't sent or received any messages yet.</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[500px] pr-4">
                            <div className="space-y-4">
                                {sortedMessages.map((msg) => {
                                    const isSender = msg.senderId === user?.id;
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`p-4 rounded-lg border transition-all ${!isSender
                                                ? 'bg-neon-cyan/5 border-neon-cyan/30'
                                                : 'bg-accent/5 border-border hover:bg-accent/10'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-full ${!isSender ? 'bg-neon-cyan text-black' : 'bg-accent/20 text-foreground'}`}>
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-medium text-foreground">
                                                        {isSender ? 'You sent to Admin' : `Reply from ${msg.senderName || 'Admin'}`}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock className="w-3 h-3" />
                                                    {msg.timestamp && new Date(msg.timestamp).toLocaleString()}
                                                </div>
                                            </div>
                                            <p className="text-sm text-foreground/90 pl-9 mb-3 whitespace-pre-wrap">
                                                {msg.content}
                                            </p>
                                            <div className="flex justify-end pl-9">
                                                {isSender ? (
                                                    msg.isRead ? (
                                                        <span className="flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                                                            <CheckCheck className="w-3 h-3" /> Seen by HR
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-xs text-muted-foreground bg-accent/10 px-2 py-1 rounded-full">
                                                            <Check className="w-3 h-3" /> Sent
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="flex items-center gap-1 text-xs text-neon-cyan bg-neon-cyan/10 px-2 py-1 rounded-full">
                                                        <Bell className="w-3 h-3" /> Received
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default EmployeeMessages;
