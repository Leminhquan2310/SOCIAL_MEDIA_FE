import { MessageSquare, UserX } from "lucide-react";
import { Link } from "react-router-dom";
import { FriendUserDTO } from "../../../types";

interface FriendCardProps {
    friend: FriendUserDTO;
    handleRemoveFriend: (id: string) => void;
}

export const FriendCard: React.FC<FriendCardProps> = ({ friend, handleRemoveFriend }) => {
    return (
        <div
            key={friend.id}
            className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all group"
        >
            <Link to={`/u/${friend.username}`} className="flex items-center gap-3 flex-1 overflow-hidden">
                <img
                    src={friend.avatarUrl || `https://ui-avatars.com/api/?name=${friend.fullName}&background=random`}
                    className="w-14 h-14 rounded-full object-cover shadow-sm"
                    alt=""
                />
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {friend.fullName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">@{friend.username}</p>
                </div>
            </Link>
            <div className="flex gap-2">
                <button className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                    <MessageSquare size={18} />
                </button>
                <button
                    onClick={() => handleRemoveFriend(friend.id)}
                    className="p-2.5 text-gray-600 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"
                >
                    <UserX size={18} />
                </button>
            </div>
        </div>
    );
};