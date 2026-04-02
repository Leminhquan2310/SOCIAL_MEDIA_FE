import React, { useState } from "react";
import { useComments } from "../../hooks/useComments";
import CommentItem from "./CommentItem";
import CommentInput from "./CommentInput";
import { Loader2 } from "lucide-react";
import { commentApi } from "../../utils/apiClient";

interface CommentSectionProps {
  postId: string | number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const {
    comments,
    totalComments,
    hasMore,
    isLoading,
    fetchNextPage,
    loadReplies,
    addCommentToLocalState,
    removeCommentFromLocalState,
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
    if (!window.confirm("Bạn có chắc muốn xoá bình luận này?")) return;
    try {
      await commentApi.deleteComment(String(commentId));
      removeCommentFromLocalState(commentId);
    } catch (error) {
      console.error("Xoá bình luận thất bại", error);
      alert("Có lỗi xảy ra khi xoá bình luận");
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
            onLoadReplies={loadReplies}
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
