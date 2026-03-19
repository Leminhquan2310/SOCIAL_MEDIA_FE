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
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
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
  const [isInitializing, setIsInitializing] = useState(true);

  // Check if token exists on mount or handles OAuth2 redirect
  useEffect(() => {
    const handleAuth = async () => {
      // 1. Kiểm tra OAuth2 callback từ URL
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get("accessToken");

      if (urlToken) {
        localStorage.setItem(API_CONFIG.TOKEN.ACCESS_TOKEN_KEY, urlToken);
        // Xóa token khỏi URL để bảo mật và sạch sẽ
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Cập nhật state và fetch profile
        await initializeAuth(urlToken);
      } else {
        // 2. Kiểm tra token trong localStorage (phiên làm việc cũ)
        const storedToken = localStorage.getItem(API_CONFIG.TOKEN.ACCESS_TOKEN_KEY);
        if (storedToken) {
          await initializeAuth(storedToken);
        } else {
          setIsInitializing(false);
        }
      }
    };

    handleAuth();
  }, []);

  /**
   * Khởi tạo trạng thái xác thực và lấy thông tin người dùng
   */
  const initializeAuth = async (token: string) => {
    try {
      // Thiết lập header mặc định cho các request tiếp theo
      api.defaults.headers.common["Authorization"] = `${API_CONFIG.TOKEN.TOKEN_PREFIX} ${token}`;
      
      // Fetch thông tin profile từ server
      const response = await api.get(API_CONFIG.ENDPOINTS.USER.PROFILE);
      const userData = response.data.data || response.data;
      
      setState({
        user: userData,
        isAuthenticated: true,
        token: token,
        refreshToken: null,
      });
    } catch (error) {
      console.error("Auth initialization failed:", error);
      // Xóa token lỗi
      localStorage.removeItem(API_CONFIG.TOKEN.ACCESS_TOKEN_KEY);
      localStorage.removeItem(API_CONFIG.TOKEN.REFRESH_TOKEN_KEY);
      delete api.defaults.headers.common["Authorization"];
      
      setState({
        user: null,
        isAuthenticated: false,
        token: null,
        refreshToken: null,
      });
    } finally {
      setIsInitializing(false);
    }
  };

  /**
   * Register function
   */
  const register = async (data: RegisterRequest) => {
    try {
      const response = await authApi.register(data);
      const responseData = response as ApiResponse<RegisterResponse>;

      if (responseData.code === 201 || responseData.code === 200) {
        return responseData.data;
      } else {
        throw new Error(responseData.message || "Registration failed");
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  /**
   * Login function
   */
  const login = async (data: LoginRequest) => {
    try {
      const response = await authApi.login(data);
      const responseData = response as ApiResponse<LoginResponse>;

      if (responseData.code === 200) {
        const loginData = responseData.data;
        const accessToken = loginData.accessToken;
        // Backend có thể không trả RT trong body (đã trả ở Cookie)
        const refreshToken = loginData.refreshToken;

        localStorage.setItem(API_CONFIG.TOKEN.ACCESS_TOKEN_KEY, accessToken);
        if (refreshToken) {
          localStorage.setItem(API_CONFIG.TOKEN.REFRESH_TOKEN_KEY, refreshToken);
        }

        await initializeAuth(accessToken);
      } else {
        throw new Error(responseData.message || "Login failed");
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  /**
   * Logout function
   */
  const logout = async () => {
    try {
      // Gọi API logout để BE xóa Refresh Token trong DB và xóa Cookie
      // Vẫn gửi kèm khóa RT dưới dạng JSON gửi lên nếu LocalStorage có chứa (Mobile app style)
      const storedRefreshToken = localStorage.getItem(API_CONFIG.TOKEN.REFRESH_TOKEN_KEY);
      await authApi.logout({ refreshToken: storedRefreshToken || "" });
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Xóa dữ liệu cục bộ ngay lập tức để người dùng thoát khỏi phiên
      localStorage.removeItem(API_CONFIG.TOKEN.ACCESS_TOKEN_KEY);
      localStorage.removeItem(API_CONFIG.TOKEN.REFRESH_TOKEN_KEY);
      delete api.defaults.headers.common["Authorization"];
      
      setState({
        user: null,
        isAuthenticated: false,
        token: null,
        refreshToken: null,
      });
    }
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
      {isInitializing ? (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium animate-pulse">Initializing Auth...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
