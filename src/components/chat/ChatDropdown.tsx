import React, { useState, useEffect, useMemo } from "react";
import { MessageCircle, Search, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";
import { friendApi } from "../../services/friendApi";
import { FriendUserDTO, User } from "../../../types";

interface ChatDropdownProps {
    onClose: () => void;
}

/** Helper to remove Vietnamese diacritics */
const removeAccents = (str: string) => {
    if (!str) return "";
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
};

/** Highlights the matched portion of text in bold */
const HighlightText: React.FC<{ text: string; query: string }> = ({ text, query }) => {
    if (!query.trim()) return <>{text}</>;

    const normalizedText = removeAccents(text.toLowerCase());
    const normalizedQuery = removeAccents(query.toLowerCase().trim());

    const index = normalizedText.indexOf(normalizedQuery);
    if (index === -1) return <>{text}</>;

    return (
        <>
            {text.slice(0, index)}
            <span className="font-black text-blue-600">{text.slice(index, index + normalizedQuery.length)}</span>
            {text.slice(index + normalizedQuery.length)}
        </>
    );
};

const ChatDropdown: React.FC<ChatDropdownProps> = ({ onClose }) => {
    const { conversations, openChat, openChatWithUser } = useChat();
    const { user } = useAuth();

    const [searchQuery, setSearchQuery] = useState("");
    const [friends, setFriends] = useState<FriendUserDTO[]>([]);
    const [loadingFriends, setLoadingFriends] = useState(false);

    // Fetch friend list once on mount
    useEffect(() => {
        if (!user?.username) return;

        const fetchFriends = async () => {
            setLoadingFriends(true);
            try {
                const res = await friendApi.getFriends(user.username) as any;
                const friendList: FriendUserDTO[] = res?.data?.content || res || [];
                setFriends(Array.isArray(friendList) ? friendList : []);
            } catch {
                // Silently fail
            } finally {
                setLoadingFriends(false);
            }
        };

        fetchFriends();
    }, [user?.username]);

    const query = removeAccents(searchQuery.toLowerCase().trim());
    const isSearching = query.length > 0;

    /**
     * Build a lookup map: otherUserId → conversation
     * Used to check if a friend already has an existing conversation.
     */
    const conversationByUserId = useMemo(() => {
        const map = new Map<number, (typeof conversations)[number]>();
        conversations.forEach(conv => {
            if (conv.otherUserId !== null) map.set(conv.otherUserId, conv);
        });
        return map;
    }, [conversations]);

    /**
     * Search mode: filter ALL friends by name.
     * Each friend item knows whether a conversation exists.
     */
    const filteredFriends = useMemo(() =>
        friends.filter(friend =>
            removeAccents(friend.fullName.toLowerCase()).includes(query)
        ),
        [friends, query]
    );

    // --- Handlers ---
    const handleConversationClick = (id: number) => {
        openChat(id);
        onClose();
    };

    const handleFriendClick = (friend: FriendUserDTO) => {
        const existingConv = conversationByUserId.get(Number(friend.id));
        if (existingConv) {
            // Already has a conversation — open it directly
            openChat(existingConv.id);
        } else {
            // No conversation yet — open chat window with this user (sends first message)
            const userObj: User = {
                id: Number(friend.id),
                username: friend.username,
                email: "",
                fullName: friend.fullName,
                avatarUrl: friend.avatarUrl,
            };
            openChatWithUser(userObj);
        }
        onClose();
    };

    // --- Sub-renders ---
    const renderConversationItem = (conv: (typeof conversations)[number]) => {
        const isUnread = conv.unreadCount > 0 && conv.lastSenderId !== user?.id;

        return (
            <div
                key={conv.id}
                onClick={() => handleConversationClick(conv.id)}
                className="p-2 mx-2 rounded-xl flex items-center gap-3 hover:bg-gray-50 transition-all cursor-pointer relative"
            >
                <div className="relative shrink-0">
                    <img
                        src={conv.otherUserAvatar || `https://ui-avatars.com/api/?name=${conv.otherUserFullName}&background=random`}
                        className="w-14 h-14 rounded-full object-cover border border-gray-50 shadow-sm"
                        alt=""
                    />
                    <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                </div>

                <div className="flex-1 min-w-0 pr-2">
                    <h4 className="font-bold text-gray-900 truncate text-[15px]">
                        {conv.otherUserFullName}
                    </h4>
                    <div className="flex items-center gap-1 mt-0.5">
                        <p className={`text-[13px] truncate flex-1 ${isUnread ? "text-gray-900 font-black" : "text-gray-500 font-medium"}`}>
                            {conv.lastSenderId === user?.id ? "You: " : ""}
                            {conv.lastMessage}
                        </p>
                        <span className="text-[11px] text-gray-400 whitespace-nowrap shrink-0">
                            • {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false, locale: vi })}
                        </span>
                    </div>
                </div>

                {isUnread && (
                    <div className="absolute right-4 top-6 -translate-y-1/2">
                        <span className="bg-blue-600 text-[10px] text-white font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center block">
                            {conv.unreadCount}
                        </span>
                    </div>
                )}
            </div>
        );
    };

    /**
     * Renders a friend search result.
     * If they already have a conversation: show last message preview.
     * If not: show "Nhắn tin" prompt.
     */
    const renderFriendSearchItem = (friend: FriendUserDTO) => {
        const existingConv = conversationByUserId.get(Number(friend.id));
        const isUnread = existingConv && existingConv.unreadCount > 0 && existingConv.lastSenderId !== user?.id;

        return (
            <div
                key={friend.id}
                onClick={() => handleFriendClick(friend)}
                className="p-2 mx-2 rounded-xl flex items-center gap-3 hover:bg-gray-50 transition-all cursor-pointer relative"
            >
                <div className="relative shrink-0">
                    <img
                        src={friend.avatarUrl || `https://ui-avatars.com/api/?name=${friend.fullName}&background=random`}
                        className="w-14 h-14 rounded-full object-cover border border-gray-50 shadow-sm"
                        alt=""
                    />
                    <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                </div>

                <div className="flex-1 min-w-0 pr-2">
                    <h4 className="font-bold text-gray-900 truncate text-[15px]">
                        <HighlightText text={friend.fullName} query={searchQuery} />
                    </h4>

                    {existingConv ? (
                        // Has existing conversation — show last message
                        <div className="flex items-center gap-1 mt-0.5">
                            <p className={`text-[13px] truncate flex-1 ${isUnread ? "text-gray-900 font-black" : "text-gray-500 font-medium"}`}>
                                {existingConv.lastSenderId === user?.id ? "Bạn: " : ""}
                                {existingConv.lastMessage}
                            </p>
                            <span className="text-[11px] text-gray-400 whitespace-nowrap shrink-0">
                                • {formatDistanceToNow(new Date(existingConv.lastMessageAt), { addSuffix: false, locale: vi })}
                            </span>
                        </div>
                    ) : (
                        // No conversation yet — invite to start one
                        <p className="text-[13px] text-gray-400 font-medium mt-0.5">Chat with this user</p>
                    )}
                </div>

                {isUnread && (
                    <div className="absolute right-4 top-6 -translate-y-1/2">
                        <span className="bg-blue-600 text-[10px] text-white font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center block">
                            {existingConv!.unreadCount}
                        </span>
                    </div>
                )}
            </div>
        );
    };

    const renderLoadingSkeleton = () => (
        <div className="px-4 py-2 space-y-3">
            {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-14 h-14 rounded-full bg-gray-100 shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-100 rounded w-2/3" />
                        <div className="h-2 bg-gray-100 rounded w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="absolute right-0 top-12 w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-slide-up">
            {/* Header */}
            <div className="p-4 border-b border-gray-50 bg-white sticky top-0">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-black text-xl text-gray-900">Chat</h3>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <MoreHorizontal size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full bg-gray-100 border-none rounded-full focus:outline-none py-2 pl-10 pr-8 text-sm focus:ring-0 placeholder:text-gray-500"
                        autoComplete="off"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center bg-gray-400 hover:bg-gray-500 rounded-full text-white text-[10px] font-bold transition-colors"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-h-[480px] overflow-y-auto custom-scrollbar">

                {/* == SEARCH MODE == */}
                {isSearching && (
                    <>
                        {loadingFriends && renderLoadingSkeleton()}

                        {!loadingFriends && filteredFriends.length === 0 && (
                            <div className="p-10 text-center text-gray-400">
                                <Search size={36} className="mx-auto mb-2 opacity-20" />
                                <p className="text-sm font-semibold">No friends found</p>
                                <p className="text-xs mt-1 text-gray-300">Try searching with a different name</p>
                            </div>
                        )}

                        {!loadingFriends && filteredFriends.length > 0 && (
                            <div className="py-1">
                                {filteredFriends.map(renderFriendSearchItem)}
                            </div>
                        )}
                    </>
                )}

                {/* == DEFAULT MODE: show conversations == */}
                {!isSearching && (
                    conversations.length === 0 ? (
                        <div className="p-10 text-center text-gray-400">
                            <MessageCircle size={40} className="mx-auto mb-2 opacity-20" />
                            <p className="text-sm font-medium">You have no conversations</p>
                            <p className="text-xs mt-1 text-gray-300">Search for friends to start chatting</p>
                        </div>
                    ) : (
                        <div className="py-1">
                            {conversations.map(renderConversationItem)}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default ChatDropdown;
