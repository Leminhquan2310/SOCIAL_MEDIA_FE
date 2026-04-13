import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Users, LogOut, Shield, LayoutDashboard, AlertTriangle, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import AdminSearch from "../components/admin/AdminSearch";

const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { 
      name: "Dashboard", 
      path: "/admin/dashboard", 
      icon: <LayoutDashboard size={20} />, 
      description: "Overview of platform statistics and activities" 
    },
    { 
      name: "User Management", 
      path: "/admin/users", 
      icon: <Users size={20} />, 
      description: "Manage user information, status, and roles" 
    },
    { 
      name: "Post Management", 
      path: "/admin/posts", 
      icon: <Shield size={20} />, 
      description: "Moderate posts, hide violating content, and manage reports" 
    },
    { 
      name: "Suspects", 
      path: "/admin/suspects", 
      icon: <AlertTriangle size={20} />, 
      description: "Monitor suspicious accounts and unusual activities" 
    },
    { 
      name: "IP Blacklist", 
      path: "/admin/ip-blacklist", 
      icon: <Shield size={20} />, 
      description: "Manage the list of blocked IP addresses" 
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Shield className="text-blue-600 mr-2" size={24} />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Social Admin
          </span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <div className={`${isActive ? "text-blue-600" : "text-gray-400"}`}>
                  {item.icon}
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 gap-4">
          <h1 className="text-lg font-semibold text-gray-800 hidden lg:block whitespace-nowrap">
            {navItems.find((n) => location.pathname.startsWith(n.path))?.name || "Dashboard"}
          </h1>
          <div className="flex-1 flex justify-center md:justify-end">
            <AdminSearch items={navItems} />
          </div>
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
