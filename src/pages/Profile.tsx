import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Camera,
  Edit3,
  Grid,
  List,
  Bookmark,
  Info,
  Users,
  Image as ImageIcon,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Link as LinkIcon,
  X,
  Check,
  UserPlus,
  MessageCircle,
} from "lucide-react";
import { MOCK_POSTS, ONLINE_FRIENDS, SUGGESTED_FRIENDS, MOCK_USER } from "../../constants";
import PostCard from "../components/PostCard";
import { User } from "../../types";

/**
 * Profile Page
 * Displays user profile with posts, information, and friends
 */
const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"posts" | "about" | "friends" | "photos">("posts");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);

  // Determine which user is being displayed
  useEffect(() => {
    if (!userId || userId === currentUser?.id) {
      setProfileUser(currentUser);
    } else {
      // Mock search for other users
      const found = [...SUGGESTED_FRIENDS, ...ONLINE_FRIENDS].find((u) => u.id === userId);
      setProfileUser(found || null);
    }
  }, [userId, currentUser]);

  if (!profileUser) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-400">User not found</h2>
        <Link to="/" className="text-blue-600 font-bold hover:underline mt-4 inline-block">
          Go back home
        </Link>
      </div>
    );
  }

  const isOwnProfile = profileUser.id === currentUser?.id;
  const userPosts = MOCK_POSTS.filter((p) => p.userId === profileUser.id);
  const userPhotos = userPosts.filter((p) => p.image).map((p) => p.image);
  const allFriends = [...ONLINE_FRIENDS, ...SUGGESTED_FRIENDS].slice(0, 6);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-64 sm:h-80 w-full group">
          <img
            src={profileUser.coverImage || "https://picsum.photos/seed/defaultcover/1200/400"}
            className="w-full h-full object-cover"
            alt="cover"
          />
          {isOwnProfile && (
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button className="bg-white/80 hover:bg-white px-4 py-2 rounded-full transition-all text-gray-900 font-bold flex items-center gap-2 shadow-lg">
                <Camera size={18} />
                Change Cover Photo
              </button>
            </div>
          )}
        </div>

        {/* Profile Info Header */}
        <div className="px-4 sm:px-8 pb-6 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-6">
            <div className="relative group">
              <img
                src={profileUser.avatar}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-xl bg-white object-cover"
                alt="avatar"
              />
              {isOwnProfile && (
                <button className="absolute bottom-2 right-2 bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 transition-all shadow-md border-2 border-white">
                  <Camera size={18} />
                </button>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left mb-2">
              <h1 className="text-3xl font-black text-gray-900 leading-tight">
                {profileUser.name}
              </h1>
              <p className="text-gray-500 font-medium">@{profileUser.username}</p>
            </div>

            <div className="flex gap-2">
              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  <Edit3 size={18} />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                    <UserPlus size={18} />
                    Follow
                  </button>
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all">
                    <MessageCircle size={18} />
                    Message
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed text-lg font-medium">
            {profileUser.bio || "No bio yet."}
          </p>
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2">
              <span className="font-black text-gray-900 text-xl">420</span>
              <span className="text-gray-500 font-bold text-sm uppercase tracking-wide">
                Following
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-gray-900 text-xl">1.2k</span>
              <span className="text-gray-500 font-bold text-sm uppercase tracking-wide">
                Followers
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-8 overflow-x-auto no-scrollbar">
          {[
            { id: "posts", label: "Posts", icon: <Grid size={18} /> },
            { id: "about", label: "About", icon: <Info size={18} /> },
            { id: "friends", label: "Friends", icon: <Users size={18} /> },
            { id: "photos", label: "Photos", icon: <ImageIcon size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 transition-all whitespace-nowrap font-bold text-sm uppercase tracking-wider ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="animate-slide-up">
          {activeTab === "posts" && (
            <div className="max-w-2xl mx-auto space-y-6">
              {userPosts.map((post) => (
                <PostCard key={post.id} post={post} onLike={() => {}} onAddComment={() => {}} />
              ))}
              {userPosts.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Grid size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">No posts from this user yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "about" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight flex items-center gap-2">
                  <Info size={20} className="text-blue-600" />
                  Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Work</p>
                      <p className="font-bold text-gray-800">Professional Developer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Education</p>
                      <p className="font-bold text-gray-800">Computer Science Graduate</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight flex items-center gap-2">
                  <MapPin size={20} className="text-red-500" />
                  Contact
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-red-500">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Location</p>
                      <p className="font-bold text-gray-800">San Francisco, CA</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Joined</p>
                      <p className="font-bold text-gray-800">2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "friends" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {allFriends.map((friend) => (
                <a
                  href={`#/profile/${friend.id}`}
                  key={friend.id}
                  className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-center group"
                >
                  <img
                    src={friend.avatar}
                    className="w-20 h-20 rounded-full mx-auto mb-3 object-cover group-hover:scale-105 transition-transform"
                    alt=""
                  />
                  <p className="font-bold text-gray-900 truncate">{friend.name}</p>
                  <p className="text-xs text-gray-500 mb-3">Mutual friends</p>
                  <div className="w-full py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold group-hover:bg-blue-600 group-hover:text-white transition-all">
                    View Profile
                  </div>
                </a>
              ))}
            </div>
          )}

          {activeTab === "photos" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {userPhotos.map((photo, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-2xl overflow-hidden group relative cursor-pointer shadow-sm"
                >
                  <img
                    src={photo}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt=""
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImageIcon className="text-white" size={24} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
