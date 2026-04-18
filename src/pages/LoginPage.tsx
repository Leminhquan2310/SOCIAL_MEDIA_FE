import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLoading } from "../contexts/LoadingContext";
import { handleApiError } from "../services/api";
import { ShieldCheck, LogIn, AlertCircle, Chrome, Facebook } from "lucide-react";
import { API_CONFIG } from "../config/apiConfig";

/**
 * Login Page
 * User authentication interface
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  // Redirect to home or admin if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.roles?.includes("ROLE_ADMIN")) {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [isAuthenticated, user, navigate]);

  /**
   * OAuth2 Redirect Handler
   * Redirects user to backend authorization endpoint for OAuth login
   */
  const handleOAuthRedirect = (provider: "google" | "facebook") => {
    const baseUri = API_CONFIG.BASE_URL_ORIGIN;
    // Backend SecurityConfig defines baseUri as /oauth2/authorize
    const redirectUri = `${baseUri}/oauth2/authorize/${provider}?redirect_uri=${encodeURIComponent(window.location.origin + "/")}`;
    window.location.href = redirectUri;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    showLoading("Signing in...");

    // Validate form
    if (!loginData.username.trim() || !loginData.password.trim()) {
      setError("Please enter both username and password");
      setLoading(false);
      hideLoading();
      return;
    }

    try {
      await login({ username: loginData.username, password: loginData.password });
      hideLoading();
      // Navigation happens automatically via useEffect watching isAuthenticated
    } catch (err) {
      setError(handleApiError(err));
      setLoading(false);
      hideLoading();
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 transition-all">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl text-white mb-4 shadow-lg shadow-blue-200">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Welcome Back</h1>
        <p className="text-gray-500 mt-2 text-sm">Sign in to NexusSocial to stay connected</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-fade-in">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLoginSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Enter your username"
            value={loginData.username}
            onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
          <input
            type="password"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="••••••••"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-100"
        >
          {loading ? (
            <>
              <LogIn size={20} />
              Signing in...
            </>
          ) : (
            <>
              <LogIn size={20} />
              Sign In
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-gray-500 text-sm font-medium">Or login with</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => handleOAuthRedirect("google")}
          className="w-full bg-white text-gray-700 font-semibold py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm"
        >
          <Chrome size={20} className="text-red-500" />
          Sign in with Google
        </button>

        <button
          type="button"
          onClick={() => handleOAuthRedirect("facebook")}
          className="w-full bg-white text-gray-700 font-semibold py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm"
        >
          <Facebook size={20} className="text-blue-600" />
          Sign in with Facebook
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:underline transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
