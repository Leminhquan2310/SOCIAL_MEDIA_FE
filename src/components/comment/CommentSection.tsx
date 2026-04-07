import React, { useState } from "react";
import { useComments } from "../../hooks/useComments";
import CommentItem from "./CommentItem";
import CommentInput from "./CommentInput";
import { Loader2 } from "lucide-react";
import { commentApi } from "../../utils/apiClient";
import toast from "react-hot-toast";

interface CommentSectionProps {
  postId: string | number;
  postOwnerId?: string | number;
  highlightId?: string | number;
  ancestorIds?: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, postOwnerId, highlightId, ancestorIds }) => {
  const {
    comments,
    totalComments,
    hasMore,
    isLoading,
    fetchNextPage,
    loadReplies,
    addCommentToLocalState,
    removeCommentFromLocalState,
    updateCommentInLocalState,
  } = useComments(postId);

  const handleCreateRootComment = async (content: string, image?: File) => {
    try {
      const response = await commentApi.createComment(String(postId), {
        content,
        image,
      });
      if (response && response.data) {
        addCommentToLocalState(response.data);
      }
    } catch (e) {
      console.error("Lỗi khi thêm bình luận", e);
      throw e; // Ném lại để CommentInput dừng loading
    }
  };

  const handleReplyComment = async (content: string, image?: File, parentId?: number) => {
    try {
      const response = await commentApi.createComment(String(postId), {
        content,
        image,
        parentCommentId: parentId,
      });
      return response.data;
    } catch (e) {
      console.error("Lỗi tạo reply", e);
      throw e;
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await commentApi.deleteComment(String(commentId));
      removeCommentFromLocalState(commentId);
      toast.success("Xoá bình luận thành công");
    } catch (error) {
      console.error("Xoá bình luận thất bại", error);
      toast.error("Có lỗi xảy ra khi xoá bình luận");
    }
  };

  const handleEditComment = async (commentId: number, content: string) => {
    try {
      const response = await commentApi.updateComment(String(commentId), { content });
      if (response || response.data) {
        updateCommentInLocalState(response.data);
        toast.success("Chỉnh sửa bình luận thành công");
        return response.data; // Trả về để CommentItem cập nhật cho reply nếu là comment con
      }
    } catch (error) {
      console.error("Sửa bình luận thất bại", error);
      toast.error("Có lỗi xảy ra khi sửa bình luận");
      throw error;
    }
  };

  return (
    <div className="px-4 pb-4 pt-2 border-t border-gray-50 bg-gray-50/20 animate-slide-down">
      <div className="space-y-4 mb-4 mt-2">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={handleReplyComment}
            onDelete={handleDeleteComment}
            onEdit={handleEditComment}
            onLoadReplies={loadReplies}
            postOwnerId={postOwnerId}
            highlightId={highlightId}
            ancestorIds={ancestorIds}
          />
        ))}

        {isLoading && (
          <div className="flex justify-center p-4">
            <Loader2 className="animate-spin text-gray-400" size={24} />
          </div>
        )}

        {!isLoading && hasMore && (
          <div className="text-left mt-2 pl-2">
            <button
              onClick={() => fetchNextPage()}
              className="text-[14px] font-semibold text-gray-600 hover:underline hover:text-blue-600 transition-colors"
            >
              Xem thêm bình luận
            </button>
          </div>
        )}

        {!isLoading && totalComments === 0 && (
          <p className="text-center py-4 text-[13px] text-gray-400">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </p>
        )}
      </div>

      <div className="sticky bottom-0 bg-white pt-2 border-t border-gray-100 z-10 w-[calc(100%+2rem)] -ml-4 px-4 pb-2 shadow-[0_-10px_15px_-5px_rgba(0,0,0,0.05)]">
        <CommentInput onSubmit={handleCreateRootComment} placeholder="Viết bình luận của bạn..." />
      </div>
    </div>
  );
};

export default CommentSection;
