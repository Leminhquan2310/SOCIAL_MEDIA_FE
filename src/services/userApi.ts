import { apiGet, apiPatch, apiPost } from "./api";
import { API_CONFIG } from "../config/apiConfig";

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
