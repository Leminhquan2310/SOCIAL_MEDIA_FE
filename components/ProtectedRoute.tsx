import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * Protected Route Component
 * Conditionally renders children based on authentication status
 * Redirects to login if not authenticated
 * Redirects to home if authenticated but trying to access auth pages
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAuth = true }) => {
  const { isAuthenticated } = useAuth();

  if (requireAuth && !isAuthenticated) {
    // Not authenticated and page requires auth
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && isAuthenticated) {
    // Already authenticated and page is for non-authenticated users (login/register)
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
