import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Notification, NotificationType } from "../../types";
import { Heart, MessageCircle, UserPlus, Check, X, BellOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { friendApi } from "../utils/apiClient";
import { toast } from "react-hot-toast";

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAsRead: (id: string | number) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
  refresh: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
  refresh
}) => {
  const navigate = useNavigate();

  const handleNotificationClick = (n: Notification) => {
    onMarkAsRead(n.id);
    onClose();

    // Redirect logic
    if (n.type === NotificationType.FRIEND_REQUEST || n.type === NotificationType.FRIEND_ACCEPT) {
      navigate(`/u/${n.actor.username}`);
    } else if (n.type === NotificationType.LIKE_POST || n.type === NotificationType.COMMENT_POST) {
      navigate(`/posts/${n.referenceId}`);
    } else if (n.type === NotificationType.LIKE_COMMENT || n.type === NotificationType.REPLY_COMMENT) {
      // Giả sử referenceId là commentId, chúng ta cần tìm postId tương ứng hoặc link trực tiếp
      // Hiện tại redirect về trang chủ hoặc thông báo chi tiết nếu có
       navigate(`/posts/${n.referenceId}`); 
    }
  };

  const handleFriendAction = async (e: React.MouseEvent, n: Notification, action: "accept" | "decline") => {
    e.stopPropagation();
    try {
      if (action === "accept") {
        await friendApi.acceptRequest(String(n.actor.id));
        toast.success(`Đã chấp nhận lời mời từ ${n.actor.fullName}`);
      } else {
        await friendApi.declineRequest(String(n.actor.id));
        toast.success(`Đã từ chối lời mời từ ${n.actor.fullName}`);
      }
      onMarkAsRead(n.id);
    } catch (error) {
      toast.error("Thao tác thất bại");
    } finally {
      refresh();
    }
  };

  const getNotificationContent = (n: Notification) => {
    switch (n.type) {
      case NotificationType.FRIEND_REQUEST:
        return "đã gửi cho bạn một lời mời kết bạn.";
      case NotificationType.FRIEND_ACCEPT:
        return "đã chấp nhận lời mời kết bạn của bạn.";
      case NotificationType.LIKE_POST:
        return "đã thích bài viết của bạn.";
      case NotificationType.LIKE_COMMENT:
        return "đã thích bình luận của bạn.";
      case NotificationType.COMMENT_POST:
        return "đã bình luận về bài viết của bạn.";
      case NotificationType.REPLY_COMMENT:
        return "đã trả lời bình luận của bạn.";
      default:
        return "có tương tác mới với bạn.";
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.LIKE_POST:
      case NotificationType.LIKE_COMMENT:
        return <Heart size={12} className="text-rose-500 fill-rose-500" />;
      case NotificationType.COMMENT_POST:
      case NotificationType.REPLY_COMMENT:
        return <MessageCircle size={12} className="text-blue-500" />;
      case NotificationType.FRIEND_REQUEST:
      case NotificationType.FRIEND_ACCEPT:
        return <UserPlus size={12} className="text-green-500" />;
      default:
        return <BellOff size={12} className="text-gray-400" />;
    }
  };

  return (
    <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-slide-up">
      <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0">
        <h3 className="font-bold text-gray-900">Thông báo</h3>
        <button
          onClick={onMarkAllAsRead}
          className="text-xs text-blue-600 font-semibold hover:underline"
        >
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      <div className="max-h-[450px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <BellOff size={40} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">Bạn chưa có thông báo nào</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0 ${!n.isRead ? "bg-blue-50/30" : ""
                }`}
            >
              <div className="relative shrink-0">
                <img
                  src={n.actor.avatarUrl || `https://ui-avatars.com/api/?name=${n.actor.fullName}&background=random`}
                  className="w-12 h-12 rounded-full object-cover border border-gray-100"
                  alt=""
                />
                <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm border border-gray-50">
                  {getIcon(n.type)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 leading-snug">
                  <span className="font-bold">
                    {n.actor.fullName || n.actor.username}
                    {n.actorCount && n.actorCount > 1 && (
                      <span className="font-normal text-gray-500"> và {n.actorCount - 1} người khác</span>
                    )}
                  </span>{" "}
                  {getNotificationContent(n)}
                </p>
                <p className="text-[11px] text-gray-400 mt-1 font-medium italic">
                  {formatDistanceToNow(new Date(n.createdAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </p>

                {/* Friend Request Actions */}
                {n.actionable && n.type === NotificationType.FRIEND_REQUEST && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={(e) => handleFriendAction(e, n, "accept")}
                      className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-blue-700 transition-colors"
                    >
                      <Check size={14} /> Chấp nhận
                    </button>
                    <button
                      onClick={(e) => handleFriendAction(e, n, "decline")}
                      className="flex-1 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-200 transition-colors"
                    >
                      <X size={14} /> Từ chối
                    </button>
                  </div>
                )}
              </div>
              {!n.isRead && (
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 shrink-0"></div>
              )}
            </div>
          ))
        )}
      </div>

      <Link
        to="/notifications"
        onClick={onClose}
        className="block w-full text-center py-3 bg-gray-50 text-sm font-bold text-blue-600 hover:bg-gray-100 transition-colors border-t border-gray-50"
      >
        Xem tất cả thông báo
      </Link>
    </div>
  );
};

export default NotificationDropdown;
