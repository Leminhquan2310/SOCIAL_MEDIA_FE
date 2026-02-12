import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_CONFIG } from "../config/apiConfig";

// Types
interface ErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
}

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: number;
}

/**
 * API Client Instance
 * Handles all HTTP requests with automatic token management and retries
 */
const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

/**
 * Request Interceptor
 * Add JWT token to authorization header
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(API_CONFIG.TOKEN.ACCESS_TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `${API_CONFIG.TOKEN.TOKEN_PREFIX} ${token}`;
    }

    // Log requests in development
    if (API_CONFIG.IS_DEVELOPMENT) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor
 * Handle token refresh and retry logic
 */
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (API_CONFIG.IS_DEVELOPMENT) {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`,
      );
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig;

    // Log errors in development
    if (API_CONFIG.IS_DEVELOPMENT) {
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        message: (error.response?.data as ErrorResponse)?.message,
      });
    }

    // Handle 401 Unauthorized - Token Refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = 1;

      try {
        const refreshToken = localStorage.getItem(API_CONFIG.TOKEN.REFRESH_TOKEN_KEY);

        if (!refreshToken) {
          // No refresh token available, redirect to login
          localStorage.clear();
          window.location.href = "#/login";
          return Promise.reject(error);
        }

        // Call refresh token endpoint
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`,
          { refreshToken: refreshToken },
        );

        const newAccessToken = response.data.data?.accessToken || response.data.accessToken;
        const newRefreshToken = response.data.data?.refreshToken || response.data.refreshToken;

        // Update stored tokens
        localStorage.setItem(API_CONFIG.TOKEN.ACCESS_TOKEN_KEY, newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem(API_CONFIG.TOKEN.REFRESH_TOKEN_KEY, newRefreshToken);
        }

        // Update default header
        api.defaults.headers.common["Authorization"] =
          `${API_CONFIG.TOKEN.TOKEN_PREFIX} ${newAccessToken}`;

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `${API_CONFIG.TOKEN.TOKEN_PREFIX} ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear storage and redirect to login
        localStorage.clear();
        window.location.href = "#/login";
        return Promise.reject(refreshError);
      }
    }

    // Handle retry logic for specific status codes
    if (
      originalRequest &&
      !originalRequest._retry &&
      API_CONFIG.RETRY.RETRY_STATUS_CODES.includes(error.response?.status || 0)
    ) {
      originalRequest._retry = (originalRequest._retry || 0) + 1;

      if (originalRequest._retry <= API_CONFIG.RETRY.MAX_RETRIES) {
        // Exponential backoff: wait before retrying
        const delay = API_CONFIG.RETRY.RETRY_DELAY * Math.pow(2, originalRequest._retry - 1);

        if (API_CONFIG.IS_DEVELOPMENT) {
          console.log(
            `[API Retry] Retrying request in ${delay}ms (attempt ${originalRequest._retry})`,
          );
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(originalRequest);
      }
    }

    // Handle 429 Too Many Requests
    if (error.response?.status === 429) {
      const retryAfter = parseInt(error.response.headers["retry-after"] || "60");
      console.warn(`[API Rate Limited] Retry after ${retryAfter} seconds`);
    }

    // Handle network errors
    if (!error.response) {
      console.error("[API Network Error]", error.message);
    }

    return Promise.reject(error);
  },
);

/**
 * Error Handler Utility
 * Standardize error messages across the application
 */
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const errorData = error.response?.data?.data as ErrorResponse;

    // Custom error message from server
    if (errorData?.message) {
      return errorData.message;
    }

    // Default error messages by status code
    switch (error.response?.status) {
      case 400:
        return "Invalid request. Please check your input.";
      case 401:
        return "Unauthorized. Please log in again.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return "Server error. Please try again later.";
      case 502:
      case 503:
        return "Service unavailable. Please try again later.";
      default:
        return error.message || "An unexpected error occurred.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
};

export default api;
