import { apiGet, apiPost, apiPut, apiDelete } from "./api";
import { API_CONFIG } from "../config/apiConfig";
import { ApiResponse, Post } from "../../types";

/**
 * Post Utilities
 */
export const postApi = {
  getPosts: async (params?: Record<string, unknown>) =>
    apiGet(API_CONFIG.ENDPOINTS.POST.LIST, { params }),

  getPost: async (postId: string | number) => apiGet<Post>(API_CONFIG.ENDPOINTS.POST.GET(postId.toString())),

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
    if (data.videos && data.videos.length > 0) {
      data.videos.forEach((file: File) => {
        formData.append("videos", file);
      });
    }

    return apiPost(API_CONFIG.ENDPOINTS.POST.CREATE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 300000, // 5 minutes for large media uploads
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
    if (data.newVideos && data.newVideos.length > 0) {
      data.newVideos.forEach((file: File) => {
        formData.append("newVideos", file);
      });
    }

    if (data.imageOrder && data.imageOrder.length > 0) {
      data.imageOrder.forEach((ref: string) => {
        formData.append("imageOrder", ref);
      });
    }

    return apiPut(API_CONFIG.ENDPOINTS.POST.UPDATE(postId), formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 300000, // 5 minutes for large media uploads
    });
  },

  deletePost: async (postId: string | number) => apiDelete(API_CONFIG.ENDPOINTS.POST.DELETE(postId.toString())),

  sharePost: async (postId: string | number, data?: unknown) =>
    apiPost(API_CONFIG.ENDPOINTS.POST.SHARE(postId.toString()), data),

  reportPost: async (postId: string | number, reason: string) => {
    return apiPost(`/posts/${postId}/report`, { reason });
  },

  search: async (query: string, params?: Record<string, unknown>) =>
    apiGet(API_CONFIG.ENDPOINTS.POST.SEARCH, {
      params: { q: query, ...(params || {}) },
    }),
};
