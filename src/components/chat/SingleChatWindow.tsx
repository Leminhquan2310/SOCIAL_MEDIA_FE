import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Smile, Paperclip, Phone, Video, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import { OpenChatSession } from '../../contexts/ChatContext';
import { ConversationResponseDto, MessageDto } from '../../../types';

interface SingleChatWindowProps {
    session: OpenChatSession;
    conversation?: ConversationResponseDto;
    /** Distance from right edge of screen (px), used to stack windows horizontally */
    rightOffset: number;
    onClose: () => void;
    onMinimize: () => void;
    onSend: (receiverId: number, content: string) => void;
}

/**
 * A single fully-expanded chat window.
 * Positioned at the bottom of the screen, offset from the right edge.
 */
const SingleChatWindow: React.FC<SingleChatWindowProps> = ({
    session,
    conversation,
    rightOffset,
    onClose,
    onMinimize,
    onSend,
}) => {
    const { user } = useAuth();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const displayUser = {
        id: conversation?.otherUserId ?? session.tempUser?.id ?? null,
        fullName: conversation?.otherUserFullName ?? session.tempUser?.fullName ?? '',
        avatarUrl: conversation?.otherUserAvatar ?? session.tempUser?.avatarUrl,
    };

    const avatarSrc =
        displayUser.avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser.fullName)}&background=random`;

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [session.messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && displayUser.id !== null) {
            onSend(displayUser.id, input.trim());
            setInput('');
        }
    };

    return (
        <div
            className="fixed bottom-5 w-[344px] h-[450px] bg-white rounded-t-xl shadow-2xl flex flex-col z-[60] border border-gray-100 animate-slide-up"
            style={{ right: rightOffset }}
        >
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-xl shadow-sm shrink-0">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="relative shrink-0">
                        <img
                            src={avatarSrc}
                            className="w-9 h-9 rounded-full object-cover"
                            alt=""
                        />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[14px] leading-tight text-gray-900 truncate max-w-[140px]">
                            {displayUser.fullName}
                        </span>
                        <span className="text-[11px] text-green-500 font-medium">Active</span>
                    </div>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                    <button
                        className="p-1.5 hover:bg-gray-100 rounded-full text-blue-600 transition-colors"
                        title="Gọi thoại"
                    >
                        <Phone size={17} />
                    </button>
                    <button
                        className="p-1.5 hover:bg-gray-100 rounded-full text-blue-600 transition-colors"
                        title="Gọi video"
                    >
                        <Video size={17} />
                    </button>
                    <button
                        className="p-1.5 hover:bg-gray-100 rounded-full text-blue-600 transition-colors"
                        onClick={onMinimize}
                        title="Thu nhỏ"
                    >
                        <Minus size={17} />
                    </button>
                    <button
                        className="p-1.5 hover:bg-gray-100 rounded-full text-blue-600 transition-colors"
                        onClick={onClose}
                        title="Đóng"
                    >
                        <X size={17} />
                    </button>
                </div>
            </div>

            {/* ── Messages ────────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-white">
                {/* Profile card at top of chat */}
                <div className="py-4 flex flex-col items-center justify-center">
                    <img
                        src={avatarSrc}
                        className="w-14 h-14 rounded-full object-cover mb-2 shadow-sm"
                        alt=""
                    />
                    <h4 className="font-black text-gray-900 text-[15px]">{displayUser.fullName}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Các bạn đã kết bạn trên Social App</p>
                </div>

                {session.messages.map((msg: MessageDto, idx: number) => {
                    const isMe = msg.senderId === user?.id;
                    const prevMsg = session.messages[idx - 1];
                    const showTime = idx === 0 ||
                        new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 300_000;

                    return (
                        <div key={msg.id} className="flex flex-col">
                            {showTime && (
                                <div className="text-[10px] text-center text-gray-400 my-2 font-medium">
                                    {format(new Date(msg.createdAt), 'HH:mm, dd/MM', { locale: vi })}
                                </div>
                            )}
                            <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-[14px] leading-snug ${isMe
                                        ? 'bg-blue-600 text-white rounded-br-sm shadow-sm'
                                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* ── Input ───────────────────────────────────────────────────── */}
            <div className="p-3 border-t border-gray-50 shrink-0">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <button
                        type="button"
                        className="p-1.5 hover:bg-gray-100 rounded-full text-blue-600 transition-colors"
                    >
                        <Paperclip size={19} />
                    </button>

                    <div className="flex-1 bg-gray-100 rounded-full flex items-center px-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Aa"
                            className="bg-transparent border-none focus:outline-none focus:ring-0 py-2 flex-1 text-sm text-gray-800"
                        />
                        <button
                            type="button"
                            className="text-blue-600 hover:scale-110 transition-transform"
                        >
                            <Smile size={19} />
                        </button>
                    </div>

                    <button
                        type={input.trim() ? 'submit' : 'button'}
                        className="text-blue-600 hover:scale-110 transition-transform"
                    >
                        {input.trim() ? <Send size={19} /> : <Smile size={19} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SingleChatWindow;
