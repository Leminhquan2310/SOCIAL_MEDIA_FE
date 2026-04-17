import React, { useState, useEffect, useCallback } from "react";
import { UserCheck, UserPlus, Search, UserX, MessageSquare, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { friendApi } from "../utils/apiClient";
import { useAuth } from "../contexts/AuthContext";
import { FriendSuggestionCard } from "../components/friend/FriendSuggestionCard";
import { useChat } from "../contexts/ChatContext";

const Friends: React.FC = () => {
  const { user } = useAuth();
  const { openChat } = useChat();
  const [activeTab, setActiveTab] = useState<"all" | "requests" | "suggestions">("all");
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFriends = useCallback(async () => {
    setIsLoading(true);
    try {
      const res: any = await friendApi.getFriends(user.username);
      setFriends(res?.data?.content || res?.content || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res: any = await friendApi.getFriendRequests();
      setRequests(res?.data?.content || res?.content || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSuggestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res: any = await friendApi.getSuggestions();
      setSuggestions(res?.data?.content || res?.content || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "all") fetchFriends();
    else if (activeTab === "requests") fetchRequests();
    else if (activeTab === "suggestions") fetchSuggestions();
  }, [activeTab, fetchFriends, fetchRequests, fetchSuggestions]);

  const handleRemoveFriend = async (id: string | number) => {
    try {
      await friendApi.removeFriend(String(id));
      setFriends((prev) => prev.filter((f) => f.id !== id));
      toast.success("Đã hủy kết bạn");
    } catch (error: any) {
      toast.error(error?.message || "Lỗi");
    }
  };

  const handleAcceptRequest = async (id: string | number) => {
    try {
      await friendApi.acceptRequest(String(id));
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast.success("Đã chấp nhận");
    } catch (error: any) {
      toast.error(error?.message || "Lỗi");
    }
  };

  const handleDeclineRequest = async (id: string | number) => {
    try {
      await friendApi.declineRequest(String(id));
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast.success("Đã từ chối");
    } catch (error: any) {
      toast.error(error?.message || "Lỗi");
    }
  };

  const handleSendRequest = async (id: string | number) => {
    try {
      await friendApi.sendRequest(String(id));
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
      toast.success("Đã gửi lời mời");
    } catch (error: any) {
      toast.error(error?.message || "Lỗi");
    }
  };

  const handleOpenChat = (id: number) => {
    openChat(id, false);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] animate-fade-in">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-black text-gray-900 mb-4">Friends</h1>
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === "all"
              ? "bg-blue-600 text-white shadow-md shadow-blue-100"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            All Friends {friends.length > 0 && `(${friends.length})`}
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all relative ${activeTab === "requests"
              ? "bg-blue-600 text-white shadow-md shadow-blue-100"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            Requests
            {requests.length > 0 && activeTab !== "requests" && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full shadow-sm">
                {requests.length}
              </span>
            )}
            {requests.length > 0 && activeTab === "requests" && ` (${requests.length})`}
          </button>
          <button
            onClick={() => setActiveTab("suggestions")}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === "suggestions"
              ? "bg-blue-600 text-white shadow-md shadow-blue-100"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            Suggestions
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search friends..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium placeholder-gray-400"
          />
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === "all" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friends.length === 0 ? (
                  <p className="col-span-full text-center text-gray-500 py-12 font-medium">You don't have any friends yet.</p>
                ) : (
                  friends.map((friend) => (
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
                        <button
                          onClick={() => handleOpenChat(friend.id)}
                          className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
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
                  ))
                )}
              </div>
            )}

            {activeTab === "requests" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requests.length === 0 ? (
                  <p className="col-span-full text-center text-gray-500 py-12 font-medium">No invitation has been sent to you.</p>
                ) : (
                  requests.map((request) => (
                    <div
                      key={request.id}
                      className="flex flex-col items-center justify-between p-5 border border-blue-100 rounded-2xl bg-blue-50/30 gap-4 sm:flex-row"
                    >
                      <Link to={`/u/${request.username}`} className="flex items-center gap-4 w-full sm:w-auto">
                        <img
                          src={request.avatarUrl || `https://ui-avatars.com/api/?name=${request.fullName}&background=random`}
                          className="w-16 h-16 rounded-full border-2 border-white shadow-sm object-cover"
                          alt=""
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{request.fullName}</p>
                          <p className="text-sm text-gray-500 truncate">@{request.username}</p>
                        </div>
                      </Link>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-sm transition-all active:scale-95"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(request.id)}
                          className="flex-1 sm:flex-none px-5 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all active:scale-95"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "suggestions" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.length === 0 ? (
                  <p className="col-span-full text-center text-gray-500 py-12 font-medium">There are no friend suggestions available at this time.</p>
                ) : (
                  suggestions.map((friend) => (
                    <FriendSuggestionCard key={friend.id} friend={friend} handleSendRequest={handleSendRequest} />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Friends;
