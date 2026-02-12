import React, { createContext, useState, useContext, useEffect } from "react";
import {
  User,
  AuthState,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  ApiResponse,
} from "../../types";
import { MOCK_USER } from "../../constants";
import api, { handleApiError } from "../services/api";
import { authApi } from "../utils/apiClient";
import { API_CONFIG } from "../config/apiConfig";

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    token: null,
    refreshToken: null,
  });

  // Check if token exists on mount
  useEffect(() => {
    const token = localStorage.getItem(API_CONFIG.TOKEN.ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(API_CONFIG.TOKEN.REFRESH_TOKEN_KEY);

    if (token) {
      setState({
        user: MOCK_USER,
        isAuthenticated: true,
        token: token,
        refreshToken: refreshToken,
      });
    }
  }, []);

  /**
   * Register function
   * Handles user registration with the provided credentials
   * Note: Does not auto-login after registration. User must login manually.
   */
  const register = async (data: RegisterRequest) => {
    try {
      const response = await authApi.register(data);

      // The API returns { code, message, data: RegisterResponse }
      const responseData = response as ApiResponse<RegisterResponse>;

      if (responseData.code === 201 || responseData.code === 200) {
        // Registration successful - user must login manually
        return responseData.data;
      } else {
        throw new Error(responseData.message || "Registration failed");
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  };

  /**
   * Login function
   * Authenticates user and stores tokens
   */
  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login({
        username,
        password,
      });

      // The API returns { code, message, data: LoginResponse }
      const responseData = response as ApiResponse<LoginResponse>;

      if (responseData.code === 200) {
        const loginData = responseData.data;
        const accessToken = loginData.accessToken;
        const refreshToken = loginData.refreshToken;

        // Store tokens in localStorage
        localStorage.setItem(API_CONFIG.TOKEN.ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(API_CONFIG.TOKEN.REFRESH_TOKEN_KEY, refreshToken);

        // Set default authorization header
        api.defaults.headers.common["Authorization"] =
          `${API_CONFIG.TOKEN.TOKEN_PREFIX} ${accessToken}`;

        // Create user object from response (minimal info from login)
        // In real app, fetch full profile from /users/profile endpoint
        const user: User = {
          id: username,
          username: username,
          email: username, // Placeholder, should fetch actual email
          fullName: username,
          avatar: MOCK_USER.avatar || "",
          bio: "",
          followers: 0,
          following: 0,
        };

        setState({
          user,
          isAuthenticated: true,
          token: accessToken,
          refreshToken: refreshToken,
        });
      } else {
        throw new Error(responseData.message || "Login failed");
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  };

  /**
   * Logout function
   * Clears user data and tokens
   */
  const logout = () => {
    localStorage.clear();
    delete api.defaults.headers.common["Authorization"];
    setState({
      user: null,
      isAuthenticated: false,
      token: null,
      refreshToken: null,
    });
  };

  /**
   * Update user function
   * Updates partial user data in state
   */
  const updateUser = (data: Partial<User>) => {
    if (state.user) {
      setState((prev) => ({ ...prev, user: { ...prev.user!, ...data } }));
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
