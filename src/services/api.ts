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
  withCredentials: API_CONFIG.TOKEN.WITH_CREDENTIALS,
});

let accessTokenMemory: string | null = null;

/**
 * Update the access token stored in memory
 */
export const setAccessToken = (token: string | null) => {
  accessTokenMemory = token;
  if (token) {
    api.defaults.headers.common["Authorization"] = `${API_CONFIG.TOKEN.TOKEN_PREFIX} ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

/**
 * Request Interceptor
 * Add JWT token to authorization header from memory
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessTokenMemory) {
      config.headers.Authorization = `${API_CONFIG.TOKEN.TOKEN_PREFIX} ${accessTokenMemory}`;
    }

    // Log requests in development
    // if (API_CONFIG.IS_DEVELOPMENT) {
    //   console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    // }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Custom types for queue
interface FailedRequestQueue {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequestQueue[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Response Interceptor
 * Handle token refresh via HttpOnly Cookie and retry logic
 */
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (API_CONFIG.IS_DEVELOPMENT) {
      // console.log(
      //   `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`,
      // );
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
      // Bỏ qua nếu chính endpoint login hoặc register bị 401
      if (
        originalRequest.url?.includes(API_CONFIG.ENDPOINTS.AUTH.LOGIN) ||
        originalRequest.url?.includes(API_CONFIG.ENDPOINTS.AUTH.REGISTER) ||
        originalRequest.url?.includes(API_CONFIG.ENDPOINTS.AUTH.REFRESH)
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `${API_CONFIG.TOKEN.TOKEN_PREFIX} ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = 1;
      isRefreshing = true;

      try {
        // Gọi refresh token endpoint. 
        // Trình duyệt sẽ tự động đính kèm HttpOnly Cookie "refreshToken" nhờ withCredentials: true
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`,
          {}, // Không cần gửi body nữa vì RT nằm trong Cookie
          { withCredentials: true }
        );

        const newAccessToken = response.data.data?.accessToken || response.data.accessToken;

        // Lưu Access Token mới vào bộ nhớ
        setAccessToken(newAccessToken);

        processQueue(null, newAccessToken);

        // Retry request cũ với token mới
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `${API_CONFIG.TOKEN.TOKEN_PREFIX} ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh thất bại (RT hết hạn hoặc bị thu hồi)
        processQueue(refreshError as AxiosError, null);

        setAccessToken(null);

        // Redirect về login nếu refresh thất bại hoàn toàn
        // window.location.href = "/login"; // Tạm thời tắt để hỗ trợ Guest mode, để Router xử lý
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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
    // Some backend APIs return error in 'message' at top level
    // Others wrap it in 'data'
    const errorData = error.response?.data;
    
    // Ưu tiên lấy chi tiết lỗi cụ thể nằm trong data.message (từ GlobalExceptionHandler)
    const specificMessage = typeof errorData?.data === 'string' ? errorData?.data : errorData?.data?.message;
    // Lấy message chung nếu không có chi tiết cụ thể, hoặc bỏ qua nếu nó chỉ là các mã trạng thái như "FORBIDDEN", "BAD_REQUEST"
    const genericMessage = (errorData?.message && !["FORBIDDEN", "UNAUTHORIZED", "BAD_REQUEST", "NOT_FOUND", "INTERNAL_SERVER_ERROR"].includes(errorData.message)) ? errorData.message : null;
    
    const message = specificMessage || genericMessage;

    if (message) {
      return message;
    }

    // Default error messages by status code
    switch (error.response?.status) {
      case 400:
        return "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại.";
      case 401:
        return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      case 403:
        return "Bạn không có quyền thực hiện hành động này.";
      case 404:
        return "Không tìm thấy dữ liệu yêu cầu.";
      case 429:
        return "Quá nhiều yêu cầu. Vui lòng thử lại sau.";
      case 500:
        return "Lỗi hệ thống. Vui lòng thử lại sau ít phút.";
      default:
        return error.message || "Đã xảy ra lỗi không mong muốn.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Đã xảy ra lỗi không mong muốn.";
};

/**
 * Generic GET Request
 */
export const apiGet = async <T = unknown>(url: string, config?: any): Promise<T> => {
  try {
    const response = await api.get<T>(url, config);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Generic POST Request
 */
export const apiPost = async <T = unknown>(url: string, data?: any, config?: any): Promise<T> => {
  try {
    const response = await api.post<T>(url, data, config);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Generic PUT Request
 */
export const apiPut = async <T = unknown>(url: string, data?: any, config?: any): Promise<T> => {
  try {
    const response = await api.put<T>(url, data, config);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Generic PATCH Request
 */
export const apiPatch = async <T = unknown>(url: string, data?: any, config?: any): Promise<T> => {
  try {
    const response = await api.patch<T>(url, data, config);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Generic DELETE Request
 */
export const apiDelete = async <T = unknown>(url: string, config?: any): Promise<T> => {
  try {
    const response = await api.delete<T>(url, config);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export default api;
