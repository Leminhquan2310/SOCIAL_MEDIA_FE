import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronsRight, Heart, MoreHorizontal } from "lucide-react";
import { Comment } from "../../../types";
import { useAuth } from "../../contexts/AuthContext";
import { useLikes } from "../../hooks/useLikes";
import CommentInput from "./CommentInput";
import DOMPurify from "dompurify";
import DeleteCommentModal from "./DeleteCommentModal";

interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
  onReplySuccess?: (newReply: Comment) => void;
  onReply?: (content: string, imageFile?: File, parentId?: number) => Promise<Comment | void>;
  onEdit?: (commentId: number, content: string, imageFile?: File) => Promise<Comment | void>;
  onEditSuccess?: (updatedComment: Comment) => void;
  onDelete?: (commentId: number) => Promise<void>;
  onDeleteSuccess?: (commentId: number) => void;
  onLoadReplies?: (commentId: number) => Promise<Comment[]>; // Loads replies from backend
  postOwnerId?: string | number;
  highlightId?: string | number;
  ancestorIds?: string;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, isReply = false, onReply, onReplySuccess, onDelete, onDeleteSuccess, onEdit, onEditSuccess, onLoadReplies, postOwnerId, highlightId, ancestorIds }) => {
  const { user } = useAuth();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const commentRef = React.useRef<HTMLDivElement>(null);

  // Scroll to comment if highlighted
  useEffect(() => {
    if (highlightId && comment.id.toString() === highlightId.toString() && commentRef.current) {
      commentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      commentRef.current.classList.add("animate-highlight");
    }
  }, [highlightId, comment.id]);


  // Replies State
  const [replies, setReplies] = useState<Comment[]>([]);
  const [isRepliesLoaded, setIsRepliesLoaded] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  // Auto-expand replies if this is an ancestor of a highlighted reply
  useEffect(() => {
    if (ancestorIds && highlightId && highlightId.toString() !== comment.id.toString() &&
      !isRepliesLoaded && comment.replyCount > 0) {
      const ancestorsArray = ancestorIds.split(",");
      if (ancestorsArray.includes(comment.id.toString())) {
        handleLoadReplies();
      }
    }
  }, [ancestorIds, highlightId, comment.id, isRepliesLoaded]);

  // Optimistic Like logic using hook
  const { likeCount, isLiked, toggleLike } = useLikes(comment.id, "COMMENT", comment.likeCount, comment.liked);

  const isAuthor = user?.id?.toString() === comment.authorId?.toString();
  const isPostOwner = user?.id?.toString() === postOwnerId?.toString();
  const canDelete = isAuthor || isPostOwner;

  const handleReplySubmit = async (content: string, imageFile?: File) => {
    if (onReply) {
      const parentIdToSend = comment.id; // Luôn reply trực tiếp cho comment này
      const newReply = await onReply(content, imageFile, parentIdToSend);
      setShowReplyInput(false);

      if (newReply) {
        if (!isReply) {
          setReplies((prev) => [...prev, newReply]);
          setIsRepliesLoaded(true);
        } else if (onReplySuccess) {
          onReplySuccess(newReply);
        }
      }

      // Auto open replies if not loaded
      if (!isRepliesLoaded && onLoadReplies && !isReply) {
        handleLoadReplies();
      }
    }
  };

  const handleLoadReplies = async () => {
    if (!onLoadReplies || isRepliesLoaded || isLoadingReplies) return;
    setIsLoadingReplies(true);
    try {
      const data = await onLoadReplies(comment.id);
      setReplies(data);
      setIsRepliesLoaded(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const handleDeleteClick = () => {
    setShowOptionsMenu(false);
    setShowDeleteModal(true);
  };

  const handleEditClick = () => {
    setShowOptionsMenu(false);
    setIsEditing(true);
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) return;
    setIsDeletingComment(true);
    try {
      await onDelete(comment.id);
      onDeleteSuccess?.(comment.id);
      setShowDeleteModal(false);
    } catch (e) {
      console.error("Failed to delete comment:", e);
    } finally {
      setIsDeletingComment(false);
    }
  };

  return (
    <div className={`flex justify-between gap-2.5 animate-fade-in ${isReply ? "mt-3" : "mt-0"}`}>
      <Link to={`/u/${comment.authorUsername}`} className="shrink-0 mt-1">
        <img
          src={comment.authorAvatar || `https://ui-avatars.com/api/?name=${comment.authorName}`}
          className={`${isReply ? "w-6 h-6" : "w-8 h-8"} rounded-full border border-gray-100 shadow-sm object-cover`}
          alt={comment.authorName}
        />
      </Link>

      <div className="flex-1 max-w-[calc(100%-2.5rem)]">

        {/* Bubble row + Heart */}
        <div className="flex items-end justify-between gap-2">

          {/* Comment Bubble or Edit Input */}
          <div ref={commentRef} className={`relative group inline-block ${isEditing ? "w-full" : "max-w-[90%]"}`}>
            {isEditing ? (
              <div className="mt-1 w-full bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
                <CommentInput
                  autoFocus
                  initialContent={comment.content}
                  showImageUpload={false}
                  onCancel={() => setIsEditing(false)}
                  onSubmit={async (content) => {
                    if (onEdit) {
                      const updated = await onEdit(comment.id, content);
                      if (updated && isReply && onEditSuccess) {
                        onEditSuccess(updated);
                      }
                      setIsEditing(false);
                    }
                  }}
                  placeholder="Chỉnh sửa bình luận..."
                />
              </div>
            ) : (
              <>
                <div className="flex flex-col bg-gray-100/80 px-3 py-2 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <Link
                      to={`/u/${comment.authorUsername}`}
                      className="font-bold text-[13px] text-gray-500 hover:underline inline-block mr-1"
                    >
                      {comment.authorName}
                    </Link>
                    {comment.edited && (
                      <span className="text-[11px] text-gray-400 font-normal mr-1 ml-1" title="Đã chỉnh sửa">
                        (Đã chỉnh sửa)
                      </span>
                    )}

                    {isReply && comment.parentCommentName != null && comment.authorName !== comment.parentCommentName ?
                      <>
                        <ChevronsRight size={12} color="#03befc" className="mx-1" />
                        <Link to={`/u/${comment.parentCommentUsername}`} className="font-bold text-[13px] text-gray-500 hover:underline">
                          {comment.parentCommentName}
                        </Link>
                      </>
                      : ""}
                  </div>

                  <span
                    className="text-[14px] text-gray-800 break-words leading-snug"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.content) }}
                  />
                </div>

                {/* Render Attached Image */}
                {comment.imageUrl && (
                  <div className="mt-1">
                    <img
                      src={comment.imageUrl}
                      alt="Attachment"
                      className="max-h-48 rounded-xl object-contain border border-gray-200"
                    />
                  </div>
                )}

                {/* Options Menu Button (...) - Hiện khi hover hoặc khi menu đang mở */}
                {(isAuthor || canDelete) && (
                  <div className={`absolute top-1/2 -translate-y-1/2 -right-8 transition-opacity ${showOptionsMenu ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                    <button
                      onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                      className={`p-1.5 rounded-full transition-colors ${showOptionsMenu ? "bg-gray-100 text-gray-700" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {showOptionsMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowOptionsMenu(false)} />
                        <div className="absolute left-full top-0 mt-1 ml-1 w-32 bg-white border border-gray-100 rounded-lg shadow-xl py-1 z-20">
                          {isAuthor && onEdit && (
                            <button
                              onClick={handleEditClick}
                              className="w-full text-left px-3 py-1.5 text-[13px] hover:bg-gray-50 font-medium text-gray-700"
                            >
                              Chỉnh sửa
                            </button>
                          )}
                          {canDelete && onDelete && (
                            <button
                              onClick={handleDeleteClick}
                              className="w-full text-left px-3 py-1.5 text-[13px] text-red-600 hover:bg-red-50 font-medium"
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Heart icon + count */}
          <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
            <button
              onClick={toggleLike}
              className={`p-0.5 transition-colors ${isLiked ? "text-rose-600" : "text-gray-400"}`}
            >
              <Heart
                size={18}
                fill={isLiked ? "currentColor" : "none"}
                strokeWidth={2}
              />
            </button>
            {likeCount > 0 && (
              <span className={`text-[11px] font-semibold leading-none ${isLiked ? "text-rose-600" : "text-gray-400"}`}>
                {likeCount}
              </span>
            )}
          </div>

        </div>

        {/* Action Bar (Reply, Time) — bỏ nút Thích vì đã dùng icon */}
        <div className="flex items-center gap-4 mt-1 ml-2 text-[12px] font-semibold text-gray-500">
          <span>{formatDistanceToNow(new Date(comment.createdAt), { locale: vi, addSuffix: true })}</span>

          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="hover:underline transition-colors"
          >
            Phản hồi
          </button>
        </div>

        {/* Input box for Reply - Xóa ml-2 nếu là reply */}
        {showReplyInput && (
          <div className={`mt-2 ${!isReply ? "ml-2" : "ml-0"}`}>
            <CommentInput
              autoFocus
              onCancel={() => setShowReplyInput(false)}
              onSubmit={handleReplySubmit}
              placeholder={`Trả lời ${comment.authorName}...`}
            />
          </div>
        )}

        {/* Sub Replies: Hiển thị đệ quy cho mọi cấp, nhưng chỉ thụt đầu dòng 1 lần duy nhất */}
        <div className={`mt-2 ${!isReply ? "ml-2 pl-4 border-l-2 border-gray-100" : "ml-0"}`}>
          {comment.replyCount > 0 && !isRepliesLoaded && (
            <button
              onClick={handleLoadReplies}
              className="flex items-center gap-2 text-blue-600 text-[13px] font-semibold hover:underline mb-2"
            >
              <span className="w-6 h-0 border-t border-gray-300 inline-block"></span>
              {isLoadingReplies ? "Đang tải..." : `Xem tất cả ${comment.replyCount} phản hồi`}
            </button>
          )}

          {isRepliesLoaded && replies.map(subComment => (
            <CommentItem
              key={subComment.id}
              comment={subComment}
              isReply={true}
              onReply={onReply}
              onDelete={onDelete}
              onEdit={onEdit}
              onEditSuccess={(updated) => setReplies(prev => prev.map(r => r.id === updated.id ? updated : r))}
              onLoadReplies={onLoadReplies}
              onReplySuccess={(newSubReply) => setReplies(prev => [...prev, newSubReply])}
              onDeleteSuccess={(id) => setReplies(prev => prev.filter(r => r.id !== id))}
              postOwnerId={postOwnerId}
              highlightId={highlightId}
              ancestorIds={ancestorIds}
            />
          ))}
        </div>

      </div>

      {/* Modal xác nhận xóa */}
      <DeleteCommentModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingComment}
      />
    </div>
  );
};

export default CommentItem;
