import React, { useState, useEffect } from 'react';
import { useChat, MessagePreview } from '../../contexts/ChatContext';
import SingleChatWindow from './SingleChatWindow';
import MinimizedBubble from './MinimizedBubble';
import MessageToast from './MessageToast';

// ── Layout constants ──────────────────────────────────────────────────────────

const BUBBLE_HEIGHT = 56;   // w-14
const BUBBLE_GAP    = 16;   // vertical gap between stacked bubbles
const BUBBLE_BASE   = 24;   // bottom offset for the first (lowest) bubble

const WINDOW_WIDTH  = 344;  // chat window width (px)
const WINDOW_GAP    = 8;    // horizontal gap between windows
const WINDOW_BASE   = 80;   // right offset for the newest (rightmost) window
const MAX_VISIBLE   = 3;    // max simultaneous full windows shown

const TOAST_HEIGHT  = 80;   // approx height of each toast card (px)
const TOAST_GAP     = 8;    // gap between stacked toasts
const TOAST_BASE    = 24;   // bottom offset for the first toast

// ── Types ─────────────────────────────────────────────────────────────────────

interface ActiveToast extends MessagePreview {
    /** Local unique id for keying and removal */
    localId: string;
}

// ── ChatWindow Manager ────────────────────────────────────────────────────────

/**
 * Renders ALL open chat sessions as windows or bubbles, plus message preview toasts.
 *
 * Layout (right to left from screen edge):
 *  right-4       → bubble column (always-visible avatar circles, stacked vertically)
 *  right-80+     → full chat windows stacked horizontally
 *  right-80 (above windows) → message preview toasts
 */
const ChatWindow: React.FC = () => {
    const {
        openChats,
        conversations,
        closeChat,
        minimizeChat,
        restoreChat,
        sendMessage,
        openChat,
        messagePreview,
        clearMessagePreview,
    } = useChat();

    const [toasts, setToasts] = useState<ActiveToast[]>([]);

    // ── Watch for new incoming message previews ───────────────────────────────
    useEffect(() => {
        if (!messagePreview) return;

        const localId = `${messagePreview.key}-${Date.now()}`;

        setToasts(prev => [...prev, { ...messagePreview, localId }]);
        clearMessagePreview();
    }, [messagePreview, clearMessagePreview]);

    const dismissToast = (localId: string) => {
        setToasts(prev => prev.filter(t => t.localId !== localId));
    };

    const openToastChat = (preview: ActiveToast) => {
        openChat(preview.conversationId);
        dismissToast(preview.localId);
    };

    // ── Derived lists ─────────────────────────────────────────────────────────

    // Newest MAX_VISIBLE non-minimized sessions → full windows
    // Newest = last in array = rightmost slot (index 0 after reverse)
    const activeSessions = openChats
        .filter(c => !c.isMinimized)
        .slice(-MAX_VISIBLE)
        .reverse();

    // ALL sessions → avatar bubbles (newest at bottom of column)
    const bubbleSessions = [...openChats].reverse();

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            {/* ── Full chat windows ── */}
            {activeSessions.map((session, slotIdx) => {
                const conv = conversations.find(c => c.id === session.conversationId);
                const rightOffset = WINDOW_BASE + slotIdx * (WINDOW_WIDTH + WINDOW_GAP);

                return (
                    <SingleChatWindow
                        key={session.key}
                        session={session}
                        conversation={conv}
                        rightOffset={rightOffset}
                        onClose={() => closeChat(session.key)}
                        onMinimize={() => minimizeChat(session.key)}
                        onSend={(receiverId, content) =>
                            sendMessage(receiverId, content, session.key)
                        }
                    />
                );
            })}

            {/* ── Avatar bubbles — always-visible vertical column at right-4 ── */}
            {bubbleSessions.map((session, bubbleIdx) => {
                const conv = conversations.find(c => c.id === session.conversationId);
                const bottomOffset = BUBBLE_BASE + bubbleIdx * (BUBBLE_HEIGHT + BUBBLE_GAP);
                const isActive = !session.isMinimized;

                return (
                    <MinimizedBubble
                        key={session.key}
                        session={session}
                        conversation={conv}
                        bottomOffset={bottomOffset}
                        isActive={isActive}
                        onBubbleClick={() => {
                            if (isActive) {
                                minimizeChat(session.key);
                            } else {
                                restoreChat(session.key);
                                // Dismiss preview toast if it exists
                                const relatedToast = toasts.find(t => t.conversationId === session.conversationId);
                                if (relatedToast) {
                                    dismissToast(relatedToast.localId);
                                }
                            }
                        }}
                        onClose={() => closeChat(session.key)}
                    />
                );
            })}

            {/* ── Message preview toasts — slide in from right, stays permanently until dismissed ── */}
            {toasts.map((toast, idx) => (
                <MessageToast
                    key={toast.localId}
                    preview={toast}
                    bottomOffset={TOAST_BASE + idx * (TOAST_HEIGHT + TOAST_GAP)}
                    onOpen={() => openToastChat(toast)}
                    onDismiss={() => dismissToast(toast.localId)}
                />
            ))}
        </>
    );
};

export default ChatWindow;
