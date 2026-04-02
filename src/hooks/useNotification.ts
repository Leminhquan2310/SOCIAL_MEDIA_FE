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

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    try {
      const [notifsRes, countRes] = await Promise.all([
        notificationApi.getNotifications({ size: 20 }),
        notificationApi.getUnreadCount(),
      ]);

      // Use data from ApiResponse
      if (notifsRes && notifsRes.data) {
        setNotifications(notifsRes.data.content || []);
      }

      if (countRes) {
        setUnreadCount(countRes.data || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Handle incoming message
  const handleMessage = useCallback((message: IMessage) => {
    if (import.meta.env.DEV) console.log("Received WebSocket Message:", message.body);
    try {
      const newNotif: Notification = JSON.parse(message.body);
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast if not silent
      if (!newNotif.isSilent) {
        toast.success(`${newNotif.actor.fullName || newNotif.actor.username} ${getNotificationText(newNotif.type)}`, {
          position: "bottom-right",
        });
      }
    } catch (error) {
      console.error("Error parsing notification message:", error);
    }
  }, []);

  const getNotificationText = (type: NotificationType) => {
    switch (type) {
      case NotificationType.FRIEND_REQUEST: return "đã gửi lời mời kết bạn";
      case NotificationType.FRIEND_ACCEPT: return "đã chấp nhận lời mời kết bạn";
      case NotificationType.LIKE_POST: return "đã thích bài viết của bạn";
      case NotificationType.COMMENT_POST: return "đã bình luận bài viết của bạn";
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
    refresh: fetchInitialData
  };
}
