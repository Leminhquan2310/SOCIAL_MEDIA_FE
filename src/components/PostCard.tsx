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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 transition-all hover:shadow-md">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <a href={`#/profile/${post.userId}`} className="flex items-center gap-3 group">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover group-hover:opacity-80 transition-opacity"
          />
          <div>
            <h4 className="font-semibold text-gray-900 leading-tight group-hover:underline group-hover:text-blue-600 transition-colors">
              {post.author.name}
            </h4>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt))} ago
            </p>
          </div>
        </a>
        <button className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content}</p>
      </div>

      {post.image && (
        <div
          className="relative group cursor-pointer overflow-hidden"
          onClick={() => setIsImageModalOpen(true)}
        >
          <img
            src={post.image}
            alt="post content"
            className="w-full max-h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white">
              <Maximize2 size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2 border-t border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all active:scale-90 ${
              post.isLiked ? "text-rose-500 bg-rose-50" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Heart size={20} fill={post.isLiked ? "currentColor" : "none"} />
            <span className="font-medium text-sm">{post.likes}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              showComments ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <MessageCircle size={20} />
            <span className="font-medium text-sm">{post.commentCount}</span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-all">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-50 bg-gray-50/30 animate-slide-down">
          <div className="space-y-4 mb-4">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 animate-fade-in">
                <a href={`#/profile/${comment.userId}`} className="shrink-0">
                  <img
                    src={comment.userAvatar}
                    className="w-8 h-8 rounded-full border border-gray-100 shadow-sm"
                    alt=""
                  />
                </a>
                <div className="flex-1 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-1">
                    <a
                      href={`#/profile/${comment.userId}`}
                      className="font-bold text-xs text-gray-900 hover:underline"
                    >
                      {comment.userName}
                    </a>
                    <span className="text-[10px] text-gray-400">
                      {formatDistanceToNow(new Date(comment.createdAt))}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              </div>
            ))}
            {post.comments.length === 0 && (
              <p className="text-center py-4 text-sm text-gray-400">
                No comments yet. Be the first to reply!
              </p>
            )}
          </div>

          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <img src={user?.avatar} className="w-8 h-8 rounded-full shadow-sm" alt="" />
            <div className="relative flex-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-10 shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 top-1.5 p-1 text-blue-500 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
                disabled={!commentText.trim()}
              >
                <Send size={16} />
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
