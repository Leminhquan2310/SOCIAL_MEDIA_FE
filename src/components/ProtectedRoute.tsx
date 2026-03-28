import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  guestOnly?: boolean; // Chỉ dành cho người chưa đăng nhập (Login/Register)
}

/**
 * Protected Route Component
 * Conditionally renders children based on authentication status
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  guestOnly = false
}) => {
  const { isAuthenticated } = useAuth();

  // 1. Nếu trang yêu cầu đăng nhập (requireAuth=true) mà chưa đăng nhập -> Về /login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Nếu trang CHỈ dành cho khách (guestOnly=true) mà đã đăng nhập -> Về trang chủ /
  if (guestOnly && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 3. Các trường hợp còn lại (Public, hoặc đã thỏa mãn requireAuth) -> Render children
  return <>{children}</>;
};

export default ProtectedRoute;
