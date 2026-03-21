import React, { useState } from "react";
import { Image, MapPin, Smile, Send } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface CreatePostProps {
  onPostCreated: (content: string, imageUrl?: string) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsPosting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 600));
    onPostCreated(content);
    setContent("");
    setIsPosting(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-3.5 mb-6 border border-gray-100 transition-all hover:border-gray-200">
      <div className="flex gap-3">
        <img src={user?.avatarUrl} alt={user?.fullName} className="w-10 h-10 rounded-full ring-2 ring-gray-50 shadow-sm" />
        <div className="flex-1 border-none">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Bạn đang nghĩ gì, ${user?.fullName?.split(" ")[user?.fullName.split(" ").length - 1]}?`}
            className="w-full border-none focus:ring-0 focus:outline-none text-[15px] resize-none placeholder-gray-400 p-1.5 min-h-[80px]"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <div className="flex gap-0.5">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
            <Image size={17} className="text-green-500" />
            <span className="text-[13px] font-semibold">Ảnh/Video</span>
          </button>
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
            <Smile size={17} className="text-yellow-500" />
            <span className="text-[13px] font-semibold">Cảm xúc</span>
          </button>
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
            <MapPin size={17} className="text-red-500" />
            <span className="text-[13px] font-semibold">Vị trí</span>
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isPosting}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13.5px] font-bold transition-all shadow-sm ${content.trim() && !isPosting
            ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
        >
          {isPosting ? "Đang đăng..." : "Đăng bài"}
          {!isPosting && <Send size={15} />}
        </button>
      </div>
    </div>
  );
};

export default CreatePost;
