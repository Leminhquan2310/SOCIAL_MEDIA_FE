import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { OpenChatSession } from '../../contexts/ChatContext';
import { ConversationResponseDto } from '../../../types';

interface MinimizedBubbleProps {
    session: OpenChatSession;
    conversation?: ConversationResponseDto;
    /** Distance from bottom of screen (px) — used to stack vertically */
    bottomOffset: number;
    /**
     * True when the chat window for this session is currently open (not minimized).
     * Changes visual style and click behavior.
     */
    isActive: boolean;
    onBubbleClick: () => void;
    onClose: () => void;
}

/**
 * Floating avatar bubble, always visible for every open chat session.
 *
 * - isActive = true  → window is open; blue border ring; click → minimize
 * - isActive = false → window is minimized; pulse on unread; click → restore
 */
const MinimizedBubble: React.FC<MinimizedBubbleProps> = ({
    session,
    conversation,
    bottomOffset,
    isActive,
    onBubbleClick,
    onClose,
}) => {
    const { user } = useAuth();

    const displayName = conversation?.otherUserFullName ?? session.tempUser?.fullName ?? '';
    const avatarSrc =
        conversation?.otherUserAvatar ??
        session.tempUser?.avatarUrl ??
        `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

    const unreadCount = conversation?.unreadCount ?? 0;
    const hasUnread = !isActive && unreadCount > 0 && conversation?.lastSenderId !== user?.id;

    return (
        <div
            className="fixed right-4 z-[65] cursor-pointer group transition-all duration-300"
            style={{ bottom: bottomOffset }}
            onClick={onBubbleClick}
            title={isActive ? `Thu nhỏ • ${displayName}` : displayName}
        >
            {/* Pulse ring — only when minimized with unread messages */}
            {hasUnread && (
                <span className="absolute inset-0 rounded-full bg-blue-400 opacity-40 animate-ping" />
            )}

            {/* Avatar */}
            <div
                className={`relative w-14 h-14 rounded-full shadow-xl overflow-hidden transition-all duration-200 group-hover:scale-110 border-[3px] ${isActive
                    ? 'border-blue-500 shadow-blue-200'   // active = blue ring
                    : 'border-white'                       // minimized = clean white
                    }`}
            >
                <img
                    src={avatarSrc}
                    className="w-full h-full object-cover"
                    alt={displayName}
                />
                {/* Online dot */}
            </div>
            <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />

            {/* Unread badge — only when minimized */}
            {hasUnread && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-md border-2 border-white z-10">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}

            {/* Close button (appears on hover) */}
            <button
                className="absolute -top-1 -left-1 w-5 h-5 bg-gray-600 hover:bg-gray-800 text-white rounded-full items-center justify-center text-[10px] hidden group-hover:flex transition-colors shadow z-10"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                title="Đóng"
            >
                ✕
            </button>

            {/* Name tooltip — arrow pointing right (tooltip to the left of bubble) */}
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-[11px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                {displayName}
                <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-800" />
            </div>
        </div>
    );
};

export default MinimizedBubble;
