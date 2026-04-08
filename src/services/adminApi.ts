import api from "./api";
import { AdminUserResponseDto, PaginatedResponse, VisitStatDto, NewUserStatDto } from "../../types";

export const adminApi = {
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
};
