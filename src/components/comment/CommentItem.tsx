import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronsRight, Heart, MoreHorizontal } from "lucide-react";
import { Comment } from "../../../types";
import { useAuth } from "../../contexts/AuthContext";
import { useLikes } from "../../hooks/useLikes";
import CommentInput from "./CommentInput";
import DOMPurify from "dompurify";

interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
  onReply?: (content: string, imageFile?: File, parentId?: number) => Promise<Comment | void>;
  onEdit?: (commentId: number, content: string, imageFile?: File) => Promise<Comment | void>;
  onDelete?: (commentId: number) => Promise<void>;
  onLoadReplies?: (commentId: number) => Promise<Comment[]>; // Loads replies from backend
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, isReply = false, onReply, onEdit, onDelete, onLoadReplies }) => {
  const { user } = useAuth();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);


  // Replies State
  const [replies, setReplies] = useState<Comment[]>([]);
  const [isRepliesLoaded, setIsRepliesLoaded] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  // Optimistic Like logic using hook
  const { likeCount, isLiked, toggleLike } = useLikes(comment.id, "COMMENT", comment.likeCount, comment.liked);

  const isAuthor = user?.id?.toString() === comment.authorId?.toString();

  const handleReplySubmit = async (content: string, imageFile?: File) => {
    if (onReply) {
      const parentIdToSend = comment.id; // Luôn reply trực tiếp cho comment này
      const newReply = await onReply(content, imageFile, parentIdToSend);
      setShowReplyInput(false);

      if (newReply) {
        setReplies((prev) => [...prev, newReply]);
        setIsRepliesLoaded(true);
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

  return (
    <div className={`flex justify-between gap-2.5 animate-fade-in ${isReply ? "mt-3" : "mt-0"}`}>
      <Link to={`/u/${comment.authorId}`} className="shrink-0 mt-1">
        <img
          src={comment.authorAvatar || `https://ui-avatars.com/api/?name=${comment.authorName}`}
          className={`${isReply ? "w-6 h-6" : "w-8 h-8"} rounded-full border border-gray-100 shadow-sm object-cover`}
          alt={comment.authorName}
        />
      </Link>

      <div className="flex-1 max-w-[calc(100%-2.5rem)]">

        {/* Bubble row + Heart */}
        <div className="flex items-end justify-between gap-2">

          {/* Comment Bubble (inline-block, chỉ rộng vừa nội dung) */}
          <div className="relative group inline-block max-w-[90%]">
            <div className="flex flex-col bg-gray-100/80 px-3 py-2 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center">
                <Link
                  to={`/u/${comment.authorId}`}
                  className="font-bold text-[13px] text-gray-500 hover:underline inline-block mr-1"
                >
                  {comment.authorName}
                </Link>

                {isReply && comment.parentCommentName != null ?
                  <>
                    <ChevronsRight size={12} color="#03befc" />
                    <Link to={`/u/${comment.parentCommentId}`} className="font-bold text-[13px] text-gray-500 hover:underline ml-1">
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

            {/* Options Menu Button (...) */}
            {(isAuthor || onDelete) && (
              <div className="absolute top-1/2 -translate-y-1/2 -right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full"
                >
                  <MoreHorizontal size={16} />
                </button>
                {showOptionsMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowOptionsMenu(false)} />
                    <div className="absolute left-0 top-full mt-1 w-32 bg-white border border-gray-100 rounded-lg shadow-xl py-1 z-20">
                      {isAuthor && onEdit && (
                        <button className="w-full text-left px-3 py-1.5 text-[13px] hover:bg-gray-50">Chỉnh sửa</button>
                      )}
                      {(isAuthor || onDelete) && (
                        <button
                          onClick={() => { onDelete?.(comment.id); setShowOptionsMenu(false); }}
                          className="w-full text-left px-3 py-1.5 text-[13px] text-red-600 hover:bg-red-50"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Heart icon + count, sát lề phải, khoảng trắng tự dãn */}
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

        {/* Input box for Reply */}
        {showReplyInput && (
          <div className="mt-2 ml-2">
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
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default CommentItem;
