import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  guestOnly?: boolean; // Chỉ dành cho người chưa đăng nhập (Login/Register)
  requiredRoles?: string[];
}

/**
 * Protected Route Component
 * Conditionally renders children based on authentication status
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  guestOnly = false,
  requiredRoles,
}) => {
  const { isAuthenticated, user } = useAuth();

  // 1. Nếu trang yêu cầu đăng nhập (requireAuth=true) mà chưa đăng nhập -> Về /login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Nếu trang CHỈ dành cho khách (guestOnly=true) mà đã đăng nhập -> Về trang chủ /
  if (guestOnly && isAuthenticated) {
    if (user?.roles?.includes("ROLE_ADMIN")) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // 3. Nếu route yêu cầu quyền cụ thể, kiểm tra xem user có đủ role không
  if (requiredRoles && requiredRoles.length > 0) {
    if (!user || !user.roles) {
      return <Navigate to="/" replace />;
    }
    const hasRole = requiredRoles.some(role => user.roles?.includes(role));
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  } else {
    // người đang đăng nhập LÀ ADMIN -> Đá văng về trang quản trị, cách ly hoàn toàn.
    if (isAuthenticated && user?.roles?.includes("ROLE_ADMIN")) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // 4. Các trường hợp còn lại (Public, hoặc đã thỏa mãn requireAuth) -> Render children
  return <>{children}</>;
};

export default ProtectedRoute;
