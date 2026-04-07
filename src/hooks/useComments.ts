import { useState, useCallback, useEffect } from "react";
import { commentApi } from "../utils/apiClient";
import { Comment } from "../../types";

export function useComments(postId: string | number) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalComments, setTotalComments] = useState<number>(0);

  const limit = 5; // Paginate size from Backend PageableDefault

  const fetchComments = useCallback(async (pageNumber = 0, isReset = false) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await commentApi.getCommentsByPost(String(postId), {
        page: pageNumber,
        size: limit,
        sort: "createdAt,desc"
      });

      const { content, totalElements, totalPages, number } = response.data;

      if (isReset) {
        setComments(content);
      } else {
        // Only append to the list
        setComments((prev) => [...prev, ...content]);
      }

      setPage(number);
      setTotalComments(totalElements);
      setHasMore(number < totalPages - 1);
    } catch (error) {
      console.error("Lỗi khi tải bình luận:", error);
    } finally {
      setIsLoading(false);
    }
  }, [postId, isLoading, limit]);

  useEffect(() => {
    // Initial fetch when postId changes
    fetchComments(0, true);
  }, [postId]);

  const fetchNextPage = () => {
    if (hasMore && !isLoading) {
      fetchComments(page + 1);
    }
  };

  const loadReplies = async (commentId: string | number) => {
    try {
      const resp = await commentApi.getReplies(String(commentId));
      return resp.data;
    } catch (e) {
      console.error("Lỗi fetch replies:", e);
      return [];
    }
  };

  const addCommentToLocalState = (newComment: Comment) => {
    setComments((prev) => [newComment, ...prev]);
    setTotalComments((p) => p + 1);
  };

  const removeCommentFromLocalState = (commentId: string | number) => {
    setComments((prev) => {
      const isRoot = prev.some((c) => c.id === commentId);
      if (isRoot) {
        setTotalComments((p) => Math.max(0, p - 1));
        return prev.filter((c) => c.id !== commentId);
      }
      return prev;
    });
  };

  const updateCommentInLocalState = (updatedComment: Comment) => {
    setComments((prev) => prev.map((c) => (c.id === updatedComment.id ? updatedComment : c)));
  };

  return {
    comments,
    totalComments,
    hasMore,
    isLoading,
    fetchNextPage,
    loadReplies,
    addCommentToLocalState,
    removeCommentFromLocalState,
    updateCommentInLocalState,
  };
}
