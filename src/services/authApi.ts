import { apiPost } from "./api";
import { API_CONFIG } from "../config/apiConfig";
import { ApiResponse, LoginRequest } from "../../types";

/**
 * Authentication Utilities
 */
export const authApi = {
  login: async (credentials: LoginRequest) => apiPost(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials),

  logout: async (): Promise<ApiResponse<Object>> =>
    apiPost(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {}),

  register: async (data: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    dateOfBirth?: string;
    phone?: string;
    role?: string;
  }) => apiPost(API_CONFIG.ENDPOINTS.AUTH.REGISTER, data),

  refreshToken: async () =>
    apiPost(API_CONFIG.ENDPOINTS.AUTH.REFRESH, {}),
};
