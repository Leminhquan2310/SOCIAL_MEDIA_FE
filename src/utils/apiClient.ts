import api, { handleApiError } from "../services/api";
import { API_CONFIG } from "../config/apiConfig";
import { AxiosRequestConfig } from "axios";
import { ApiResponse, LoginRequest } from "../../types";

/**
 * API Request Utilities
 * Helper functions for common API operations
 */

/**
 * GET Request
 */
export const apiGet = async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await api.get<T>(url, config);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * POST Request
 */
export const apiPost = async <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  try {
    const response = await api.post<T>(url, data, config);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * PATCH Request
 */
export const apiPatch = async <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  try {
    const response = await api.patch<T>(url, data, config);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * PUT Request
 */
export const apiPut = async <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  try {
    const response = await api.put<T>(url, data, config);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * DELETE Request
 */
export const apiDelete = async <T = unknown>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> => {
  try {
    const response = await api.delete<T>(url, config);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

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

  verifyEmail: async (token: string) => apiPost(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL, { token }),
};

/**
 * User Utilities
 */
export const userApi = {
  getProfile: async () => apiGet(API_CONFIG.ENDPOINTS.USER.PROFILE),

  getUser: async (userId: string) => apiGet(API_CONFIG.ENDPOINTS.USER.GET_USER(userId)),

  updateProfile: async (data: unknown) => apiPatch(API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE, data),

  getFollowers: async (userId: string) => apiGet(API_CONFIG.ENDPOINTS.USER.GET_FOLLOWERS(userId)),

  getFollowing: async (userId: string) => apiGet(API_CONFIG.ENDPOINTS.USER.GET_FOLLOWING(userId)),

  follow: async (userId: string) => apiPost(API_CONFIG.ENDPOINTS.USER.FOLLOW(userId)),

  unfollow: async (userId: string) => apiPost(API_CONFIG.ENDPOINTS.USER.UNFOLLOW(userId)),
};

/**
 * Post Utilities
 */
export const postApi = {
  getPosts: async (params?: Record<string, unknown>) =>
    apiGet(API_CONFIG.ENDPOINTS.STATUS.LIST, { params }),

  getPost: async (postId: string) => apiGet(API_CONFIG.ENDPOINTS.STATUS.GET(postId)),

  createPost: async (data: unknown) => apiPost(API_CONFIG.ENDPOINTS.STATUS.CREATE, data),

  updatePost: async (postId: string, data: unknown) =>
    apiPatch(API_CONFIG.ENDPOINTS.STATUS.UPDATE(postId), data),

  deletePost: async (postId: string) => apiDelete(API_CONFIG.ENDPOINTS.STATUS.DELETE(postId)),

  likePost: async (postId: string) => apiPost(API_CONFIG.ENDPOINTS.STATUS.LIKE(postId)),

  unlikePost: async (postId: string) => apiPost(API_CONFIG.ENDPOINTS.STATUS.UNLIKE(postId)),

  getLikes: async (postId: string) => apiGet(API_CONFIG.ENDPOINTS.STATUS.GET_LIKES(postId)),

  addComment: async (postId: string, data: unknown) =>
    apiPost(API_CONFIG.ENDPOINTS.STATUS.COMMENT(postId), data),

  sharePost: async (postId: string, data?: unknown) =>
    apiPost(API_CONFIG.ENDPOINTS.STATUS.SHARE(postId), data),
};

/**
 * Friend Utilities
 */
export const friendApi = {
  getFriends: async () => apiGet(API_CONFIG.ENDPOINTS.FRIEND.LIST),

  getSuggestions: async () => apiGet(API_CONFIG.ENDPOINTS.FRIEND.SUGGESTIONS),

  getFriendRequests: async () => apiGet(API_CONFIG.ENDPOINTS.FRIEND.REQUESTS),

  sendRequest: async (userId: string) => apiPost(API_CONFIG.ENDPOINTS.FRIEND.SEND_REQUEST(userId)),

  acceptRequest: async (userId: string) =>
    apiPost(API_CONFIG.ENDPOINTS.FRIEND.ACCEPT_REQUEST(userId)),

  declineRequest: async (userId: string) =>
    apiPost(API_CONFIG.ENDPOINTS.FRIEND.DECLINE_REQUEST(userId)),

  removeFriend: async (userId: string) =>
    apiDelete(API_CONFIG.ENDPOINTS.FRIEND.REMOVE_FRIEND(userId)),
};

/**
 * Message Utilities
 */
export const messageApi = {
  getMessages: async (params?: unknown) => apiGet(API_CONFIG.ENDPOINTS.MESSAGE.LIST, { params }),

  getConversation: async (conversationId: string) =>
    apiGet(API_CONFIG.ENDPOINTS.MESSAGE.GET_CONVERSATION(conversationId)),

  sendMessage: async (data: unknown) => apiPost(API_CONFIG.ENDPOINTS.MESSAGE.SEND, data),

  deleteMessage: async (messageId: string) =>
    apiDelete(API_CONFIG.ENDPOINTS.MESSAGE.DELETE(messageId)),

  markAsRead: async (data: unknown) => apiPost(API_CONFIG.ENDPOINTS.MESSAGE.MARK_READ, data),
};

/**
 * Notification Utilities
 */
export const notificationApi = {
  getNotifications: async (params?: unknown) =>
    apiGet(API_CONFIG.ENDPOINTS.NOTIFICATION.LIST, { params }),

  markAsRead: async (data: unknown) => apiPost(API_CONFIG.ENDPOINTS.NOTIFICATION.MARK_READ, data),

  deleteNotification: async (notificationId: string) =>
    apiDelete(API_CONFIG.ENDPOINTS.NOTIFICATION.DELETE(notificationId)),

  getSettings: async () => apiGet(API_CONFIG.ENDPOINTS.NOTIFICATION.SETTINGS),
};

/**
 * Search Utilities
 */
export const searchApi = {
  searchUsers: async (query: string, params?: Record<string, unknown>) =>
    apiGet(API_CONFIG.ENDPOINTS.SEARCH.USERS, {
      params: { q: query, ...(params || {}) },
    }),

  searchPosts: async (query: string, params?: Record<string, unknown>) =>
    apiGet(API_CONFIG.ENDPOINTS.SEARCH.POSTS, {
      params: { q: query, ...(params || {}) },
    }),

  searchHashtags: async (query: string, params?: Record<string, unknown>) =>
    apiGet(API_CONFIG.ENDPOINTS.SEARCH.HASHTAGS, {
      params: { q: query, ...(params || {}) },
    }),
};
