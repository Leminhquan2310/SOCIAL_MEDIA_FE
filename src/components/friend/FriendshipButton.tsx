import React, { useState } from "react";
import {
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Clock,
  UserCog,
  MoreHorizontal
} from "lucide-react";
import { useFriendship } from "../../hooks/useFriendship";
import ConfirmDialog from "../common/ConfirmDialog";
import { FriendshipStatus } from "../../../types";

interface FriendshipButtonProps {
  targetUserId: string | number;
  targetUserName?: string;
  variant?: "full" | "icon";
  onStatusChange?: (status: FriendshipStatus) => void;
}

const FriendshipButton: React.FC<FriendshipButtonProps> = ({
  targetUserId,
  targetUserName = "người này",
  variant = "full",
  onStatusChange,
}) => {
  const {
    status,
    isLoading,
    sendRequest,
    cancelRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
  } = useFriendship(targetUserId);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"unfriend" | "decline" | "cancel">("unfriend");

  // Sync status if parent needs it
  React.useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  if (status === "LOADING" && variant === "full") {
    return (
      <div className="h-10 w-32 bg-gray-100 animate-pulse rounded-xl" />
    );
  }

  const handleConfirmAction = async () => {
    setIsConfirmOpen(false);
    if (confirmType === "unfriend") await removeFriend();
    else if (confirmType === "decline") await declineRequest();
    else if (confirmType === "cancel") await cancelRequest();
  };

  const openConfirm = (type: "unfriend" | "decline" | "cancel") => {
    setConfirmType(type);
    setIsConfirmOpen(true);
  };

  // Render logic based on status
  const renderContent = () => {
    switch (status) {
      case "NONE":
        return (
          <button
            onClick={sendRequest}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 cursor-pointer active:scale-95 disabled:bg-blue-400"
          >
            <UserPlus size={18} />
            {variant === "full" && "Kết bạn"}
          </button>
        );

      case "PENDING_SENT":
        return (
          <button
            onClick={() => openConfirm("cancel")}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Clock size={18} className="text-blue-500" />
            {variant === "full" && "Hủy lời mời"}
          </button>
        );

      case "PENDING_RECEIVED":
        return (
          <div className="flex gap-2">
            <button
              onClick={acceptRequest}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 cursor-pointer active:scale-95 disabled:bg-blue-400"
            >
              <UserCheck size={18} />
              {variant === "full" && "Chấp nhận"}
            </button>
            <button
              onClick={() => openConfirm("decline")}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <UserX size={18} />
              {variant === "full" && "Từ chối"}
            </button>
          </div>
        );

      case "ACCEPTED":
        return (
          <div className="relative group">
            <button
              className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm transition-all shadow-sm shadow-gray-100"
            >
              <UserCog size={18} className="text-blue-600" />
              {variant === "full" && "Bạn bè"}
            </button>

            {/* Quick Actions Dropdown on Hover/Click - Simplified for now with just Unfriend */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto z-10 overflow-hidden">
              <button
                onClick={() => openConfirm("unfriend")}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors"
              >
                <UserMinus size={18} />
                Hủy kết bạn
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const confirmData = {
    unfriend: {
      title: "Hủy kết bạn?",
      message: `Bạn có chắc chắn muốn hủy kết bạn với **${targetUserName}** không? Hai người sẽ không còn thấy tin nhắn của nhau nếu để chế độ riêng tư.`,
      confirmText: "Hủy kết bạn",
    },
    decline: {
      title: "Gỡ lời mời?",
      message: `Bạn có chắc chắn muốn gỡ lời mời kết bạn từ **${targetUserName}** không?`,
      confirmText: "Gỡ bỏ",
    },
    cancel: {
      title: "Thu hồi lời mời?",
      message: `Bạn có chắc chắn muốn thu hồi lời mời kết bạn đã gửi cho **${targetUserName}** không?`,
      confirmText: "Thu hồi",
    }
  };

  return (
    <>
      {renderContent()}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        isLoading={isLoading}
        title={confirmData[confirmType].title}
        message={confirmData[confirmType].message}
        confirmText={confirmData[confirmType].confirmText}
        type={confirmType === "unfriend" || confirmType === "decline" ? "danger" : "info"}
      />
    </>
  );
};

export default FriendshipButton;
