import api, { handleApiError } from "../services/api";
import { API_CONFIG } from "../config/apiConfig";
import { AxiosRequestConfig } from "axios";
import { ApiResponse, LoginRequest, FriendStatusDTO } from "../../types";

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
};

/**
 * User Utilities
 */
export const userApi = {
  getProfile: async () => apiGet(API_CONFIG.ENDPOINTS.USER.PROFILE),

  getUser: async (userId: string) => apiGet(API_CONFIG.ENDPOINTS.USER.GET_USER(userId)),

  getUserByUsername: async (username: string) => apiGet(API_CONFIG.ENDPOINTS.USER.GET_BY_USERNAME(username)),

  updateProfile: async (data: unknown) => apiPatch(API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE, data),

  updateAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiPatch(API_CONFIG.ENDPOINTS.USER.UPDATE_AVATAR, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

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
    apiGet(API_CONFIG.ENDPOINTS.POST.LIST, { params }),

  getPost: async (postId: string) => apiGet(API_CONFIG.ENDPOINTS.POST.GET(postId)),

  getMyPosts: async (params?: Record<string, unknown>) =>
    apiGet(API_CONFIG.ENDPOINTS.POST.GET_ME, { params }),

  getNewsFeed: async (params?: Record<string, unknown>) =>
    apiGet(API_CONFIG.ENDPOINTS.POST.GET_FEED, { params }),

  getUserPosts: async (userId: string, params?: Record<string, unknown>) =>
    apiGet(API_CONFIG.ENDPOINTS.POST.GET_USER_POSTS(userId), { params }),

  createPost: async (data: any) => {
    const formData = new FormData();
    if (data.content) formData.append("content", data.content);
    if (data.privacy) formData.append("privacy", data.privacy);
    if (data.feeling) formData.append("feeling", data.feeling);
    if (data.images && data.images.length > 0) {
      data.images.forEach((file: File) => {
        formData.append("images", file);
      });
    }

    return apiPost(API_CONFIG.ENDPOINTS.POST.CREATE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updatePost: async (postId: string, data: any) => {
    const formData = new FormData();
    if (data.content) formData.append("content", data.content);
    if (data.privacy) formData.append("privacy", data.privacy);
    if (data.feeling) formData.append("feeling", data.feeling);

    if (data.deletedImageIds && data.deletedImageIds.length > 0) {
      data.deletedImageIds.forEach((id: number) => {
        formData.append("deletedImageIds", id.toString());
      });
    }

    if (data.newImages && data.newImages.length > 0) {
      data.newImages.forEach((file: File) => {
        formData.append("newImages", file);
      });
    }

    if (data.imageOrder && data.imageOrder.length > 0) {
      data.imageOrder.forEach((ref: string) => {
        formData.append("imageOrder", ref);
      });
    }

    return apiPut(API_CONFIG.ENDPOINTS.POST.UPDATE(postId), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deletePost: async (postId: string) => apiDelete(API_CONFIG.ENDPOINTS.POST.DELETE(postId)),

  likePost: async (postId: string) => apiPost(API_CONFIG.ENDPOINTS.POST.LIKE(postId)),

  unlikePost: async (postId: string) => apiPost(API_CONFIG.ENDPOINTS.POST.UNLIKE(postId)),

  getLikes: async (postId: string) => apiGet(API_CONFIG.ENDPOINTS.POST.GET_LIKES(postId)),

  addComment: async (postId: string, data: unknown) =>
    apiPost(API_CONFIG.ENDPOINTS.POST.COMMENT(postId), data),

  sharePost: async (postId: string, data?: unknown) =>
    apiPost(API_CONFIG.ENDPOINTS.POST.SHARE(postId), data),

  search: async (query: string, params?: Record<string, unknown>) =>
    apiGet(API_CONFIG.ENDPOINTS.POST.SEARCH, {
      params: { q: query, ...(params || {}) },
    }),
};

/**
 * Friend Utilities
 */
export const friendApi = {
  getFriends: async (username: string) => apiGet(API_CONFIG.ENDPOINTS.FRIEND.LIST(username)),

  getSuggestions: async () => apiGet(API_CONFIG.ENDPOINTS.FRIEND.SUGGESTIONS),

  getFriendRequests: async () => apiGet(API_CONFIG.ENDPOINTS.FRIEND.REQUESTS),

  sendRequest: async (userId: string) => apiPost(API_CONFIG.ENDPOINTS.FRIEND.SEND_REQUEST(userId)),

  cancelRequest: async (userId: string) =>
    apiDelete(API_CONFIG.ENDPOINTS.FRIEND.CANCEL_REQUEST(userId)),

  acceptRequest: async (userId: string) =>
    apiPost(API_CONFIG.ENDPOINTS.FRIEND.ACCEPT_REQUEST(userId)),

  declineRequest: async (userId: string) =>
    apiPost(API_CONFIG.ENDPOINTS.FRIEND.DECLINE_REQUEST(userId)),

  removeFriend: async (userId: string) =>
    apiDelete(API_CONFIG.ENDPOINTS.FRIEND.REMOVE_FRIEND(userId)),

  getRelationshipStatus: async (userId: string): Promise<ApiResponse<FriendStatusDTO>> =>
    apiGet<ApiResponse<FriendStatusDTO>>(API_CONFIG.ENDPOINTS.FRIEND.GET_STATUS(userId)),

  getMutualFriends: async (userId: string, params?: Record<string, unknown>) =>
    apiGet(API_CONFIG.ENDPOINTS.FRIEND.MUTUAL_FRIENDS(userId), { params }),
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
import { Notification } from "../../types";

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const notificationApi = {
  getNotifications: async (params?: Record<string, unknown>) =>
    apiGet<ApiResponse<Page<Notification>>>(API_CONFIG.ENDPOINTS.NOTIFICATION.LIST, { params }),

  getUnreadCount: async () => apiGet<ApiResponse<number>>(API_CONFIG.ENDPOINTS.NOTIFICATION.UNREAD_COUNT),

  markAsRead: async (notificationId: string) =>
    apiPatch<ApiResponse<void>>(API_CONFIG.ENDPOINTS.NOTIFICATION.MARK_READ(notificationId)),

  markAllAsRead: async () => apiPatch<ApiResponse<void>>(API_CONFIG.ENDPOINTS.NOTIFICATION.MARK_ALL_READ),

  deleteNotification: async (notificationId: string) =>
    apiDelete<ApiResponse<void>>(API_CONFIG.ENDPOINTS.NOTIFICATION.DELETE(notificationId)),
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
