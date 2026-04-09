import { apiGet } from "./api";
import { API_CONFIG } from "../config/apiConfig";

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
