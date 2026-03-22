import React, { useState, useEffect } from "react";
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

  const handleLike = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic update
    const wasLiked = post.isLiked;
    setPosts(prev => prev.map(p => 
      p.id === postId ? {
        ...p,
        isLiked: !wasLiked,
        likes: wasLiked ? p.likes - 1 : p.likes + 1
      } : p
    ));

    try {
      if (wasLiked) {
        await postApi.unlikePost(postId);
      } else {
        await postApi.likePost(postId);
      }
    } catch (error) {
      // Revert if failed
      setPosts(prev => prev.map(p => 
        p.id === postId ? post : p
      ));
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    try {
      const response = await postApi.addComment(postId, { content });
      // Assuming response contains the updated post or we can just refetch/locally update
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          // Find if comment already added or just add it (usually API returns updated Post)
          return {
            ...p,
            commentCount: p.commentCount + 1,
            // If we want to show the new comment immediately and API returns it:
            // comments: [...p.comments, response.data] // Assuming response structure
          };
        }
        return p;
      }));
      // For simplicity, refetch or just trust the local count update for now 
      // depends on if API returns the full post.
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPostId) return;
    
    setIsDeleting(true);
    try {
      await postApi.deletePost(deletingPostId);
      setPosts(prev => prev.filter(p => p.id !== deletingPostId));
      setDeletingPostId(null);
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Xóa bài viết thất bại!");
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
            onLike={handleLike} 
            onAddComment={handleAddComment}
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
          Làm mới bảng tin
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
