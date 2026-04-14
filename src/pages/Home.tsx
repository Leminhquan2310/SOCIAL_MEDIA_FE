import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import { Post } from "../../types";
import { postApi } from "../utils/apiClient";
import EditPostModal from "../components/post/EditPostModal";
import DeletePostModal from "../components/post/DeletePostModal";

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Management state
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await postApi.getNewsFeed();
      setPosts(response as Post[]);
    } catch (error) {
      console.error("Failed to fetch feed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostCreated = (post: Post) => {
    setPosts([post, ...posts]);
  };



  const handleDeleteConfirm = async () => {
    if (!deletingPostId) return;

    setIsDeleting(true);
    try {
      await postApi.deletePost(deletingPostId);
      setPosts(prev => prev.filter(p => p.id !== deletingPostId));
      toast.success("Delete post successfully!");
      setDeletingPostId(null);
    } catch (error: any) {
      console.error("Failed to delete post:", error);
      toast.error(error.message || "Delete post failed!");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePostUpdated = (updatedPost: Post) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl h-64 animate-pulse shadow-sm border border-gray-100"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <CreatePost onPostCreated={handlePostCreated} />

      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onEdit={setEditingPost}
            onDelete={setDeletingPostId}
          />
        ))}
      </div>

      <div className="text-center py-10">
        <button
          onClick={fetchPosts}
          className="px-8 py-2.5 bg-white text-blue-600 font-bold text-sm rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all border border-blue-50 active:scale-95"
        >
          Refresh Feed
        </button>
      </div>

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

export default Home;
