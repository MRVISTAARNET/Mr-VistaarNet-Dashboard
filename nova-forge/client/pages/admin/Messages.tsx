import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService, Message } from '@/services/messages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, Clock, Reply } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/hooks/useAuth';

const AdminMessages: React.FC = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [replyData, setReplyData] = useState<{ msg: Message | null, content: string }>({ msg: null, content: '' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: messages, isLoading } = useQuery({
        queryKey: ['allMessages'],
        queryFn: messageService.getAllMessages,
    });

    const readMutation = useMutation({
        mutationFn: messageService.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allMessages'] });
            toast.success('Message marked as read');
        }
    });

    const sendReplyMutation = useMutation({
        mutationFn: messageService.sendMessage,
        onSuccess: () => {
            toast.success('Reply sent successfully');
            setIsDialogOpen(false);
            setReplyData({ msg: null, content: '' });
            queryClient.invalidateQueries({ queryKey: ['allMessages'] });
        },
        onError: () => {
            toast.error('Failed to send reply');
        }
    });

    const handleMarkAsRead = (id: string) => {
        readMutation.mutate(id);
    };

    const handleOpenReply = (msg: Message) => {
        setReplyData({ msg, content: '' });
        setIsDialogOpen(true);
    };

    const handleSendReply = () => {
        if (!replyData.msg || !replyData.content.trim()) return;

        sendReplyMutation.mutate({
            senderId: user?.id || 'admin',
            receiverId: replyData.msg.senderId,
            content: replyData.content
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Messages & Requests</h1>
                <p className="text-muted-foreground">Inbox for employee queries and support requests.</p>
            </div>

            <Card className="border-border bg-card/50 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-neon-cyan" />
                        Inbox
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : messages?.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No messages found.</p>
                    ) : (
                        messages?.map((msg) => (
                            <div
                                key={msg.id}
                                className={`p-4 rounded-lg border transition-colors ${msg.isRead ? 'bg-card border-border opacity-70' : 'bg-accent/10 border-neon-cyan/30'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <Avatar className="w-10 h-10 border border-border">
                                        <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName || 'U')}&background=random`} />
                                        <AvatarFallback>{(msg.senderName || 'U').charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-foreground">{msg.senderName}</p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {new Date(msg.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
                                                    onClick={() => handleOpenReply(msg)}
                                                >
                                                    <Reply className="w-4 h-4 mr-1" /> Reply
                                                </Button>
                                                {!msg.isRead && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-neon-cyan hover:bg-neon-cyan/10 h-8"
                                                        onClick={() => handleMarkAsRead(msg.id)}
                                                        disabled={readMutation.isPending}
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" /> Mark Read
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-foreground/90 whitespace-pre-wrap mt-2">{msg.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Reply to {replyData.msg?.senderName}</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Send a direct message reply.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="mb-4 p-3 bg-slate-800/50 rounded text-sm text-slate-300 border-l-2 border-neon-cyan">
                            <p className="text-xs font-semibold text-slate-500 mb-1">Original Message:</p>
                            {replyData.msg?.content}
                        </div>
                        <Textarea
                            placeholder="Type your reply here..."
                            className="min-h-[120px] bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-neon-cyan"
                            value={replyData.content}
                            onChange={(e) => setReplyData(prev => ({ ...prev, content: e.target.value }))}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">Cancel</Button>
                        <Button
                            onClick={handleSendReply}
                            disabled={sendReplyMutation.isPending || !replyData.content.trim()}
                            className="bg-neon-cyan text-black hover:bg-neon-cyan/90"
                        >
                            {sendReplyMutation.isPending ? 'Sending...' : 'Send Reply'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminMessages;
