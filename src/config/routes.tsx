import React from "react";
import { RouteObject, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import ProtectedRoute from "../components/ProtectedRoute";

// Admin Layout
import AdminLayout from "../layouts/AdminLayout";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminUserDetail from "../pages/admin/AdminUserDetail";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminSuspectPage from "../pages/admin/AdminSuspectPage";

// Auth pages
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

// App pages
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Friends from "../pages/Friends";
import PostDetail from "../pages/PostDetail";
import Messages from "../pages/Messages";
import Notifications from "../pages/Notifications";
import Settings from "../pages/Settings";
import Privacy from "../pages/Privacy";
import Terms from "../pages/Terms";
import SearchResults from "../pages/SearchResults";

/**
 * Route Configuration
 * Defines all application routes with protected/public access
 */
export const routes: RouteObject[] = [
  // Auth Routes
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: (
          <ProtectedRoute requireAuth={false} guestOnly={true}>
            <LoginPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/register",
        element: (
          <ProtectedRoute requireAuth={false} guestOnly={true}>
            <RegisterPage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Main App Routes
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile/:userId",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/posts/:postId",
        element: (
          <ProtectedRoute>
            <PostDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "/u/:username",
        element: (
          <ProtectedRoute requireAuth={false}>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/friends",
        element: (
          <ProtectedRoute>
            <Friends />
          </ProtectedRoute>
        ),
      },
      {
        path: "/messages",
        element: (
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        ),
      },
      {
        path: "/notifications",
        element: (
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        ),
      },
      {
        path: "/settings",
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
      {
        path: "/privacy",
        element: (
          <ProtectedRoute>
            <Privacy />
          </ProtectedRoute>
        ),
      },
      {
        path: "/terms",
        element: (
          <ProtectedRoute>
            <Terms />
          </ProtectedRoute>
        ),
      },
      {
        path: "/search",
        element: (
          <ProtectedRoute>
            <SearchResults />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Admin App Routes
  {
    path: "/admin",
    element: (
      <ProtectedRoute requiredRoles={["ROLE_ADMIN"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <AdminDashboardPage />,
      },
      {
        path: "users",
        element: <AdminUsersPage />,
      },
      {
        path: "users/:id",
        element: <AdminUserDetail />,
      },
      {
        path: "suspects",
        element: <AdminSuspectPage />,
      },
      {
        path: "",
        element: <Navigate to="/admin/dashboard" replace />,
      },
    ],
  },

  // Catch all - redirect to home
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];
