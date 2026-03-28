import { useState, useEffect, useCallback } from "react";
import { friendApi } from "../utils/apiClient";
import { toast } from "react-hot-toast";
import { FriendStatusDTO, FriendshipStatus } from "../../types";
import { useAuth } from "../contexts/AuthContext";

interface UseFriendshipReturn {
  status: FriendshipStatus;
  isLoading: boolean;
  sendRequest: () => Promise<void>;
  cancelRequest: () => Promise<void>;
  acceptRequest: () => Promise<void>;
  declineRequest: () => Promise<void>;
  removeFriend: () => Promise<void>;
}

export function useFriendship(targetUserId: string | number): UseFriendshipReturn {
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<FriendshipStatus>("LOADING");
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!isAuthenticated) {
      setStatus("NONE");
      return;
    }
    try {
      const res = await friendApi.getRelationshipStatus(String(targetUserId));
      const statusData = res.data;
      setStatus((statusData.status as FriendshipStatus) || "NONE");
    } catch {
      setStatus("NONE");
    }
  }, [targetUserId, isAuthenticated]);

  useEffect(() => {
    if (targetUserId) {
      fetchStatus();
    }
  }, [fetchStatus, targetUserId]);

  const withLoading = async (fn: () => Promise<any>, optimisticStatus?: FriendshipStatus) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thực hiện tính năng này");
      return;
    }
    const previousStatus = status;
    setIsLoading(true);
    if (optimisticStatus) setStatus(optimisticStatus);
    try {
      await fn();
      await fetchStatus();
    } catch (error: any) {
      setStatus(previousStatus);
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  const sendRequest = () =>
    withLoading(
      () => friendApi.sendRequest(String(targetUserId)),
      "PENDING_SENT"
    );

  const cancelRequest = () =>
    withLoading(
      () => friendApi.cancelRequest(String(targetUserId)),
      "NONE"
    );

  const acceptRequest = () =>
    withLoading(
      () => friendApi.acceptRequest(String(targetUserId)),
      "ACCEPTED"
    );

  const declineRequest = () =>
    withLoading(
      () => friendApi.declineRequest(String(targetUserId)),
      "NONE"
    );

  const removeFriend = () =>
    withLoading(
      () => friendApi.removeFriend(String(targetUserId)),
      "NONE"
    );

  return {
    status,
    isLoading,
    sendRequest,
    cancelRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
  };
}
