import React from "react";
import { Outlet } from "react-router-dom";

/**
 * Auth Layout Component
 * Wraps login and register pages
 * No header or sidebar for clean auth experience
 */
const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
