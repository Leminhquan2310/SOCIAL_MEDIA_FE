import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Heart, Shield, Clock } from "lucide-react";
import { adminApi } from "../../services/adminApi";
import { AdminUserResponseDto } from "../../../types";
import { format } from "date-fns";

const AdminUserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUserResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUser = () => {
    if (id) {
      adminApi.getUserById(id)
        .then(setUser)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleBanUser = async () => {
    if (!banReason.trim()) return alert("Please enter keyword!");
    setActionLoading(true);
    try {
      await adminApi.banUser(id!, banReason);
      setUser(prev => prev ? { ...prev, enabled: false } : null);
      setIsBanModalOpen(false);
      setBanReason("");
      alert("Banned account successfully!");
    } catch (err) {
      console.error(err);
      alert("Ban account failed!");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnbanUser = async () => {
    if (!window.confirm("Are you sure you want to unban this account?")) return;
    setActionLoading(true);
    try {
      await adminApi.unbanUser(id!);
      setUser(prev => prev ? { ...prev, enabled: true } : null);
      alert("Unbanned account successfully!");
    } catch (err) {
      console.error(err);
      alert("Mở khóa thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center">
        <div className="text-gray-400 mb-4"><Shield size={48} /></div>
        <h2 className="text-xl font-bold text-gray-800">Không tìm thấy người dùng</h2>
        <p className="text-gray-500 mt-2">Dữ liệu có thể đã bị xóa hoặc không tồn tại.</p>
        <Link to="/admin/users" className="mt-6 text-blue-600 font-medium hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/users" className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold text-gray-800">Chi tiết tài khoản</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cover / Header section */}
        <div className="h-32 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100"></div>

        <div className="px-8 pb-8 relative">
          {/* Avatar and basic info */}
          <div className="flex flex-col sm:flex-row gap-6 -mt-12 sm:items-end mb-8">
            <img
              src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.fullName}&size=150`}
              alt={user.fullName}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover border-4 border-white shadow-md bg-white"
            />
            <div className="flex-1 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
                  <p className="text-gray-500 font-medium text-sm">@{user.username}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.enabled ? "ACTIVE" : "BANNED"}
                  </span>
                  {user.roles?.map(role => (
                    <span key={role} className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                      {role.replace("ROLE_", "")}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            {user.enabled ? (
              <button
                onClick={() => setIsBanModalOpen(true)}
                disabled={actionLoading}
                className="px-6 py-2 bg-red-50 text-red-600 font-medium rounded-lg border border-red-100 hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                Khóa tài khoản (Ban)
              </button>
            ) : (
              <button
                onClick={handleUnbanUser}
                disabled={actionLoading}
                className="px-6 py-2 bg-green-50 text-green-600 font-medium rounded-lg border border-green-100 hover:bg-green-100 transition-colors disabled:opacity-50"
              >
                Mở khóa tài khoản (Unban)
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cột 1: Thông tin liên hệ */}
            <div>
              <h3 className="text-lg font-bold border-b border-gray-100 pb-2 mb-4 text-gray-800">Thông tin liên hệ</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Mail className="text-gray-400 shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Email</p>
                    <p className="text-gray-900">{user.email || "---"}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="text-gray-400 shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Số điện thoại</p>
                    <p className="text-gray-900">{user.phone || "---"}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="text-gray-400 shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Địa chỉ</p>
                    <p className="text-gray-900">{user.address || "---"}</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Cột 2: Thông tin cá nhân */}
            <div>
              <h3 className="text-lg font-bold border-b border-gray-100 pb-2 mb-4 text-gray-800">Cá nhân & Nhãn định</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Calendar className="text-gray-400 shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Ngày sinh</p>
                    <p className="text-gray-900">{user.dateOfBirth ? format(new Date(user.dateOfBirth), 'dd/MM/yyyy') : "---"}
                      <span className="text-gray-400 ml-2">({user.gender === 'MALE' ? 'Nam' : user.gender === 'FEMALE' ? 'Nữ' : 'Khác'})</span>
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Heart className="text-gray-400 shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Sở thích</p>
                    <p className="text-gray-900">{user.hobby || "---"}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="text-gray-400 shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Gia nhập ngày</p>
                    <p className="text-gray-900">
                      {user.createdAt ? format(new Date(user.createdAt), 'HH:mm - dd/MM/yyyy') : "---"}
                      <span className="text-gray-400 ml-2 text-xs">({user.authProvider})</span>
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Dữ liệu hệ thống / Quyền truy cập */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-bold uppercase text-gray-400 mb-4 tracking-wider">Cài đặt Quyền riêng tư ban đầu</h3>
            <div className="flex gap-4">
              <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 flex-1">
                <p className="text-xs text-gray-500 font-medium">Trạng thái (Profile)</p>
                <p className="font-semibold text-gray-800 text-sm mt-0.5">{user.status}</p>
              </div>
              <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 flex-1">
                <p className="text-xs text-gray-500 font-medium">Bạn bè hiển thị</p>
                <p className="font-semibold text-gray-800 text-sm mt-0.5">{user.displayFriendsStatus}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ban Modal */}
      {isBanModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Khóa tài khoản</h3>
            <p className="text-gray-500 text-sm mb-6">Bạn đang thực hiện thao tác khóa tài khoản của <b>{user.fullName}</b>. Hành động này sẽ đăng xuất người dùng lập tức và ẩn nội dung bài viết của họ.</p>

            <label className="block text-sm font-medium text-gray-700 mb-2">Lý do khóa <span className="text-red-500">*</span></label>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Nhập lý do vi phạm (spam, scam, v.v...)"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all resize-none h-24 mb-6"
            ></textarea>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsBanModalOpen(false)}
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                disabled={actionLoading}
              >
                Hủy
              </button>
              <button
                onClick={handleBanUser}
                disabled={actionLoading || !banReason.trim()}
                className="px-6 py-2 bg-red-600 text-white font-medium shadow-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                Xác nhận Khóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserDetail;
