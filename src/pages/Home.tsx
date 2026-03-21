import React, { useState, useEffect } from "react";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import { Post, Comment } from "../../types";
import { MOCK_POSTS, MOCK_USER } from "../../constants";

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    setTimeout(() => {
      setPosts(MOCK_POSTS);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handlePostCreated = (content: string, imageUrl?: string) => {
    const newPost: Post = {
      id: "p-" + Date.now(),
      userId: MOCK_USER.id,
      author: MOCK_USER,
      content,
      image: imageUrl,
      likes: 0,
      isLiked: false,
      commentCount: 0,
      comments: [],
      createdAt: new Date().toISOString(),
    };
    setPosts([newPost, ...posts]);
  };

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            likes: p.isLiked ? p.likes - 1 : p.likes + 1,
            isLiked: !p.isLiked,
          };
        }
        return p;
      }),
    );
  };

  const handleAddComment = (postId: string, content: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newComment: Comment = {
            id: "c-" + Date.now(),
            userId: MOCK_USER.id,
            userName: MOCK_USER.name,
            userAvatar: MOCK_USER.avatar,
            content,
            createdAt: new Date().toISOString(),
            likes: 0,
          };
          return {
            ...p,
            comments: [...p.comments, newComment],
            commentCount: p.commentCount + 1,
          };
        }
        return p;
      }),
    );
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
          <PostCard key={post.id} post={post} onLike={handleLike} onAddComment={handleAddComment} />
        ))}
      </div>

      <div className="text-center py-10">
        <button className="px-8 py-2.5 bg-white text-blue-600 font-bold text-sm rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all border border-blue-50 active:scale-95">
          Xem thêm bài viết
        </button>
      </div>
    </div>
  );
};

export default Home;
