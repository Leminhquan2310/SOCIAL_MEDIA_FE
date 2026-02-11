import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLoading } from "../contexts/LoadingContext";
import { handleApiError } from "../services/api";
import { ShieldCheck, UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import { RegisterRequest } from "../types";

/**
 * Register Page
 * User registration interface
 */
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [registerData, setRegisterData] = useState<RegisterRequest>({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    phone: "",
    role: "",
  });

  /**
   * Validate registration form
   * Returns error message if validation fails, null if all valid
   */
  const validateForm = (): string | null => {
    // Validate full name
    if (!registerData.fullName.trim()) {
      return "Full name is required";
    }
    if (registerData.fullName.trim().length < 2) {
      return "Full name must be at least 2 characters";
    }

    // Validate username
    if (!registerData.username.trim()) {
      return "Username is required";
    }
    if (registerData.username.trim().length < 3) {
      return "Username must be at least 3 characters";
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(registerData.username.trim())) {
      return "Username can only contain letters, numbers, underscores, and hyphens";
    }

    // Validate email
    if (!registerData.email.trim()) {
      return "Email is required";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email.trim())) {
      return "Please enter a valid email address";
    }

    // Validate password
    if (!registerData.password) {
      return "Password is required";
    }
    if (registerData.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    // Validate confirm password
    if (!registerData.confirmPassword) {
      return "Please confirm your password";
    }
    if (registerData.password !== registerData.confirmPassword) {
      return "Passwords do not match";
    }

    return null;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    showLoading("Creating your account...");

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      hideLoading();
      return;
    }

    try {
      // Prepare registration data
      const registrationData: RegisterRequest = {
        fullName: registerData.fullName.trim(),
        username: registerData.username.trim(),
        email: registerData.email.trim(),
        password: registerData.password,
        confirmPassword: registerData.confirmPassword,
        dateOfBirth: registerData.dateOfBirth || "",
        phone: registerData.phone || "",
        role: registerData.role || "",
      };

      await register(registrationData);

      setSuccess("Registration successful! Redirecting to login...");
      hideLoading();

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      setLoading(false);
      hideLoading();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 transition-all">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl text-white mb-4 shadow-lg shadow-blue-200">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Create Account</h1>
        <p className="text-gray-500 mt-2 text-sm">Join NexusSocial today and connect with others</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-fade-in">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 animate-fade-in">
          <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-green-800 text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleRegisterSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            name="fullName"
            required
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50"
            placeholder="e.g., Nguyễn Văn Ti"
            value={registerData.fullName}
            onChange={handleInputChange}
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
          <input
            type="text"
            name="username"
            required
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50"
            placeholder="e.g., nguyenvanti2"
            value={registerData.username}
            onChange={handleInputChange}
          />
          <p className="text-xs text-gray-500 mt-1">
            Only letters, numbers, underscores, and hyphens
          </p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50"
            placeholder="e.g., nguyenvanti2@gmail.com"
            value={registerData.email}
            onChange={handleInputChange}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            required
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50"
            placeholder="••••••••"
            value={registerData.password}
            onChange={handleInputChange}
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            required
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50"
            placeholder="••••••••"
            value={registerData.confirmPassword}
            onChange={handleInputChange}
          />
        </div>

        {/* Optional Fields */}
        <div className="pt-2">
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-600 font-medium hover:text-gray-900">
              Additional Information (Optional)
            </summary>
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  disabled={loading}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm disabled:bg-gray-50"
                  value={registerData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  disabled={loading}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm disabled:bg-gray-50"
                  placeholder="+84000000000"
                  value={registerData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </details>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-100 mt-6"
        >
          {loading ? (
            <>
              <UserPlus size={20} />
              Creating account...
            </>
          ) : (
            <>
              <UserPlus size={20} />
              Create Account
            </>
          )}
        </button>
      </form>

      {/* Sign In Link */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
