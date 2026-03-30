import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import {
  Camera,
  Edit3,
  Grid,
  Info,
  Users,
  Image as ImageIcon,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Heart,
  UserPlus,
  MessageCircle,
  Shield,
  Smile,
  User as UserIcon,
  MessageSquare,
  UserX,
} from "lucide-react";
import { User, Post, FriendUserDTO } from "../../types";
import { userApi, postApi, friendApi } from "../utils/apiClient";
import EditProfileModal from "../components/EditProfileModal";
import AvatarCropperModal from "../components/AvatarCropperModal";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import EditPostModal from "../components/post/EditPostModal";
import DeletePostModal from "../components/post/DeletePostModal";
import FriendshipButton from "../components/friend/FriendshipButton";
import MutualFriendsModal from "../components/friend/MutualFriendsModal";
import { FriendCard } from "../components/friend/FriendCard";
import { useFriendship } from "../hooks/useFriendship";

const Profile: React.FC = () => {
  const { userId, username } = useParams<{ userId?: string; username?: string }>();
  const { user: currentUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"posts" | "about" | "friends" | "photos">("about");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMutualModalOpen, setIsMutualModalOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Avatar Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Post States
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  const [friends, setFriends] = useState<FriendUserDTO[]>([]);
  const [isFriendsLoading, setIsFriendsLoading] = useState(false);
  const { status } = useFriendship(profileUser?.id);

  const isOwnProfile = String(profileUser?.id) === String(currentUser?.id);

  const handleAvatarClick = () => {
    if (isOwnProfile) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result as string);
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsUploading(true);
    try {
      const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
      const response: any = await userApi.updateAvatar(file);
      const newAvatarUrl = response?.data || response?.avatarUrl;

      if (profileUser) {
        const updated = { ...profileUser, avatarUrl: newAvatarUrl };
        setProfileUser(updated);
        if (isOwnProfile) {
          updateUser(updated);
        }
      }
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      alert("Tải ảnh lên thất bại. Vui lòng thử lại!");
    } finally {
      setIsUploading(false);
      setIsCropperOpen(false);
      setTempImage(null);
    }
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setProfileUser(updatedUser);
    if (String(updatedUser.id) === String(currentUser?.id)) {
      updateUser(updatedUser);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        if (!userId && !username) {
          setProfileUser(currentUser);
        } else if (userId && String(userId) === String(currentUser?.id)) {
          setProfileUser(currentUser);
        } else if (username && username === currentUser?.username) {
          setProfileUser(currentUser);
        } else {
          let response: any;
          if (username) {
            response = await userApi.getUserByUsername(username);
          } else {
            response = await userApi.getUser(userId!);
          }
          const userData = response?.data || response;
          setProfileUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setProfileUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, username, currentUser]);

  useEffect(() => {
    if (activeTab === "posts" && profileUser) {
      fetchUserPosts();
    }

    if (activeTab === "friends" && profileUser) {
      const isFriend = status === "ACCEPTED";
      if (profileUser.displayFriendsStatus === "ONLY_ME" && !isOwnProfile) {
        return;
      };
      if (profileUser.displayFriendsStatus == "FRIEND_ONLY" && !isOwnProfile && !isFriend) {
        return;
      }

      fetchUserFriends();
    }
  }, [activeTab, profileUser?.id, status]);

  const fetchUserPosts = async () => {
    if (!profileUser) return;
    setIsPostsLoading(true);
    try {
      const response = await postApi.getUserPosts(profileUser.id.toString());
      setPosts(response as Post[]);
    } catch (error) {
      console.error("Failed to fetch user posts:", error);
    } finally {
      setIsPostsLoading(false);
    }
  };

  const handlePostCreated = (post: Post) => {
    setPosts([post, ...posts]);
  };

  const handleLike = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const wasLiked = post.isLiked;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, isLiked: !wasLiked, likes: wasLiked ? p.likes - 1 : p.likes + 1 } : p
      )
    );

    try {
      if (wasLiked) await postApi.unlikePost(postId);
      else await postApi.likePost(postId);
    } catch (error) {
      setPosts((prev) => prev.map((p) => (p.id === postId ? post : p)));
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    try {
      await postApi.addComment(postId, { content });
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p))
      );
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handlePostUpdated = (updatedPost: Post) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPostId) return;
    setIsDeletingPost(true);
    try {
      await postApi.deletePost(deletingPostId);
      setPosts((prev) => prev.filter((p) => p.id !== deletingPostId));
      toast.success("Xóa bài viết thành công!");
      setDeletingPostId(null);
    } catch (error: any) {
      console.error("Failed to delete post:", error);
      toast.error(error.message || "Xóa bài viết thất bại!");
    } finally {
      setIsDeletingPost(false);
    }
  };

  // Friend

  const fetchUserFriends = async () => {
    if (!profileUser) return;
    setIsFriendsLoading(true);
    try {
      const res: any = await friendApi.getFriends(username);
      setFriends(res?.data?.content || res?.content || []);
    } catch (error) {
      console.error("Failed to fetch user posts:", error);
    } finally {
      setIsFriendsLoading(false);
    }
  };

  const handleRemoveFriend = async (id: string | number) => {
    try {
      await friendApi.removeFriend(String(id));
      setFriends((prev) => prev.filter((f) => f.id !== id));
      toast.success("Đã hủy kết bạn");
    } catch (error: any) {
      toast.error(error?.message || "Lỗi");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-64 sm:h-80 bg-gray-200" />
          <div className="px-8 pb-6">
            <div className="flex items-end gap-6 -mt-16 mb-6">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-300 border-4 border-white" />
              <div className="flex-1 space-y-3 mb-2">
                <div className="h-8 bg-gray-200 rounded-lg w-48" />
                <div className="h-4 bg-gray-200 rounded-lg w-32" />
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded-lg w-full mb-4" />
            <div className="flex gap-6">
              <div className="h-6 bg-gray-200 rounded-lg w-24" />
              <div className="h-6 bg-gray-200 rounded-lg w-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
        <UserIcon size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-400">Không tìm thấy người dùng</h2>
        <Link to="/" className="text-blue-600 font-bold hover:underline mt-4 inline-block">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const genderLabel = (gender?: string) => {
    if (!gender) return null;
    const map: Record<string, string> = { MALE: "Nam", FEMALE: "Nữ", OTHER: "Khác" };
    return map[gender] || gender;
  };

  const providerLabel = (provider?: string) => {
    if (!provider) return null;
    const map: Record<string, string> = { LOCAL: "Email", GOOGLE: "Google", FACEBOOK: "Facebook" };
    return map[provider] || provider;
  };

  const aboutItems = [
    { icon: <Mail size={20} />, label: "Email", value: profileUser.email, color: "text-blue-600", show: isOwnProfile },
    { icon: <Phone size={20} />, label: "Điện thoại", value: profileUser.phone, color: "text-green-600", show: isOwnProfile },
    { icon: <UserIcon size={20} />, label: "Giới tính", value: genderLabel(profileUser.gender), color: "text-pink-500", show: true },
    { icon: <Calendar size={20} />, label: "Ngày sinh", value: formatDate(profileUser.dateOfBirth), color: "text-orange-500", show: true },
    { icon: <Smile size={20} />, label: "Sở thích", value: profileUser.hobby, color: "text-yellow-500", show: true },
    { icon: <MapPin size={20} />, label: "Địa chỉ", value: profileUser.address, color: "text-red-500", show: true },
    { icon: <Calendar size={20} />, label: "Tham gia", value: formatDate(profileUser.createdAt), color: "text-indigo-600", show: true },
    { icon: <Shield size={20} />, label: "Đăng nhập qua", value: providerLabel(profileUser.authProvider), color: "text-teal-600", show: isOwnProfile },
  ].filter((item) => item.show && item.value);

  const FriendsLoading = () => (
    <>
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="flex bg-white rounded-xl h-20 animate-pulse border border-gray-100"
        />
      ))}
    </>
  );

  const FriendsEmpty = ({ isOwnProfile }: { isOwnProfile: boolean }) => (
    <p className="col-span-full text-center text-gray-500 py-12 font-medium">
      {isOwnProfile
        ? "You don't have any friends yet."
        : "This account has no friends yet."}
    </p>
  );

  const FriendsPrivate = () => (
    <p className="col-span-full text-center text-gray-500 py-12 font-medium">
      You do not have permission to view this person's friend list.
    </p>
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-64 sm:h-80 w-full group">
          <div className="w-full h-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600" />
          {isOwnProfile && (
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button className="bg-white/80 hover:bg-white px-4 py-2 rounded-full transition-all text-gray-900 font-bold flex items-center gap-2 shadow-lg cursor-pointer">
                <Camera size={18} />
                Đổi ảnh bìa
              </button>
            </div>
          )}
        </div>

        {/* Profile Info Header */}
        <div className="px-4 sm:px-8 pb-6 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-6">
            <div className="relative group">
              <img
                src={profileUser.avatarUrl || `https://ui-avatars.com/api/?name=${profileUser.fullName}&size=160&background=2563EB&color=fff`}
                className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-xl bg-white object-cover transition-opacity ${isUploading ? "opacity-50" : ""}`}
                alt={profileUser.fullName}
              />
              {isOwnProfile && (
                <button
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                  className="absolute bottom-2 right-2 bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 transition-all shadow-md border-2 border-white cursor-pointer disabled:bg-gray-400"
                >
                  <Camera size={18} className={isUploading ? "animate-pulse" : ""} />
                </button>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left mb-2">
              <h1 className="text-2xl font-black text-gray-900 leading-tight">
                {profileUser.fullName || profileUser.username}
              </h1>
              <p className="text-[13px] text-gray-400 font-bold uppercase tracking-wide">@{profileUser.username}</p>
            </div>

            <div className="flex gap-2">
              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 cursor-pointer active:scale-95"
                >
                  <Edit3 size={16} />
                  Sửa hồ sơ
                </button>
              ) : (
                <>
                  {profileUser && (
                    <FriendshipButton
                      targetUserId={profileUser.id}
                      targetUserName={profileUser.fullName || profileUser.username}
                    />
                  )}
                  {currentUser && (
                    <button className="flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all cursor-pointer active:scale-95">
                      <MessageCircle size={16} />
                      Nhắn tin
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed text-lg font-medium">
            {profileUser.hobby || "Chưa có tiểu sử."}
          </p>
          <div className="flex flex-wrap gap-8 mt-6">
            <div className="flex items-center gap-2">
              <span className="font-black text-gray-900 text-lg">{profileUser.following ?? 0}</span>
              <span className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">
                Đang theo dõi
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-gray-900 text-lg">{profileUser.followers ?? 0}</span>
              <span className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">
                Người theo dõi
              </span>
            </div>
            {profileUser.mutualFriends !== undefined && profileUser.mutualFriends > 0 && (
              <button
                onClick={() => setIsMutualModalOpen(true)}
                className="flex items-center gap-2 hover:bg-blue-50 p-1 px-2 rounded-lg transition-colors cursor-pointer"
              >
                <span className="font-black text-blue-600 text-lg">{profileUser.mutualFriends}</span>
                <span className="text-blue-500 font-bold text-[11px] uppercase tracking-wider">
                  Manual friends
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-8 overflow-x-auto no-scrollbar">
          {[
            { id: "about", label: "Thông tin", icon: <Info size={16} /> },
            { id: "posts", label: "Bài viết", icon: <Grid size={16} /> },
            { id: "friends", label: "Bạn bè", icon: <Users size={16} /> },
            { id: "photos", label: "Ảnh", icon: <ImageIcon size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3.5 transition-all whitespace-nowrap font-bold text-[12px] uppercase tracking-widest cursor-pointer ${activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/10"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-50/50"
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="animate-slide-up px-4 sm:px-8 pb-8">
          {activeTab === "about" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aboutItems.length > 0 ? (
                aboutItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className={`p-2 bg-white rounded-lg shadow-sm ${item.color}`}>
                      {item.icon}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-gray-400 uppercase">{item.label}</p>
                      <p className="font-bold text-gray-800">{item.value}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Info size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">Chưa có thông tin.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "posts" && (
            <div className="space-y-6">
              {isOwnProfile && <CreatePost onPostCreated={handlePostCreated} />}

              {isPostsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-white rounded-xl h-48 animate-pulse border border-gray-100" />
                  ))}
                </div>
              ) : posts.length > 0 ? (
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
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Grid size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">Chưa có bài viết nào.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "friends" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileUser.displayFriendsStatus === "ONLY_ME" && !isOwnProfile ? (
                <FriendsPrivate />
              ) : profileUser.displayFriendsStatus === "FRIEND_ONLY" && !isOwnProfile && status !== "ACCEPTED" ? (
                <FriendsPrivate />
              ) : isFriendsLoading ? (
                <FriendsLoading />
              ) : friends.length === 0 ? (
                <FriendsEmpty isOwnProfile={isOwnProfile} />
              ) : (
                friends.map((friend) => (
                  <FriendCard
                    key={friend.id}
                    friend={friend}
                    handleRemoveFriend={handleRemoveFriend}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === "photos" && (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Chưa có ảnh nào.</p>
            </div>
          )}
        </div>
      </div>

      {profileUser && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={profileUser}
          onUpdate={handleUpdateProfile}
        />
      )}

      {/* Avatar Upload Hidden Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Avatar Cropper Modal */}
      {tempImage && (
        <AvatarCropperModal
          isOpen={isCropperOpen}
          imageSrc={tempImage}
          onClose={() => {
            setIsCropperOpen(false);
            setTempImage(null);
          }}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* Mutual Friends Modal */}
      {profileUser && (
        <MutualFriendsModal
          isOpen={isMutualModalOpen}
          onClose={() => setIsMutualModalOpen(false)}
          targetUserId={profileUser.id}
          targetUserName={profileUser.fullName || profileUser.username}
        />
      )}

      {/* Post Modals */}
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
        isDeleting={isDeletingPost}
        onClose={() => setDeletingPostId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default Profile;
