import React, { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, X, Maximize2 } from "lucide-react";
import { Post, Comment } from "../../types";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../contexts/AuthContext";

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onAddComment }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText);
    setCommentText("");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 transition-all hover:shadow-md hover:border-gray-200">
      {/* Header */}
      <div className="p-3.5 flex items-center justify-between">
        <a href={`#/profile/${post.userId}`} className="flex items-center gap-2.5 group">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-9 h-9 rounded-full object-cover group-hover:opacity-80 transition-opacity ring-1 ring-gray-100"
          />
          <div>
            <h4 className="font-bold text-[13.5px] text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
              {post.author.name}
            </h4>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {formatDistanceToNow(new Date(post.createdAt))} trước
            </p>
          </div>
        </a>
        <button className="text-gray-400 hover:bg-gray-50 p-1.5 rounded-full transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-700 text-[14.5px] whitespace-pre-wrap leading-relaxed">{post.content}</p>
      </div>

      {post.image && (
        <div
          className="relative group cursor-pointer overflow-hidden border-y border-gray-50"
          onClick={() => setIsImageModalOpen(true)}
        >
          <img
            src={post.image}
            alt="post content"
            className="w-full max-h-[600px] object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white/30 backdrop-blur-md p-2.5 rounded-full text-white">
              <Maximize2 size={20} />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-1.5 border-t border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all active:scale-95 ${post.isLiked ? "text-rose-500 bg-rose-50" : "text-gray-500 hover:bg-gray-50"
              }`}
          >
            <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} />
            <span className="font-bold text-[13px]">{post.likes}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${showComments ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:bg-gray-50"
              }`}
          >
            <MessageCircle size={18} />
            <span className="font-bold text-[13px]">{post.commentCount}</span>
          </button>

          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-all">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-50 bg-gray-50/20 animate-slide-down">
          <div className="space-y-3 mb-4 mt-2">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex gap-2.5 animate-fade-in">
                <a href={`#/profile/${comment.userId}`} className="shrink-0 mt-1">
                  <img
                    src={comment.userAvatar}
                    className="w-7 h-7 rounded-full border border-gray-100 shadow-sm"
                    alt=""
                  />
                </a>
                <div className="flex-1 bg-white p-2.5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-0.5">
                    <a
                      href={`#/profile/${comment.userId}`}
                      className="font-bold text-[12px] text-gray-900 hover:underline"
                    >
                      {comment.userName}
                    </a>
                    <span className="text-[10px] text-gray-400">
                      {formatDistanceToNow(new Date(comment.createdAt))}
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-700 leading-normal">{comment.content}</p>
                </div>
              </div>
            ))}
            {post.comments.length === 0 && (
              <p className="text-center py-4 text-xs text-gray-400">
                Chưa có bình luận nào. Hãy là người đầu tiên!
              </p>
            )}
          </div>

          <form onSubmit={handleCommentSubmit} className="flex gap-2 mt-2">
            <img src={user?.avatarUrl} className="w-7 h-7 rounded-full shadow-sm" alt="" />
            <div className="relative flex-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Viết bình luận..."
                className="w-full bg-white border border-gray-200 rounded-full px-4 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-10 shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-2 top-1.5 p-1 text-blue-500 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
                disabled={!commentText.trim()}
              >
                <Send size={15} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Image Zoom Modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 animate-fade-in"
          onClick={() => setIsImageModalOpen(false)}
        >
          <button className="absolute top-6 right-6 text-white hover:bg-white/10 p-2 rounded-full transition-all">
            <X size={32} />
          </button>
          <img
            src={post.image}
            alt="zoom"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default PostCard;
