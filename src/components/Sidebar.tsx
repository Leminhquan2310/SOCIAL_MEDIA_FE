import React from "react";
import { Link } from "react-router-dom";
import { Home, User, Users, MessageSquare, Bell, Settings, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface SidebarProps {
  onLogoutClick: () => void;
}

/**
 * Sidebar Component
 * Main navigation menu for authenticated users
 */
const Sidebar: React.FC<SidebarProps> = ({ onLogoutClick }) => {
  const { user } = useAuth();

  const menuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: User, label: "Profile", path: `/u/${user?.username}` },
    { icon: Users, label: "Friends", path: "/friends" },
    { icon: MessageSquare, label: "Messages", path: "/messages" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 sticky top-24 border border-gray-50">
      <div className="flex items-center gap-2.5 mb-6 px-1">
        <img
          src={user?.avatarUrl}
          alt={user?.fullName}
          className="w-10 h-10 rounded-full border-2 border-blue-500 shadow-sm"
        />
        <div className="overflow-hidden">
          <h2 className="font-bold text-gray-800 text-sm truncate">{user?.fullName}</h2>
          <p className="text-[11px] text-gray-400">@{user?.username}</p>
        </div>
      </div>

      <nav className="space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.path}
              className="flex items-center gap-3 p-2.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
            >
              <Icon size={18} />
              <span className="font-semibold text-[13.5px]">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={onLogoutClick}
          className="w-full flex items-center gap-3 p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-all mt-4"
        >
          <LogOut size={18} />
          <span className="font-semibold text-[13.5px]">Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
