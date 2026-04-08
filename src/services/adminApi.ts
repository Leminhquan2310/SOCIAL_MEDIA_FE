import api from "./api";
import { AdminUserResponseDto, PaginatedResponse, VisitStatDto } from "../../types";

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
};
