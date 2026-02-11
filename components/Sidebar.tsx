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
    { icon: User, label: "Profile", path: `/profile/${user?.id}` },
    { icon: Users, label: "Friends", path: "/friends" },
    { icon: MessageSquare, label: "Messages", path: "/messages" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sticky top-6">
      <div className="flex items-center gap-3 mb-8 px-2">
        <img
          src={user?.avatar}
          alt={user?.name}
          className="w-12 h-12 rounded-full border-2 border-blue-500"
        />
        <div className="overflow-hidden">
          <h2 className="font-bold text-gray-800 truncate">{user?.name}</h2>
          <p className="text-sm text-gray-500">@{user?.username}</p>
        </div>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.path}
              className="flex items-center gap-4 p-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
            >
              <Icon size={22} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={onLogoutClick}
          className="w-full flex items-center gap-4 p-3 text-red-500 hover:bg-red-50 rounded-lg transition-all mt-4"
        >
          <LogOut size={22} />
          <span className="font-medium">Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
