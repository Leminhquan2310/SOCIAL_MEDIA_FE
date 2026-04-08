import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Eye, Filter } from "lucide-react";
import { adminApi } from "../../services/adminApi";
import { AdminUserResponseDto, PaginatedResponse } from "../../../types";
import { format } from "date-fns";

const AdminUsersPage: React.FC = () => {
  const [data, setData] = useState<PaginatedResponse<AdminUserResponseDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");

  const fetchUsers = async (p = 0, q = "") => {
    setLoading(true);
    try {
      const res = await adminApi.getAllUsers(p, 10, "createdAt", "desc", q);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, keyword);
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchUsers(0, keyword);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">Danh sách người dùng</h2>

        <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Tìm theo Username, Tên, Email..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium border-b border-gray-100">ID</th>
              <th className="px-6 py-4 font-medium border-b border-gray-100">Người dùng</th>
              <th className="px-6 py-4 font-medium border-b border-gray-100">Liên hệ</th>
              <th className="px-6 py-4 font-medium border-b border-gray-100">Vai trò</th>
              <th className="px-6 py-4 font-medium border-b border-gray-100">Trạng thái</th>
              <th className="px-6 py-4 font-medium border-b border-gray-100 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                     Đang tải dữ liệu...
                  </div>
                </td>
              </tr>
            ) : data?.content.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Không tìm thấy người dùng nào.
                </td>
              </tr>
            ) : (
              data?.content.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-500">#{user.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.fullName}`}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{user.fullName || "Chưa cập nhật"}</div>
                        <div className="text-gray-500 text-xs">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-800">{user.email}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{user.phone || "---"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {user.roles?.map((role) => (
                        <span key={role} className={`px-2 py-0.5 rounded text-xs font-semibold ${role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                          {role.replace("ROLE_", "")}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.enabled ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/admin/users/${user.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <Eye size={16} />
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && data && data.totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm">
          <div className="text-gray-500">
            Hiển thị <span className="font-medium">{data.pageable.offset + 1}</span> đến{" "}
            <span className="font-medium">
              {Math.min(data.pageable.offset + data.numberOfElements, data.totalElements)}
            </span>{" "}
            trong số <span className="font-medium">{data.totalElements}</span> kết quả
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={data.first}
              className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
              disabled={data.last}
              className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
