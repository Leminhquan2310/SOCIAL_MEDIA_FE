import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Grid, Users, Loader2 } from "lucide-react";
import { postApi, searchApi } from "../utils/apiClient";
import { Post, FriendUserDTO } from "../../types";
import PostCard from "../components/PostCard";
import EditPostModal from "../components/post/EditPostModal";
import DeletePostModal from "../components/post/DeletePostModal";

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [activeTab, setActiveTab] = useState<"posts" | "users">("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<FriendUserDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);

  // Management state for posts
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (query) {
      if (activeTab === "posts") {
        handleSearchPosts();
      } else {
        setUsers([]);
        setHasMoreUsers(true);
        handleSearchUsers(true);
      }
    }
  }, [query, activeTab]);

  const handleSearchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await postApi.search(query);
      setPosts(response as Post[]);
    } catch (error) {
      console.error("Search posts failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchUsers = async (isNewSearch = false) => {
    if (!query) return;
    
    if (isNewSearch) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const currentUsers = isNewSearch ? [] : users;
      const lastUser = currentUsers.length > 0 ? currentUsers[currentUsers.length - 1] : null;
      
      const params: Record<string, unknown> = { limit: 12 };
      
      if (lastUser && !isNewSearch) {
        params.lastExactMatch = lastUser.exactMatch;
        params.lastMutualCount = lastUser.mutualFriendsCount;
        params.lastId = lastUser.id;
      }
      
      const response: any = await searchApi.searchUsers(query, params);
      const newUsers: FriendUserDTO[] = response.data || [];
      
      if (newUsers.length < 12) {
        setHasMoreUsers(false);
      }
      
      if (isNewSearch) {
        setUsers(newUsers);
      } else {
        setUsers(prev => {
          // Avoid duplicates
          const existingIds = new Set(prev.map(u => u.id));
          const uniqueNewUsers = newUsers.filter(u => !existingIds.has(u.id));
          return [...prev, ...uniqueNewUsers];
        });
      }
    } catch (error) {
      console.error("Search users failed:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const observer = useRef<IntersectionObserver | null>(null);
  const lastUserElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingMore || isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreUsers) {
        handleSearchUsers(false);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, isLoadingMore, hasMoreUsers, query, users]);

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

        {/* Tabs */}
        <div className="flex border-b border-gray-100 -mx-6 px-6">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-2 px-6 py-4 transition-all font-bold text-[12px] uppercase tracking-widest border-b-2 ${activeTab === "posts" ? "text-blue-600 border-blue-600" : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
          >
            <Grid size={16} />
            Posts
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-6 py-4 transition-all font-bold text-[12px] uppercase tracking-widest border-b-2 ${activeTab === "users" ? "text-blue-600 border-blue-600" : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
          >
            <Users size={16} />
            People
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
                  onLike={() => { }}
                  onAddComment={() => { }}
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {users.length > 0 ? (
                users.map((user, index) => {
                  const isLastElement = users.length === index + 1;
                  return (
                    <div 
                      key={user.id} 
                      ref={isLastElement ? lastUserElementRef : null}
                      className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group"
                    >
                      <img src={user.avatarUrl || "https://ui-avatars.com/api/?name=" + user.fullName} alt={user.fullName} className="w-16 h-16 rounded-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <Link to={`/u/${user.username}`} className="font-bold text-gray-900 truncate block hover:text-blue-600 transition-colors">
                          {user.fullName}
                        </Link>
                        <p className="text-xs text-gray-400 truncate">@{user.username}</p>
                        {user.mutualFriendsCount > 0 && (
                          <p className="text-xs text-blue-500 font-medium mt-1 truncate">
                            {user.mutualFriendsCount} bạn chung
                          </p>
                        )}
                      </div>
                      <Link
                        to={`/u/${user.username}`}
                        className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
                      >
                        Xem
                      </Link>
                    </div>
                  );
                })
              ) : (
                !isLoading && (
                  <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-bold">Không tìm thấy người dùng nào.</p>
                  </div>
                )
              )}
            </div>
            
            {/* Loading More Indicator */}
            {isLoadingMore && (
              <div className="flex justify-center py-4">
                <Loader2 size={24} className="animate-spin text-blue-500" />
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
