import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../types";
import Sidebar from "../components/Sidebar";
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
import { SUGGESTED_FRIENDS, ONLINE_FRIENDS } from "../constants";

interface NotificationItem {
  id: number;
  type: "like" | "comment" | "friend";
  user: User;
  text: string;
  time: string;
}

/**
 * Main Layout Component
 * Wraps authenticated pages with header, sidebar, and suggested friends
 */
const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notification dropdown when clicking outside
  useEffect(() => {
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

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate("/login");
  };

  const notifications: NotificationItem[] = [
    {
      id: 1,
      type: "like",
      user: SUGGESTED_FRIENDS[0],
      text: "liked your photo",
      time: "2m ago",
    },
    {
      id: 2,
      type: "comment",
      user: SUGGESTED_FRIENDS[1],
      text: "commented on your post",
      time: "1h ago",
    },
    {
      id: 3,
      type: "friend",
      user: ONLINE_FRIENDS[0],
      text: "sent you a friend request",
      time: "5h ago",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
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
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2 rounded-full transition-all ${
                  isNotifOpen ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Bell size={22} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-slide-up">
                  <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                    <button className="text-xs text-blue-600 font-semibold hover:underline">
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-4 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
                      >
                        <div className="relative">
                          <img src={n.user.avatar} className="w-10 h-10 rounded-full" alt="" />
                          <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full">
                            {n.type === "like" && (
                              <Heart size={10} className="text-rose-500 fill-rose-500" />
                            )}
                            {n.type === "comment" && (
                              <MessageCircle size={10} className="text-blue-500" />
                            )}
                            {n.type === "friend" && (
                              <UserPlus size={10} className="text-green-500" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-bold">{n.user.name}</span> {n.text}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link
                    to="/notifications"
                    onClick={() => setIsNotifOpen(false)}
                    className="block w-full text-center py-3 bg-gray-50 text-sm font-bold text-blue-600 hover:bg-gray-100 transition-colors"
                  >
                    View All Notifications
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/messages"
              className="hidden sm:block p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              title="Messages"
            >
              <MessageSquare size={22} />
            </Link>
            <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>
            <Link
              to={`/profile/${user?.id}`}
              className="flex items-center gap-2 pl-2 hover:opacity-80 transition-opacity"
            >
              <img
                src={user?.avatar}
                className="w-8 h-8 rounded-full border border-gray-100"
                alt=""
              />
              <span className="font-bold text-sm hidden sm:block">
                {user?.username.split(" ")[0]}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <div
          className={`
          lg:col-span-3 lg:block
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

        {/* Page Content */}
        <main className="lg:col-span-6 md:col-span-12 min-h-screen">
          <Outlet />
        </main>

        {/* Suggested Friends Sidebar */}
        <aside className="lg:col-span-3 hidden lg:block space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Suggested For You</h3>
              <Link to="/friends" className="text-xs font-bold text-blue-600 hover:underline">
                See All
              </Link>
            </div>
            <div className="space-y-4">
              {SUGGESTED_FRIENDS.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between group">
                  <Link
                    to={`/profile/${friend.id}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={friend.avatar}
                      className="w-10 h-10 rounded-full object-cover"
                      alt=""
                    />
                    <div className="overflow-hidden">
                      <p className="font-bold text-sm truncate">{friend.name}</p>
                      <p className="text-xs text-gray-500">@{friend.username}</p>
                    </div>
                  </Link>
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group-hover:bg-blue-100 active:scale-95">
                    <UserPlus size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-gray-50 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Online Friends</h3>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
              </div>
              <div className="space-y-4">
                {ONLINE_FRIENDS.map((friend) => (
                  <Link
                    to={`/profile/${friend.id}`}
                    key={friend.id}
                    className="flex items-center gap-3 cursor-pointer p-1 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative">
                      <img
                        src={friend.avatar}
                        className="w-10 h-10 rounded-full object-cover shadow-sm"
                        alt=""
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-bold text-sm truncate">{friend.name}</p>
                      <p className="text-[10px] text-green-600 font-medium">Active now</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-8 px-2 text-[10px] text-gray-400 font-medium space-x-2">
              <Link to="/privacy" className="hover:underline">
                Privacy
              </Link>
              <Link to="/terms" className="hover:underline">
                Terms
              </Link>
              <span>© 2024 NexusSocial</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in"
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
        </div>
      )}
    </div>
  );
};

export default MainLayout;
