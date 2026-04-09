import { apiGet, apiPost, apiPut, apiDelete } from "./api";
import { API_CONFIG } from "../config/apiConfig";
import { ApiResponse, Comment, PaginatedResponse } from "../../types";

/**
 * Comment Utilities
 */
export const commentApi = {
  getCommentsByPost: async (postId: string, params?: Record<string, unknown>) =>
    apiGet<ApiResponse<PaginatedResponse<Comment>>>(API_CONFIG.ENDPOINTS.COMMENT.BY_POST(postId), { params }),

  createComment: async (postId: string, data: any) => {
    const formData = new FormData();
    if (data.content) formData.append("content", data.content);
    if (data.image) formData.append("image", data.image);
    if (data.parentCommentId) formData.append("parentCommentId", data.parentCommentId);

    return apiPost<ApiResponse<Comment>>(API_CONFIG.ENDPOINTS.COMMENT.BY_POST(postId), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateComment: async (commentId: string | number, data: unknown) =>
    apiPut<ApiResponse<Comment>>(API_CONFIG.ENDPOINTS.COMMENT.UPDATE(commentId.toString()), data),

  deleteComment: async (commentId: string | number) =>
    apiDelete<ApiResponse<void>>(API_CONFIG.ENDPOINTS.COMMENT.DELETE(commentId.toString())),

  getReplies: async (commentId: string | number) =>
    apiGet<ApiResponse<Comment[]>>(API_CONFIG.ENDPOINTS.COMMENT.REPLIES(commentId.toString())),
};
