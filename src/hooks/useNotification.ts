import { useState, useEffect, useCallback, useRef } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Notification, NotificationType } from "../../types";
import { useAuth } from "../contexts/AuthContext";
import { notificationApi } from "../utils/apiClient";
import { API_CONFIG } from "../config/apiConfig";
import { toast } from "react-hot-toast";

export function useNotification() {
  const { user, isAuthenticated, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const stompClientRef = useRef<Client | null>(null);

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


  // Handle incoming message
  const handleMessage = useCallback((message: IMessage) => {
    if (import.meta.env.DEV) console.log("Received WebSocket Message:", message.body);
    try {
      const newNotif: Notification = JSON.parse(message.body);
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast if not silent
      if (!newNotif.isSilent) {
        const actorName = newNotif.actor.fullName || newNotif.actor.username;
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
      case NotificationType.FRIEND_REQUEST: return "đã gửi lời mời kết bạn";
      case NotificationType.FRIEND_ACCEPT: return "đã chấp nhận lời mời kết bạn";
      case NotificationType.LIKE_POST: return "đã thích bài viết của bạn";
      case NotificationType.LIKE_COMMENT: return "đã thích bình luận của bạn";
      case NotificationType.COMMENT_POST: return "đã bình luận bài viết của bạn";
      case NotificationType.REPLY_COMMENT: return "đã trả lời bình luận của bạn";
      default: return "có thông báo mới dành cho bạn";
    }
  };

  // Setup WebSocket connection
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socket = new SockJS(API_CONFIG.WS_URL);
    const client = new Client({
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      webSocketFactory: () => socket,
      debug: (msg) => {
        if (import.meta.env.DEV) console.log("STOMP:", msg);
      },
      reconnectDelay: 5000,
      onConnect: () => {
        if (import.meta.env.DEV) console.log("Connected to WebSocket");
        // Subscribe to private queue
        client.subscribe(`/user/queue/notifications`, handleMessage);
      },
      onStompError: (frame) => {
        console.error("STOMP error", frame);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [isAuthenticated, user, handleMessage]);

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
