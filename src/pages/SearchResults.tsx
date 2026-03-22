import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Grid, Users, Loader2 } from "lucide-react";
import { postApi, userApi } from "../utils/apiClient";
import { Post, User } from "../../types";
import PostCard from "../components/PostCard";
import EditPostModal from "../components/post/EditPostModal";
import DeletePostModal from "../components/post/DeletePostModal";

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [activeTab, setActiveTab] = useState<"posts" | "users">("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Management state for posts
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (query) {
      handleSearch();
    }
  }, [query, activeTab]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "posts") {
        const response = await postApi.search(query);
        setPosts(response as Post[]);
      } else {
        // Implement user search if API exists
        // const response = await userApi.search(query);
        // setUsers(response as User[]);
        setUsers([]); // Placeholder
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostUpdated = (updatedPost: Post) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPostId) return;
    setIsDeleting(true);
    try {
      await postApi.deletePost(deletingPostId);
      setPosts(prev => prev.filter(p => p.id !== deletingPostId));
      setDeletingPostId(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Search Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Search size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">Kết quả tìm kiếm</h1>
            <p className="text-gray-500 font-medium">Tìm thấy kết quả cho "{query}"</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 -mx-6 px-6">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-2 px-6 py-4 transition-all font-bold text-[12px] uppercase tracking-widest border-b-2 ${
              activeTab === "posts" ? "text-blue-600 border-blue-600" : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            <Grid size={16} />
            Bài viết
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-6 py-4 transition-all font-bold text-[12px] uppercase tracking-widest border-b-2 ${
              activeTab === "users" ? "text-blue-600 border-blue-600" : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            <Users size={16} />
            Mọi người
          </button>
        </div>
      </div>

      {/* Results Content */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <Loader2 size={48} className="animate-spin text-blue-500" />
            <p className="font-bold">Đang tìm kiếm...</p>
          </div>
        ) : activeTab === "posts" ? (
          <div className="space-y-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onLike={() => {}} 
                  onAddComment={() => {}}
                  onEdit={setEditingPost}
                  onDelete={setDeletingPostId} 
                />
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <Grid size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-bold">Không tìm thấy bài viết nào.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {users.length > 0 ? (
              users.map((user) => (
                <div key={user.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group">
                  <img src={user.avatarUrl} className="w-16 h-16 rounded-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{user.fullName}</h4>
                    <p className="text-xs text-gray-400">@{user.username}</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors">
                    Xem hồ sơ
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-bold">Không tìm thấy người dùng nào.</p>
              </div>
            )}
          </div>
        )}
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

export default SearchResults;
