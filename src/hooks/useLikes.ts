import { useState, useCallback, useEffect } from "react";
import { likeApi } from "../utils/apiClient";
import { toast } from "react-hot-toast";

type TargetType = "POST" | "COMMENT";

export function useLikes(
  targetId: string | number,
  targetType: TargetType,
  initialLikeCount: number = 0,
  initialIsLiked: boolean = false
) {
  const [likeCount, setLikeCount] = useState<number>(initialLikeCount);
  const [isLiked, setIsLiked] = useState<boolean>(initialIsLiked);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync initial state if it changes from props
  useEffect(() => {
    setLikeCount(initialLikeCount);
    setIsLiked(initialIsLiked);
  }, [initialLikeCount, initialIsLiked]);

  const toggleLike = useCallback(async () => {
    if (isLoading) return;

    // Optimistic Logic
    const previousLikeCount = likeCount;
    const previousIsLiked = isLiked;

    setIsLiked(!previousIsLiked);
    setLikeCount((prev) => (previousIsLiked ? Math.max(0, prev - 1) : prev + 1));
    setIsLoading(true);

    try {
      await likeApi.toggleLike(targetId, targetType);
    } catch (error) {
      // Revert if failed
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
      toast.error("Không thể thay đổi cảm xúc. Thử lại sau.", { position: "bottom-right" });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, targetId, targetType, likeCount, isLiked]);

  return {
    likeCount,
    isLiked,
    toggleLike,
    isLoading,
  };
}
