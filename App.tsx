import React from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { AuthProvider } from "./src/contexts/AuthContext";
import { LoadingProvider } from "./src/contexts/LoadingContext";
import LoadingOverlay from "./src/components/LoadingOverlay";
import { routes } from "./src/config/routes";
import { Toaster } from "react-hot-toast";
import { ChatProvider } from "./src/contexts/ChatContext";
import { SocketProvider } from "./src/contexts/SocketContext";

/**
 * App Content Component
 * Handles the actual routing logic using useRoutes hook
 */
const AppContent: React.FC = () => {
  const content = useRoutes(routes);
  return content;
};

/**
 * App Component
 * main application entry point with providers and router
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LoadingProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#363636',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <SocketProvider>
            <ChatProvider>
              <LoadingOverlay />
              <AppContent />
            </ChatProvider>
          </SocketProvider>
        </AuthProvider>
      </LoadingProvider>
    </BrowserRouter>
  );
};

export default App;
