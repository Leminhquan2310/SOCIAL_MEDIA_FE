import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./src/contexts/AuthContext";
import { LoadingProvider } from "./src/contexts/LoadingContext";
import LoadingOverlay from "./src/components/LoadingOverlay";
import MainLayout from "./src/layouts/MainLayout";
import AuthLayout from "./src/layouts/AuthLayout";
import ProtectedRoute from "./src/components/ProtectedRoute";

// Auth pages
import LoginPage from "./src/pages/LoginPage";
import RegisterPage from "./src/pages/RegisterPage";

// App pages
import Home from "./src/pages/Home";
import Profile from "./src/pages/Profile";
import Friends from "./src/pages/Friends";
import Messages from "./src/pages/Messages";
import Notifications from "./src/pages/Notifications";
import Settings from "./src/pages/Settings";
import Privacy from "./src/pages/Privacy";
import Terms from "./src/pages/Terms";
import SearchResults from "./src/pages/SearchResults";

/**
 * App Component
 * Main application entry point with routing
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LoadingProvider>
        <AuthProvider>
          <LoadingOverlay />
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route
                path="/login"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <LoginPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <RegisterPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Main App Routes */}
            <Route element={<MainLayout />}>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:userId"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/friends"
                element={
                  <ProtectedRoute>
                    <Friends />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/privacy"
                element={
                  <ProtectedRoute>
                    <Privacy />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/terms"
                element={
                  <ProtectedRoute>
                    <Terms />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <SearchResults />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </LoadingProvider>
    </BrowserRouter>
  );
};

export default App;
