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
import api, { handleApiError, setAccessToken } from "../services/api";
import { authApi } from "../services/authApi";
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

  // Silent Refresh on mount (handles page reload & OAuth2 redirect)
  useEffect(() => {
    const handleInitialAuth = async () => {
      // Vì tokens không còn nằm trong URL hay localStorage, 
      // chúng ta chỉ đơn giản thử gọi refresh token.
      // Trình duyệt sẽ tự động gửi kèm HttpOnly Cookie nếu có.
      await refreshAuth();
    };

    handleInitialAuth();
  }, []);

  /**
   * Khởi tạo trạng thái xác thực bằng cách gọi Refresh Token (Silent Refresh)
   */
  const refreshAuth = async () => {
    try {
      // Thử gọi API Refresh Token (với withCredentials: true đã set mặc định trong api.ts bundle)
      const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH);
      const { accessToken } = response.data.data || response.data;

      // Lưu AT vào bộ nhớ (api instance)
      setAccessToken(accessToken);

      // Fetch profile
      const userResponse = await api.get(API_CONFIG.ENDPOINTS.USER.PROFILE);
      const userData = userResponse.data.data || userResponse.data;

      setState({
        user: userData,
        isAuthenticated: true,
        token: accessToken,
        refreshToken: null, // RT nằm trong HttpOnly Cookie
      });
    } catch (error) {
      // Nếu refresh thất bại (ví dụ: chưa đăng nhập hoặc RT hết hạn)
      setAccessToken(null);
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

  const login = async (data: LoginRequest) => {
    try {
      const response = await authApi.login(data);
      const responseData = response as ApiResponse<LoginResponse>;

      if (responseData.code === 200) {
        const { accessToken } = responseData.data;

        // Lưu Access Token vào bộ nhớ (instance axios)
        setAccessToken(accessToken);

        // Fetch profile ngay lập tức
        const userResponse = await api.get(API_CONFIG.ENDPOINTS.USER.PROFILE);
        const userData = userResponse.data.data || userResponse.data;

        setState({
          user: userData,
          isAuthenticated: true,
          token: accessToken,
          refreshToken: null,
        });
      } else {
        throw new Error(responseData.message || "Login failed");
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  const logout = async () => {
    try {
      // BE sẽ xóa Refresh Token trong DB và xóa Cookie
      await authApi.logout(); // RT được lấy từ Cookie ở BE
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Xóa dữ liệu bộ nhớ
      setAccessToken(null);

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
