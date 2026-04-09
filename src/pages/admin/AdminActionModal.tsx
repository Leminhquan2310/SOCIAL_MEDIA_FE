import React from "react";

interface AdminActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmText: string;
  confirmVariant?: "danger" | "primary" | "success";
  isLoading?: boolean;
  showReasonInput?: boolean;
  reasonValue?: string;
  onReasonChange?: (val: string) => void;
  reasonPlaceholder?: string;
  isConfirmDisabled?: boolean;
}

const AdminActionModal: React.FC<AdminActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  confirmVariant = "primary",
  isLoading = false,
  showReasonInput = false,
  reasonValue = "",
  onReasonChange,
  reasonPlaceholder = "Enter reason...",
  isConfirmDisabled = false,
}) => {
  if (!isOpen) return null;

  const variantClasses = {
    danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    primary: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    success: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-scale-in">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="text-gray-500 text-sm mb-6">{description}</div>

        {showReasonInput && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reasonValue}
              onChange={(e) => onReasonChange?.(e.target.value)}
              placeholder={reasonPlaceholder}
              className={`w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-1 outline-none transition-all resize-none h-24 ${confirmVariant === "danger" ? "focus:border-red-500 focus:ring-red-500" : "focus:border-blue-500 focus:ring-blue-500"
                }`}
            ></textarea>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || isConfirmDisabled || (showReasonInput && !reasonValue.trim())}
            className={`px-6 py-2 text-white font-medium shadow-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${variantClasses[confirmVariant]}`}
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminActionModal;
