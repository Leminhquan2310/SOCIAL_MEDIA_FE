import { apiGet, apiPost } from "./api";
import { ConversationResponseDto, MessageDto } from "../../types";
import { API_CONFIG } from "../config/apiConfig";
import { ApiResponse, PaginatedResponse } from "../../types";

export const chatApi = {
    getConversations: async (page = 0, size = 20) => {
        const response = await apiGet<ApiResponse<PaginatedResponse<ConversationResponseDto>>>(`${API_CONFIG.ENDPOINTS.CHAT.CONVERSATIONS}`, {
            params: { page, size },
            withCredentials: true
        });
        return response.data;
    },

    getMessages: async (conversationId: number, page = 0, size = 50) => {
        const response = await apiGet<ApiResponse<PaginatedResponse<MessageDto>>>(`${API_CONFIG.ENDPOINTS.CHAT.MESSAGES(conversationId.toString())}`, {
            params: { page, size },
            withCredentials: true
        });
        return response.data;
    },

    markAsSeen: async (conversationId: number) => {
        const response = await apiPost<ApiResponse<void>>(`${API_CONFIG.ENDPOINTS.CHAT.SEEN(conversationId.toString())}`, {}, {
            withCredentials: true
        });
        return response.data;
    },

    getUnreadCount: async () => {
        const response = await apiGet<ApiResponse<number>>(`${API_CONFIG.ENDPOINTS.CHAT.UNREAD_COUNT}`, {
            withCredentials: true
        });
        return response.data;
    },
    getOrCreateConversation: async (receiverId: number) => {
        const response = await apiPost<ApiResponse<ConversationResponseDto>>(`${API_CONFIG.ENDPOINTS.CHAT.GET_OR_CREATE(receiverId.toString())}`, {}, {
            withCredentials: true
        });
        return response.data;
    }
};
