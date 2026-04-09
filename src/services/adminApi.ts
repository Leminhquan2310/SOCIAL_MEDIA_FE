import api from "./api";
import { AdminUserResponseDto, PaginatedResponse, VisitStatDto, NewUserStatDto, SuspectIpDto, AdminPostResponseDto, Privacy, Post } from "../../types";

/**
 * Interface for Admin API Service
 */
interface AdminApi {
  getAllUsers: (page?: number, size?: number, sortBy?: string, direction?: string, keyword?: string) => Promise<PaginatedResponse<AdminUserResponseDto>>;
  getUserById: (id: number | string) => Promise<AdminUserResponseDto>;
  getVisitStats: (range?: "week" | "month" | "year") => Promise<VisitStatDto[]>;
  getNewUserStats: (range?: "week" | "month" | "year") => Promise<NewUserStatDto[]>;
  banUser: (id: number | string, reason: string) => Promise<string>;
  unbanUser: (id: number | string) => Promise<string>;
  getSuspiciousIps: (threshold?: number, windowHours?: number) => Promise<SuspectIpDto[]>;
  getUsersByIp: (ip: string) => Promise<AdminUserResponseDto[]>;
  getAllPosts: (page?: number, size?: number, sortBy?: string, direction?: string, filters?: { username?: string, status?: Privacy, minReports?: number, maxReports?: number }) => Promise<PaginatedResponse<AdminPostResponseDto>>;
  getPostById: (postId: number) => Promise<Post>;
  getPostReports: (postId: number) => Promise<any[]>;
  hidePost: (postId: number) => Promise<any>;
  deletePost: (postId: number) => Promise<any>;
  dismissReports: (postId: number) => Promise<any>;
  // IP Blacklist
  getAllBlacklistedIps: (page?: number, size?: number) => Promise<PaginatedResponse<any>>;
  blockIp: (ip: string, reason?: string) => Promise<any>;
  unblockIp: (ip: string) => Promise<any>;
}

/**
 * Admin API Utilities
 */
export const adminApi: AdminApi = {
  getAllUsers: async (page = 0, size = 10, sortBy = "createdAt", direction = "desc", keyword = "") => {
    const response = await api.get<{ data: PaginatedResponse<AdminUserResponseDto> }>(`/admin/users`, {
      params: { page, size, sortBy, direction, keyword },
    });
    return response.data.data;
  },

  getUserById: async (id: number | string) => {
    const response = await api.get<{ data: AdminUserResponseDto }>(`/admin/users/${id}`);
    return response.data.data;
  },

  getVisitStats: async (range: "week" | "month" | "year" = "week") => {
    const response = await api.get<{ data: VisitStatDto[] }>("/admin/stats/visits", {
      params: { range },
    });
    return response.data.data;
  },

  getNewUserStats: async (range: "week" | "month" | "year" = "week") => {
    const response = await api.get<{ data: NewUserStatDto[] }>("/admin/stats/new-users", {
      params: { range },
    });
    return response.data.data;
  },

  banUser: async (id: number | string, reason: string) => {
    const response = await api.post<{ data: string }>(`/admin/users/${id}/ban`, { reason });
    return response.data.data;
  },

  unbanUser: async (id: number | string) => {
    const response = await api.post<{ data: string }>(`/admin/users/${id}/unban`);
    return response.data.data;
  },

  getSuspiciousIps: async (threshold = 3, windowHours = 24) => {
    const response = await api.get<{ data: SuspectIpDto[] }>("/admin/suspects/multi-account-ips", {
      params: { threshold, windowHours },
    });
    return response.data.data;
  },

  getUsersByIp: async (ip: string) => {
    const response = await api.get<{ data: AdminUserResponseDto[] }>("/admin/suspects/by-ip", {
      params: { ip },
    });
    return response.data.data;
  },

  getAllPosts: async (page = 0, size = 10, sortBy = "createdAt", direction = "desc", filters = {}) => {
    const response = await api.get<{ data: PaginatedResponse<AdminPostResponseDto> }>("/admin/posts", {
      params: { page, size, sortBy, direction, ...filters },
    });
    return response.data.data;
  },

  getPostById: async (postId: number) => {
    const response = await api.get<{ data: Post }>(`/admin/posts/${postId}`);
    return response.data.data;
  },

  getPostReports: async (postId: number) => {
    const response = await api.get<{ data: any[] }>(`/admin/posts/${postId}/reports`);
    return response.data.data;
  },

  hidePost: async (postId: number) => {
    const response = await api.patch(`/admin/posts/${postId}/hide`);
    return response.data;
  },

  deletePost: async (postId: number) => {
    const response = await api.delete(`/admin/posts/${postId}`);
    return response.data;
  },

  dismissReports: async (postId: number) => {
    const response = await api.delete(`/admin/posts/${postId}/reports`);
    return response.data;
  },

  getAllBlacklistedIps: async (page = 0, size = 10) => {
    const response = await api.get<{ data: PaginatedResponse<any> }>("/admin/ip-blacklist", {
      params: { page, size },
    });
    return response.data.data;
  },

  blockIp: async (ip: string, reason = "Violation of community standards") => {
    const response = await api.post("/admin/ip-blacklist/block", { ip, reason });
    return response.data;
  },

  unblockIp: async (ip: string) => {
    const response = await api.delete(`/admin/ip-blacklist/unblock/${ip}`);
    return response.data;
  },
};
