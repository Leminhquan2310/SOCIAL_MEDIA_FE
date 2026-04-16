import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { chatApi } from '../services/chatApi';
import { ConversationResponseDto, MessageDto, User } from '../../types';

// ── Types ────────────────────────────────────────────────────────────────────

export interface OpenChatSession {
    /** Unique key: 'conv-{id}' for existing convs, 'user-{userId}' for new chats */
    key: string;
    conversationId: number | null;
    tempUser: User | null;
    messages: MessageDto[];
    isMinimized: boolean;
}

export interface MessagePreview {
    key: string;
    conversationId: number;
    senderName: string;
    senderAvatar?: string;
    content: string;
}

interface ChatContextType {
    conversations: ConversationResponseDto[];
    totalUnreadCount: number;
    openChats: OpenChatSession[];
    openChat: (conversationId: number, startMinimized?: boolean) => void;
    openChatWithUser: (otherUser: User) => void;
    closeChat: (key: string) => void;
    minimizeChat: (key: string) => void;
    restoreChat: (key: string) => void;
    sendMessage: (receiverId: number, content: string, sessionKey: string) => void;
    markAsSeen: (conversationId: number) => void;
    refreshData: () => Promise<void>;
    socketConnected: boolean;
    messagePreview: MessagePreview | null;
    clearMessagePreview: () => void;
}

// ── Context ──────────────────────────────────────────────────────────────────

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const { connected: socketConnected, subscribe, publish } = useSocket();

    const [conversations, setConversations] = useState<ConversationResponseDto[]>([]);
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);
    const [openChats, setOpenChats] = useState<OpenChatSession[]>([]);
    const [messagePreview, setMessagePreview] = useState<MessagePreview | null>(null);

    // Refs keep latest state accessible inside memoized callbacks without stale closures
    const openChatsRef = useRef<OpenChatSession[]>([]);
    const conversationsRef = useRef<ConversationResponseDto[]>([]);
    useEffect(() => { openChatsRef.current = openChats; }, [openChats]);
    useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

    const clearMessagePreview = useCallback(() => setMessagePreview(null), []);

    // ── Data fetching ─────────────────────────────────────────────────────────

    const refreshData = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const [convRes, unreadRes] = await Promise.all([
                chatApi.getConversations(0, 20),
                chatApi.getUnreadCount()
            ]);
            setConversations(convRes.content);
            setTotalUnreadCount(unreadRes);
        } catch (error) {
            console.error('Error fetching chat data:', error);
        }
    }, [isAuthenticated]);

    const markAsSeen = useCallback(async (conversationId: number) => {
        try {
            await chatApi.markAsSeen(conversationId);
            setConversations(prev =>
                prev.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c)
            );
            const unreadRes = await chatApi.getUnreadCount();
            setTotalUnreadCount(unreadRes);
        } catch (error) {
            console.error('Error marking as seen:', error);
        }
    }, []);

    // ── Session management ────────────────────────────────────────────────────

    const openChat = useCallback(async (conversationId: number, startMinimized = false) => {
        const key = `conv-${conversationId}`;

        setOpenChats(prev => {
            const existing = prev.find(c => c.key === key);
            if (existing) {
                if (!startMinimized) {
                    // Restore minimized + move to front (rightmost slot)
                    return [...prev.filter(c => c.key !== key), { ...existing, isMinimized: false }];
                }
                return prev;
            }
            return [...prev, { key, conversationId, tempUser: null, messages: [], isMinimized: startMinimized }];
        });

        try {
            const res = await chatApi.getMessages(conversationId, 0, 50);
            setOpenChats(prev =>
                prev.map(c => c.key === key ? { ...c, messages: res.content.reverse() } : c)
            );

            if (!startMinimized) {
                markAsSeen(conversationId);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }, [markAsSeen]);

    const openChatWithUser = useCallback((otherUser: User) => {
        const existingConv = conversations.find(c => c.otherUserId === otherUser.id);
        if (existingConv) {
            openChat(existingConv.id);
            return;
        }

        const key = `user-${otherUser.id}`;
        setOpenChats(prev => {
            const existing = prev.find(c => c.key === key);
            if (existing) {
                return [...prev.filter(c => c.key !== key), { ...existing, isMinimized: false }];
            }
            return [...prev, { key, conversationId: null, tempUser: otherUser, messages: [], isMinimized: false }];
        });
    }, [conversations, openChat]);

    const closeChat = useCallback((key: string) => {
        setOpenChats(prev => prev.filter(c => c.key !== key));
    }, []);

    const minimizeChat = useCallback((key: string) => {
        setOpenChats(prev => prev.map(c => c.key === key ? { ...c, isMinimized: true } : c));
    }, []);

    const restoreChat = useCallback((key: string) => {
        setOpenChats(prev => {
            const session = prev.find(c => c.key === key);
            if (!session) return prev;
            
            // Mark as seen when opening a minimized bubble
            if (session.conversationId) {
                markAsSeen(session.conversationId);
            }

            // Move to end (most recent = rightmost slot) and un-minimize
            return [...prev.filter(c => c.key !== key), { ...session, isMinimized: false }];
        });
    }, [markAsSeen]);

    // ── Incoming message handler ──────────────────────────────────────────────

    const handleIncomingMessage = useCallback((msg: MessageDto) => {
        const key = `conv-${msg.conversationId}`;

        // Show preview toast if message is from another person and their window is not visible
        const isFromMe = String(msg.senderId) === String(user?.id);
        if (!isFromMe) {
            setTotalUnreadCount(prev => prev + 1);
            const sessionIsVisible = openChatsRef.current.some(
                c => String(c.conversationId) === String(msg.conversationId) && !c.isMinimized
            );
            if (!sessionIsVisible) {
                const existingConv = conversationsRef.current.find(c => c.id === msg.conversationId);
                setMessagePreview({
                    key: `toast-${msg.id}-${Date.now()}`,
                    conversationId: msg.conversationId,
                    senderName: msg.senderName,
                    senderAvatar: existingConv?.otherUserAvatar,
                    content: msg.content,
                });

                // Auto-spawn the minimized bubble if the session is not currently open at all
                const sessionExists = openChatsRef.current.some(
                    c => String(c.conversationId) === String(msg.conversationId)
                );
                if (!sessionExists) {
                    openChat(msg.conversationId, true);
                }
            }
        }

        // Update the open session that matches this conversation
        setOpenChats(prev => {
            const idx = prev.findIndex(c =>
                c.conversationId === msg.conversationId ||
                (c.conversationId === null && c.tempUser?.id === msg.senderId)
            );
            if (idx === -1) return prev;

            const session = prev[idx];
            const isVisible = !session.isMinimized;

            // Auto mark as seen if the window is currently open and visible
            if (isVisible && !isFromMe) {
                chatApi.markAsSeen(msg.conversationId).catch(() => { });
            }

            const updated = prev.map((c, i) =>
                i !== idx ? c : {
                    ...c,
                    key,                          // upgrade temp key if needed
                    conversationId: msg.conversationId,
                    messages: [...c.messages, msg],
                }
            );
            return updated;
        });

        // Update conversation list
        setConversations(prev => {
            const idx = prev.findIndex(c => c.id === msg.conversationId);
            const updatedConv: ConversationResponseDto = idx !== -1
                ? {
                    ...prev[idx],
                    lastMessage: msg.content,
                    lastMessageAt: msg.createdAt,
                    lastSenderId: msg.senderId,
                    unreadCount: isFromMe
                        ? prev[idx].unreadCount
                        : prev[idx].unreadCount + 1,
                }
                : {
                    id: msg.conversationId,
                    otherUserId: msg.senderId,
                    otherUserFullName: msg.senderName,
                    otherUserAvatar: undefined,
                    lastMessage: msg.content,
                    lastMessageAt: msg.createdAt,
                    lastSenderId: msg.senderId,
                    unreadCount: 1,
                } as ConversationResponseDto;

            return [updatedConv, ...prev.filter(c => c.id !== msg.conversationId)];
        });
    }, [user?.id, openChat]);

    const sendMessage = useCallback((receiverId: number, content: string, _sessionKey: string) => {
        if (socketConnected && user) {
            publish('/app/chat.send', { senderId: user.id, receiverId, content });
        }
    }, [socketConnected, user, publish]);

    // ── WebSocket subscriptions ───────────────────────────────────────────────

    useEffect(() => {
        if (!isAuthenticated || !socketConnected) return;

        const messageSub = subscribe('/user/queue/messages', (message) => {
            const newMessage: MessageDto = JSON.parse(message.body);
            handleIncomingMessage(newMessage);
        });

        const notifSub = subscribe('/user/queue/notifications', (payload) => {
            const data = JSON.parse(payload.body);
            if (data.type === 'UNREAD_COUNT') setTotalUnreadCount(data.count);
        });

        return () => {
            messageSub?.unsubscribe();
            notifSub?.unsubscribe();
        };
    }, [isAuthenticated, socketConnected, subscribe, handleIncomingMessage]);

    useEffect(() => {
        if (isAuthenticated) {
            refreshData();
        } else {
            setConversations([]);
            setTotalUnreadCount(0);
            setOpenChats([]);
        }
    }, [isAuthenticated, refreshData]);

    // ── Provider ──────────────────────────────────────────────────────────────

    return (
        <ChatContext.Provider value={{
            conversations,
            totalUnreadCount,
            openChats,
            openChat,
            openChatWithUser,
            closeChat,
            minimizeChat,
            restoreChat,
            sendMessage,
            markAsSeen,
            refreshData,
            socketConnected,
            messagePreview,
            clearMessagePreview,
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error('useChat must be used within a ChatProvider');
    return context;
};
