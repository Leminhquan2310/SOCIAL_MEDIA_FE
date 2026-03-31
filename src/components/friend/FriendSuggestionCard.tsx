import { MessageSquare, UserPlus, UserX } from "lucide-react";
import { Link } from "react-router-dom";
import { FriendUserDTO } from "../../../types";

interface FriendSuggestionCardProps {
    friend: FriendUserDTO;
    handleSendRequest: (id: string) => void;
}

export const FriendSuggestionCard: React.FC<FriendSuggestionCardProps> = ({ friend, handleSendRequest }) => {
    return (
        <div
            key={friend.id}
            className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:shadow-md hover:border-gray-200 transition-all bg-white group"
        >
            <Link to={`/u/${friend.username}`} className="flex items-center gap-3 flex-1 overflow-hidden">
                <img
                    src={friend.avatarUrl || `https://ui-avatars.com/api/?name=${friend.fullName}&background=random`}
                    className="w-14 h-14 rounded-full object-cover shadow-sm border border-gray-50"
                    alt=""
                />
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{friend.fullName}</p>
                    <p className="text-sm text-gray-500 truncate">@{friend.username}</p>
                </div>
            </Link>
            <button
                onClick={() => handleSendRequest(friend.id)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all active:scale-95"
            >
                <UserPlus size={16} />
                Add friend
            </button>
        </div>
    );
};