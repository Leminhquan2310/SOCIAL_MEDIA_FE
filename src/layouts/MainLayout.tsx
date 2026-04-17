import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../../types";
import Sidebar from "../components/Sidebar";
import NotificationDropdown from "../components/NotificationDropdown";
import { useNotification } from "../hooks/useNotification";
import {
  Bell,
  Search,
  Users,
  LogOut,
  X,
  Menu,
  UserPlus,
  MessageSquare,
  Heart,
  MessageCircle,
} from "lucide-react";
import { useChat } from "../contexts/ChatContext";
import ChatDropdown from "../components/chat/ChatDropdown";
import ChatWindow from "../components/chat/ChatWindow";
import { friendApi } from "../services/friendApi";
import { FriendUserDTO } from "../../types";
/**
 * Main Layout Component
 * Wraps authenticated pages with header, sidebar, and suggested friends
 */
const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const notifRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotify, refreshUnreadCount } = useNotification();
  const { totalUnreadCount, refreshData } = useChat();

  const [suggestedFriends, setSuggestedFriends] = useState<any[]>([]);
  const [onlineFriends, setOnlineFriends] = useState<User[]>([]);
  const [sentRequests, setSentRequests] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    if (user) {
      const fetchFriendsData = async () => {
        try {
          const [suggestionsRes, friendsRes] = await Promise.all<any>([
            friendApi.getSuggestions(),
            friendApi.getFriends(user.username)
          ]);

          if (suggestionsRes?.data?.content) {
            setSuggestedFriends(suggestionsRes.data.content.slice(0, 5));
          } else if (suggestionsRes?.data && Array.isArray(suggestionsRes.data)) {
            setSuggestedFriends(suggestionsRes.data.slice(0, 5));
          }

          if (friendsRes?.data?.content) {
            const friendsList = friendsRes.data.content as User[];
            setOnlineFriends(friendsList.filter((f) => f.isOnline));
          } else if (friendsRes?.data && Array.isArray(friendsRes.data)) {
            const friendsList = friendsRes.data as User[];
            setOnlineFriends(friendsList.filter((f) => f.isOnline));
          }
        } catch (error) {
          console.error("Failed to fetch friends data:", error);
        }
      };

      fetchFriendsData();
    }
  }, [user]);

  const handleSendFriendRequest = async (e: React.MouseEvent, targetUserId: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await friendApi.sendRequest(String(targetUserId));
      setSentRequests(prev => new Set(prev).add(targetUserId));
    } catch (error) {
      console.error("Failed to send friend request:", error);
    }
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    if (isNotifOpen) {
      refreshNotify();
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };

    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isNotifOpen]);

  // Close chat dropdown when clicking outside
  useEffect(() => {
    if (isChatOpen) {
      refreshData();
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsChatOpen(false);
      }
    };

    if (isChatOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isChatOpen]);

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate("/login");
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1536px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              <Menu size={24} />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                N
              </div>
              <span className="font-black text-xl hidden sm:inline bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NexusSocial
              </span>
            </Link>
          </div>

          <div className="flex-1 max-w-md mx-4 hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search people, posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className={`relative p-2 rounded-full transition-all ${isNotifOpen ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border border-white font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotifOpen && (
                    <NotificationDropdown
                      notifications={notifications}
                      onMarkAsRead={markAsRead}
                      onMarkAllAsRead={markAllAsRead}
                      onClose={() => setIsNotifOpen(false)}
                      refresh={refreshNotify}
                    />
                  )}
                </div>

                <div className="relative" ref={chatRef}>
                  <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className={`relative p-2 rounded-full transition-all ${isChatOpen ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    title="Messages"
                  >
                    <MessageSquare size={20} />
                    {totalUnreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border border-white font-bold">
                        {totalUnreadCount > 9 ? "9+" : totalUnreadCount}
                      </span>
                    )}
                  </button>

                  {/* Chat Dropdown */}
                  {isChatOpen && (
                    <ChatDropdown onClose={() => setIsChatOpen(false)} />
                  )}
                </div>
                <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>
                <Link
                  to={`/u/${user?.username}`}
                  className="flex items-center gap-2 pl-2 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.fullName}&background=random`}
                    className="w-8 h-8 rounded-full border border-gray-100 object-cover"
                    alt={user?.fullName}
                  />
                  <span className="font-bold text-sm hidden sm:block">
                    {user?.fullName}
                  </span>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-600 font-bold hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className={`max-w-[1536px] mx-auto px-4 py-5 grid grid-cols-1 gap-8 ${user ? "lg:grid-cols-12" : "justify-center"}`}>
        {/* Sidebar */}
        {user && (
          <div
            className={`
            lg:col-span-2 lg:block
            ${isMobileMenuOpen ? "fixed inset-0 z-50 bg-white p-4 shadow-2xl overflow-y-auto" : "hidden"}
          `}
          >
            {isMobileMenuOpen && (
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            )}
            <Sidebar onLogoutClick={() => setShowLogoutModal(true)} />
          </div>
        )}

        {/* Page Content */}
        <main className={`${user ? "lg:col-span-7 col-span-12" : "col-span-12 max-w-4xl mx-auto w-full"} min-h-screen`}>
          <Outlet />
        </main>

        {/* Suggested Friends Sidebar */}
        {user && (
          <aside className="lg:col-span-3 hidden lg:block space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-3.5 border border-gray-100 top-24">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-bold text-gray-800 text-sm">Suggested Friends</h3>
                <Link to="/friends" className="text-[11px] font-bold text-blue-600 hover:underline">
                  See all
                </Link>
              </div>
              <div className="space-y-3.5">
                {suggestedFriends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between group px-1">
                    <Link
                      to={`/u/${friend.username}`}
                      className="flex items-center gap-2.5 hover:opacity-80 transition-opacity min-w-0"
                    >
                      <img
                        src={friend.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.fullName)}&background=random`}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-50 shadow-sm"
                        alt={friend.fullName}
                      />
                      <div className="overflow-hidden">
                        <p className="font-bold text-[13px] truncate">{friend.fullName}</p>
                        <p className="text-[10px] text-gray-400">@{friend.username}</p>
                      </div>
                    </Link>
                    {!sentRequests.has(friend.id) && (
                      <button
                        onClick={(e) => handleSendFriendRequest(e, friend.id)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group-hover:bg-blue-100 active:scale-95 shrink-0"
                      >
                        <UserPlus size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 border-t border-gray-50 pt-4">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="font-bold text-gray-800 text-sm">Online Friends</h3>
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                </div>
                <div className="space-y-3">
                  {onlineFriends.map((friend) => (
                    <Link
                      to={`/u/${friend.username}`}
                      key={friend.id}
                      className="flex items-center gap-2.5 cursor-pointer p-1 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <img
                          src={friend.avatarUrl || friend.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.fullName || friend.name || '')}&background=random`}
                          className="w-8 h-8 rounded-full object-cover shadow-sm ring-1 ring-gray-50"
                          alt={friend.fullName || friend.name}
                        />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-[13px] truncate">{friend.fullName || friend.name}</p>
                        <p className="text-[9px] text-green-600 font-bold uppercase tracking-wider">Online</p>
                      </div>
                    </Link>
                  ))}
                  {onlineFriends.length === 0 && (
                    <p className="text-xs text-gray-500 px-1 italic">Do not have any online friends</p>
                  )}
                </div>
              </div>

              <div className="mt-8 px-1 text-[10px] text-gray-400 font-medium space-x-2 border-t border-gray-50 pt-4">
                <Link to="/privacy" className="hover:underline">Privacy</Link>
                <Link to="/terms" className="hover:underline">Terms</Link>
                <span>© 2024 NexusSocial</span>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Logout Modal */}
      {showLogoutModal && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 transform transition-all scale-100 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut size={24} />
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Logout Session?</h3>
            <p className="text-gray-500 text-center mb-6">
              Are you sure you want to log out of your current session?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Real-time Floating Chat Window */}
      <ChatWindow />
    </div>
  );
};

export default MainLayout;
