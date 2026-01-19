import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { messageService } from '@/services/messages';
import { useAuth } from '@/hooks/useAuth';

interface ContactHRDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ContactHRDialog: React.FC<ContactHRDialogProps> = ({ open, onOpenChange }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim()) {
            toast.error('Please enter a message');
            return;
        }

        if (!user?.id) {
            toast.error('You must be logged in to send a message');
            return;
        }

        setIsSubmitting(true);
        try {
            await messageService.sendMessage({
                senderId: String(user?.id || ''),
                content: message
            });
            toast.success('Request sent to HR');
            queryClient.invalidateQueries({ queryKey: ['allMessages'] });
            queryClient.invalidateQueries({ queryKey: ['myMessages'] });
            setMessage('');
            onOpenChange(false);
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Contact HR / Admin</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Send a request or query to the HR department. They will be notified immediately.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className="bg-white/5 border-white/10 text-white min-h-[150px]"
                    />
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="hover:bg-white/10 hover:text-white text-gray-400"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-primary text-black hover:bg-primary/90"
                    >
                        {isSubmitting ? 'Sending...' : 'Send Request'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ContactHRDialog;
