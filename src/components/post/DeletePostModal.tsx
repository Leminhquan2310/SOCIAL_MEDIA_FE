import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

interface DeletePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const DeletePostModal: React.FC<DeletePostModalProps> = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-scale-up border border-rose-50">
        <div className="p-1 px-4 pt-4 flex justify-end">
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="px-8 pb-8 text-center">
          <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4 text-rose-500">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa bài viết?</h3>
          <p className="text-gray-500 text-[14.5px] mb-8 leading-relaxed">
            Hành động này không thể hoàn tác. Bài viết của bạn sẽ bị gỡ bỏ vĩnh viễn khỏi nền tảng.
          </p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all active:scale-95"
            >
              Hủy bỏ
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {isDeleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeletePostModal;
