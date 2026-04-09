import { apiGet, apiPost, apiDelete } from "./api";
import { API_CONFIG } from "../config/apiConfig";

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
