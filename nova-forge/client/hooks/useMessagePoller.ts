import { useQuery } from '@tanstack/react-query';
import { messageService, Message } from '@/services/messages';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export const useMessagePoller = () => {
    const { user } = useAuth();
    const headersRef = useRef<number>(0);

    const { data: messages } = useQuery({
        queryKey: ['myMessages', user?.id],
        queryFn: () => messageService.getAllMessages(),
        enabled: !!user?.id,
        refetchInterval: 30000, // Poll every 30 seconds
    });

    useEffect(() => {
        if (messages && messages.length > 0) {
            const currentCount = messages.length;
            // Only notify if we have MORE messages than before, and it's not the initial load
            if (headersRef.current > 0 && currentCount > headersRef.current) {
                const newMessages = messages.slice(0, currentCount - headersRef.current);
                // Just show one toast for the batch
                const lastMsg = newMessages[0];
                if (lastMsg.senderId !== user?.id) {
                    toast.info(`New message from ${lastMsg.senderName}: ${lastMsg.content.substring(0, 30)}${lastMsg.content.length > 30 ? '...' : ''}`);
                    // Play sound? Optional.
                }
            }
            headersRef.current = currentCount;
        }
    }, [messages, user?.id]);
};
