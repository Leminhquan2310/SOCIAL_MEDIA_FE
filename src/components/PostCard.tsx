import React, { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, X, Globe, Users, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Post } from "../../types";
import { Privacy } from "../../types";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import PostCarousel from "./post/PostCarousel";
import DOMPurify from "dompurify";
import CommentSection from "./comment/CommentSection";
import { useLikes } from "../hooks/useLikes";
interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  highlightCommentId?: string;
  ancestorIds?: string;
  isSinglePost?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, onEdit, onDelete, highlightCommentId, ancestorIds, isSinglePost }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(!!highlightCommentId);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const postRef = React.useRef<HTMLDivElement>(null);

  // Scroll to post if it's a single post view and no specific comment is targeted
  React.useEffect(() => {
    if (isSinglePost && !highlightCommentId && postRef.current) {
      postRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      postRef.current.classList.add("animate-highlight");
    }
  }, [isSinglePost, highlightCommentId]);

  // Open comments if highlightCommentId changes
  React.useEffect(() => {
    if (highlightCommentId) {
      setShowComments(true);
    }
  }, [highlightCommentId]);

  // Use optimistic like hook
  const { likeCount, isLiked, toggleLike } = useLikes(post.id, "POST", post.likeCount || 0, post.isLiked);

  const openImageModal = (url: string) => {
    setSelectedImageUrl(url);
    setIsImageModalOpen(true);
  };

  const getPrivacyIcon = (privacy: Privacy) => {
    switch (privacy) {
      case Privacy.PUBLIC:
        return <Globe size={12} className="text-gray-400" />;
      case Privacy.FRIEND_ONLY:
        return <Users size={12} className="text-gray-400" />;
      case Privacy.ONLY_ME:
        return <Lock size={12} className="text-gray-400" />;
      default:
        return null;
    }
  };

  const isAuthor = user?.id?.toString() === post.author?.id?.toString();

  return (
    <div ref={postRef} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 transition-all hover:shadow-md hover:border-gray-200">
      {/* Header */}
      <div className="p-3.5 flex items-center justify-between relative">
        <Link to={`/u/${post.author?.username}`} className="flex items-center gap-2.5 group">
          <img
            src={post.author.avatarUrl || post.author.avatar}
            alt={post.author.fullName || post.author.name}
            className="w-10 h-10 rounded-full object-cover group-hover:opacity-80 transition-opacity ring-1 ring-gray-100 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-bold text-[14px] text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                {post.author.fullName || post.author.name}
              </h4>
              {post.feeling && (
                <span className="text-[13px] text-gray-500 font-normal">
                  đang cảm thấy <span className="font-semibold text-gray-700">{post.feeling}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-[11.5px] text-gray-400">
                {formatDistanceToNow(new Date(post.createdAt))} trước
              </p>
              <span className="text-gray-300 text-[10px]">•</span>
              {getPrivacyIcon(post.privacy)}
            </div>
          </div>
        </Link>

        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <MoreHorizontal size={20} />
          </button>

          {showOptions && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 z-20 animate-fade-in">
                {isAuthor ? (
                  <>
                    <button
                      onClick={() => { onEdit?.(post); setShowOptions(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-[13.5px] font-bold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Sửa bài viết
                    </button>
                    <button
                      onClick={() => { onDelete?.(post.id); setShowOptions(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-[13.5px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      Xóa bài viết
                    </button>
                  </>
                ) : (
                  <button className="flex items-center gap-2 w-full px-3 py-2 text-[13.5px] font-bold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    Báo cáo vi phạm
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <div
          className="text-gray-800 text-[15px] leading-relaxed post-content"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />
      </div>

      {/* Multi-image Carousel */}
      {post.images && post.images.length > 0 && (
        <PostCarousel images={post.images} onImageClick={openImageModal} />
      )}

      {/* Actions */}
      <div className="px-4 py-1.5 border-t border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all active:scale-95 ${isLiked ? "text-rose-500 bg-rose-50" : "text-gray-500 hover:bg-gray-50"
              }`}
          >
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
            <span className="font-bold text-[13.5px]">{likeCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${showComments ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:bg-gray-50"
              }`}
          >
            <MessageCircle size={20} />
            <span className="font-bold text-[13.5px]">{post.commentCount}</span>
          </button>

          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-all">
            <Share2 size={20} />
            <span className="font-bold text-[13.5px]">Chia sẻ</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <CommentSection
          postId={post.id}
          postOwnerId={post.author?.id}
          highlightId={highlightCommentId}
          ancestorIds={ancestorIds}
        />
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
            src={selectedImageUrl}
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
