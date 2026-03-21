import React, { useState } from "react";
import { X, Save, User, Phone, Calendar, Smile, MapPin } from "lucide-react";
import { User as UserType } from "../../types";
import { userApi } from "../utils/apiClient";

interface EditProfileModalProps {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: UserType) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    phone: user.phone || "",
    dateOfBirth: user.dateOfBirth || "",
    gender: user.gender || "OTHER",
    hobby: user.hobby || "",
    address: user.address || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response: any = await userApi.updateProfile(formData);
      const updatedUser = response.data || response;
      onUpdate(updatedUser);
      onClose();
    } catch (err: any) {
      setError(err.message || "Không thể cập nhật hồ sơ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa hồ sơ</h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                Họ và tên
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  Ngày sinh
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Giới tính</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                <Smile size={16} className="text-gray-400" />
                Tiểu sử / Sở thích
              </label>
              <textarea
                name="hobby"
                value={formData.hobby}
                onChange={handleChange}
                placeholder="Kể chút về bản thân bạn..."
                rows={3}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                Địa chỉ
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Nhập địa chỉ của bạn"
                rows={2}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all cursor-pointer"
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            form="edit-profile-form"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:bg-blue-400 cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
