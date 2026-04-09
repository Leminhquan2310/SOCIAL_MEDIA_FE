import { apiGet, apiPatch, apiDelete } from "./api";
import { API_CONFIG } from "../config/apiConfig";
import { ApiResponse, Notification, PaginatedResponse } from "../../types";

/**
 * Notification Utilities
 */
export const notificationApi = {
  getNotifications: async (params?: Record<string, unknown>) =>
    apiGet<ApiResponse<PaginatedResponse<Notification>>>(API_CONFIG.ENDPOINTS.NOTIFICATION.LIST, { params }),

  getUnreadCount: async () => apiGet<ApiResponse<number>>(API_CONFIG.ENDPOINTS.NOTIFICATION.UNREAD_COUNT),

  markAsRead: async (notificationId: string) =>
    apiPatch<ApiResponse<void>>(API_CONFIG.ENDPOINTS.NOTIFICATION.MARK_READ(notificationId)),

  markAllAsRead: async () => apiPatch<ApiResponse<void>>(API_CONFIG.ENDPOINTS.NOTIFICATION.MARK_ALL_READ),

  deleteNotification: async (notificationId: string) =>
    apiDelete<ApiResponse<void>>(API_CONFIG.ENDPOINTS.NOTIFICATION.DELETE(notificationId)),
};
