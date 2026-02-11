import React from "react";
import { RouteObject } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import ProtectedRoute from "../components/ProtectedRoute";

// Auth pages
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

// App pages
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Friends from "../pages/Friends";

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
          <ProtectedRoute requireAuth={false}>
            <LoginPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/register",
        element: (
          <ProtectedRoute requireAuth={false}>
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
    ],
  },

  // Catch all - 404
  {
    path: "*",
    element: <Navigate to="/" />,
  },
];

// Import Navigate type
import { Navigate } from "react-router-dom";
import Messages from "@/pages/Messages";
import Notifications from "@/pages/Notifications";
import { Settings } from "lucide-react";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
