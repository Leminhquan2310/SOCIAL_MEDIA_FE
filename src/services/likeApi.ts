import { apiGet, apiPost } from "./api";
import { API_CONFIG } from "../config/apiConfig";
import { ApiResponse } from "../../types";

/**
 * Like Utilities
 */
export const likeApi = {
  toggleLike: async (targetId: string | number, targetType: "POST" | "COMMENT") =>
    apiPost<ApiResponse<void>>(API_CONFIG.ENDPOINTS.LIKE.TOGGLE, null, {
      params: { targetId, targetType },
    }),

  isLiked: async (targetId: string | number, targetType: "POST" | "COMMENT") =>
    apiGet<ApiResponse<boolean>>(API_CONFIG.ENDPOINTS.LIKE.STATUS, {
      params: { targetId, targetType },
    }),

  getLikeCount: async (targetId: string | number, targetType: "POST" | "COMMENT") =>
    apiGet<ApiResponse<number>>(API_CONFIG.ENDPOINTS.LIKE.COUNT, {
      params: { targetId, targetType },
    }),
};
