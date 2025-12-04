import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Conversation, Message } from '@/types';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';



export const useChat = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const supabase = createClient();
    const channelRef = useRef<any>(null);

    // Mock data removed - using real Supabase data

    useEffect(() => {
        fetchConversations();

        // Subscribe to new messages globally (for notifications/unread counts)
        const channel = supabase
            .channel('global-messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: RealtimePostgresChangesPayload<Message>) => {
                const newMessage = payload.new as Message; // notification
                console.log('New message received:', payload);
                fetchConversations(); // Refresh list to update last message
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        if (activeConversationId) {
            fetchMessages(activeConversationId);
            subscribeToConversation(activeConversationId);
        }
    }, [activeConversationId]);

    const fetchConversations = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch conversations where current user is a participant
            const { data, error } = await supabase
                .from('conversation_participants')
                .select(`
                    conversation_id,
                    conversation:conversations(
                        updated_at
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // For each conversation, get the other participant and last message
            const conversationsWithDetails = await Promise.all((data || []).map(async (item: any) => {
                const convId = item.conversation_id;

                // Get other participant
                const { data: participants } = await supabase
                    .from('conversation_participants')
                    .select('user:profiles(id, first_name, last_name, avatar_url)')
                    .eq('conversation_id', convId)
                    .neq('user_id', user.id)
                    .single();

                // Get last message
                const { data: lastMsg } = await supabase
                    .from('messages')
                    .select('content, created_at, is_read, sender_id')
                    .eq('conversation_id', convId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                // Cast to any to avoid complex nested type issues with Supabase joins
                const otherUser = (participants as any)?.user;

                return {
                    id: convId,
                    participant_id: otherUser?.id || 'unknown',
                    participant_name: otherUser ? `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim() : 'Unknown User',
                    participant_avatar: otherUser?.avatar_url,
                    last_message: lastMsg?.content || 'No messages yet',
                    last_message_at: lastMsg?.created_at || item.conversation?.updated_at,
                    unread_count: (lastMsg && !lastMsg.is_read && lastMsg.sender_id !== user.id) ? 1 : 0
                };
            }));

            setConversations(conversationsWithDetails);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            setLoading(false);
        }
    };

    const fetchMessages = async (conversationId: string) => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const subscribeToConversation = (conversationId: string) => {
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
        }

        channelRef.current = supabase
            .channel(`conversation:${conversationId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`
            }, (payload) => {
                const newMessage = payload.new as Message;
                setMessages(prev => [...prev, newMessage]);
                // Also refresh conversations to update last message snippet
                fetchConversations();
            })
            .subscribe();
    };

    const sendMessage = async (content: string) => {
        if (!activeConversationId || !content.trim()) return;

        setSending(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: activeConversationId,
                    sender_id: user.id,
                    content: content
                });

            if (error) throw error;

            // Optimistic update is handled by subscription usually, but we can do it here too for speed
            // However, since we have the subscription, let's rely on that to avoid duplicates or manage it carefully.
            // For now, we'll just wait for the subscription to pick it up or re-fetch if needed.

            setSending(false);
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
            setSending(false);
        }
    };

    return {
        conversations,
        messages,
        activeConversationId,
        setActiveConversationId,
        loading,
        sending,
        sendMessage
    };
};
