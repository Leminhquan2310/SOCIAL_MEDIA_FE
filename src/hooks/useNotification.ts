import { useState, useEffect, useCallback, useRef } from "react";
import { Notification, NotificationType } from "../../types";
import { useAuth } from "../contexts/AuthContext";
import { notificationApi } from "../utils/apiClient";
import { toast } from "react-hot-toast";

import { useSocket } from "../contexts/SocketContext";
import { IMessage } from "@stomp/stompjs";

export function useNotification() {
  const { user, isAuthenticated, token, logout } = useAuth();
  const { connected, subscribe } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch initial data notifycation
  const fetchInitialDataNotify = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    try {
      const notifsRes = await notificationApi.getNotifications({ size: 20 });

      // Use data from ApiResponse
      if (notifsRes && notifsRes.data) {
        setNotifications(notifsRes.data.content || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [isAuthenticated, user]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    try {
      const countRes = await notificationApi.getUnreadCount();
      if (countRes) {
        setUnreadCount(countRes.data || 0);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Handle incoming message
  const handleMessage = useCallback((message: IMessage) => {
    if (import.meta.env.DEV) console.log("Received WebSocket Message:", message.body);
    try {
      const newNotif: Notification = JSON.parse(message.body);
      if (newNotif.isSilent
        && (newNotif.type === NotificationType.LIKE_POST || newNotif.type === NotificationType.LIKE_COMMENT))
        return;

      setUnreadCount((prev) => prev + 1);

      // Show toast if not silent
      if (!newNotif.isSilent) {
        const actorName = newNotif.actor?.fullName || newNotif.actor?.username;
        const countText = newNotif.actorCount && newNotif.actorCount > 1
          ? ` và ${newNotif.actorCount - 1} người khác`
          : "";

        toast.success(`${actorName}${countText} ${getNotificationText(newNotif)}`, {
          position: "bottom-right",
        });
      }
    } catch (error) {
      console.error("Error parsing notification message:", error);
    }
  }, []);

  const getNotificationText = (notif: Notification) => {
    switch (notif.type) {
      case NotificationType.FRIEND_REQUEST: return "has sent you a friend request";
      case NotificationType.FRIEND_ACCEPT: return "has accepted your friend request";
      case NotificationType.LIKE_POST: return "has liked your post";
      case NotificationType.LIKE_COMMENT: return "has liked your comment";
      case NotificationType.COMMENT_POST: return "has commented on your post";
      case NotificationType.REPLY_COMMENT: return "has replied to your comment";
      default: return "has a new notification for you";
    }
  };

  // Setup WebSocket connection via shared SocketContext
  useEffect(() => {
    if (!isAuthenticated || !user || !connected) return;

    const notifSub = subscribe(`/user/queue/notifications`, (message) => {
      handleMessage(message as any);
    });

    const statusSub = subscribe(`/topic/user-status-${user.id}`, (message) => {
      if (message.body === "BANNED") {
        toast.error("Your account has been banned by the system, you can't access it anymore!", { duration: 6000, position: "top-center" });
        if (logout) {
          logout();
          window.location.href = "/login";
        }
      }
    });

    return () => {
      notifSub?.unsubscribe();
      statusSub?.unsubscribe();
    };
  }, [isAuthenticated, user, connected, subscribe, handleMessage, logout]);

  const markAsRead = async (id: string | number) => {
    try {
      await notificationApi.markAsRead(String(id));
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotify: fetchInitialDataNotify,
    refreshUnreadCount: fetchUnreadCount
  };
}
