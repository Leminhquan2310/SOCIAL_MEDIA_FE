import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import { Post } from "../../types";
import { postApi } from "../utils/apiClient";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import EditPostModal from "../components/post/EditPostModal";
import DeletePostModal from "../components/post/DeletePostModal";

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [searchParams] = useSearchParams();
  const commentId = searchParams.get("commentId");
  const ancestors = searchParams.get("ancestors");
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchPost(postId);
    }
  }, [postId]);

  const fetchPost = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await postApi.getPost(id);
      setPost(response as Post);
    } catch (error) {
      console.error("Failed to fetch post:", error);
      toast.error("Không thể tải bài viết!");
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostUpdated = (updatedPost: Post) => {
    setPost(updatedPost);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPostId) return;
    setIsDeleting(true);
    try {
      await postApi.deletePost(deletingPostId);
      toast.success("Xóa bài viết thành công!");
      navigate("/");
    } catch (error: any) {
      console.error("Failed to delete post:", error);
      toast.error(error.message || "Xóa bài viết thất bại!");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-32 bg-gray-200 rounded-lg mb-6"></div>
        <div className="bg-white rounded-xl h-96 shadow-sm border border-gray-100"></div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium mb-2"
      >
        <ArrowLeft size={20} />
        Quay lại
      </button>

      <PostCard
        post={post}
        onEdit={setEditingPost}
        onDelete={setDeletingPostId}
        highlightCommentId={commentId || undefined}
        ancestorIds={ancestors || undefined}
        isSinglePost={true}
      />

      {/* Modals */}
      {editingPost && (
        <EditPostModal
          isOpen={!!editingPost}
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onUpdated={handlePostUpdated}
        />
      )}

      <DeletePostModal
        isOpen={!!deletingPostId}
        isDeleting={isDeleting}
        onClose={() => setDeletingPostId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default PostDetail;
