import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Shield, AlertTriangle, ChevronDown, ChevronRight, Users, RefreshCw, Settings } from "lucide-react";
import { adminApi } from "../../services/adminApi";
import { SuspectIpDto } from "../../../types";
import { format } from "date-fns";

const AdminSuspectPage: React.FC = () => {
  const [suspects, setSuspects] = useState<SuspectIpDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIp, setExpandedIp] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(3);
  const [windowHours, setWindowHours] = useState(24);

  const fetchSuspects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSuspiciousIps(threshold, windowHours);
      setSuspects(data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [threshold, windowHours]);

  useEffect(() => {
    fetchSuspects();
  }, [fetchSuspects]);

  const toggleIp = (ip: string) => {
    setExpandedIp(prev => (prev === ip ? null : ip));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <AlertTriangle className="text-amber-600" size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Phát hiện Spam / Multi-Account</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              IPs đăng ký từ {threshold} tài khoản trở lên trong {windowHours} giờ gần nhất
            </p>
          </div>
        </div>
        <button
          onClick={fetchSuspects}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {/* Config Panel */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex flex-wrap gap-6 items-end">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Settings size={16} />
          Cấu hình phát hiện
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Số account tối thiểu / IP</label>
          <input
            type="number"
            min={2}
            max={20}
            value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Cửa sổ thời gian (giờ)</label>
          <select
            value={windowHours}
            onChange={e => setWindowHours(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 outline-none"
          >
            <option value={1}>1 giờ</option>
            <option value={6}>6 giờ</option>
            <option value={24}>24 giờ</option>
            <option value={72}>3 ngày</option>
            <option value={168}>7 ngày</option>
          </select>
        </div>
        <button
          onClick={fetchSuspects}
          className="px-4 py-1.5 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors"
        >
          Áp dụng
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : suspects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
          <Shield size={48} className="mx-auto text-green-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-700">Không phát hiện mối đe dọa</h3>
          <p className="text-sm text-gray-400 mt-1">
            Không có IP nào đăng ký từ {threshold} tài khoản trở lên trong {windowHours} giờ qua.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 font-medium">
            Phát hiện <span className="text-amber-600 font-bold">{suspects.length}</span> IP đáng ngờ
          </p>

          {suspects.map((suspect) => (
            <div key={suspect.ip} className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
              {/* IP Row */}
              <button
                onClick={() => toggleIp(suspect.ip)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-amber-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <AlertTriangle size={16} className="text-amber-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-mono font-bold text-gray-800">{suspect.ip}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {suspect.accountCount} tài khoản đã đăng ký từ địa chỉ này
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    <Users size={11} className="inline mr-1" />
                    {suspect.accountCount} accounts
                  </span>
                  {expandedIp === suspect.ip
                    ? <ChevronDown size={18} className="text-gray-400" />
                    : <ChevronRight size={18} className="text-gray-400" />
                  }
                </div>
              </button>

              {/* Expanded: Account List */}
              {expandedIp === suspect.ip && (
                <div className="border-t border-amber-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-5 py-2.5 font-semibold text-gray-500 text-xs uppercase">Người dùng</th>
                        <th className="px-5 py-2.5 font-semibold text-gray-500 text-xs uppercase">Email</th>
                        <th className="px-5 py-2.5 font-semibold text-gray-500 text-xs uppercase">Trạng thái</th>
                        <th className="px-5 py-2.5 font-semibold text-gray-500 text-xs uppercase">Đăng ký</th>
                        <th className="px-5 py-2.5 font-semibold text-gray-500 text-xs uppercase">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {suspect.accounts.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.fullName}&size=32`}
                                alt={user.fullName}
                                className="w-8 h-8 rounded-full object-cover border border-gray-100"
                              />
                              <div>
                                <p className="font-medium text-gray-800">{user.fullName || "---"}</p>
                                <p className="text-xs text-gray-400">@{user.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-gray-600">{user.email || "---"}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                              {user.enabled ? "Hoạt động" : "Bị khóa"}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-gray-400 text-xs">
                            {user.createdAt ? format(new Date(user.createdAt), "dd/MM/yyyy HH:mm") : "---"}
                          </td>
                          <td className="px-5 py-3">
                            <Link
                              to={`/admin/users/${user.id}`}
                              className="text-blue-600 text-xs font-medium hover:underline"
                            >
                              Xem chi tiết
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSuspectPage;
