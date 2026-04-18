import { apiGet, apiPost, apiDelete } from "./api";
import { API_CONFIG } from "../config/apiConfig";
import { ApiResponse, FriendStatusDTO, FriendUserDTO } from "../../types";

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
