import React, { useEffect, useState } from "react";
import { X, Search } from "lucide-react";
import { friendApi } from "../../utils/apiClient";
import { Link } from "react-router-dom";

interface MutualFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string | number;
  targetUserName: string;
}

const MutualFriendsModal: React.FC<MutualFriendsModalProps> = ({
  isOpen,
  onClose,
  targetUserId,
  targetUserName,
}) => {
  const [friends, setFriends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchMutual = async () => {
        setIsLoading(true);
        try {
          const res: any = await friendApi.getMutualFriends(String(targetUserId), { size: 50 });
          setFriends(res?.data?.content || res?.content || []);
        } catch (error) {
          console.error("Failed to fetch mutual friends", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchMutual();
    }
  }, [isOpen, targetUserId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md h-[500px] flex flex-col animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-black text-gray-900">
            Bạn chung với {targetUserName}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        {/* Search Dummy */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm bạn chung..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : friends.length > 0 ? (
             <div className="space-y-1">
               {friends.map((friend) => (
                 <Link
                   key={friend.id}
                   to={`/u/${friend.username}`}
                   onClick={onClose}
                   className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-2xl transition-all group"
                 >
                   <img 
                     src={friend.avatarUrl || `https://ui-avatars.com/api/?name=${friend.fullName}&background=random`} 
                     alt={friend.fullName}
                     className="w-12 h-12 rounded-full object-cover"
                   />
                   <div className="flex-1 overflow-hidden">
                     <p className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                       {friend.fullName}
                     </p>
                     <p className="text-sm text-gray-500 truncate">@{friend.username}</p>
                   </div>
                 </Link>
               ))}
             </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-center p-4">
               <p className="text-gray-500 font-medium text-sm">Không có bạn chung nào.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MutualFriendsModal;
