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
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
      <div className="flex gap-4">
        <img src={user?.avatar} alt="" className="w-12 h-12 rounded-full ring-2 ring-gray-50" />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${user?.name?.split(" ")[0]}?`}
            className="w-full border-none focus:ring-0 text-lg resize-none placeholder-gray-400 pt-2 min-h-[100px]"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
        <div className="flex gap-1">
          <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Image size={18} className="text-green-500" />
            <span className="text-sm font-medium">Photo</span>
          </button>
          <button className="hidden sm:flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Smile size={18} className="text-yellow-500" />
            <span className="text-sm font-medium">Feeling</span>
          </button>
          <button className="hidden sm:flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <MapPin size={18} className="text-red-500" />
            <span className="text-sm font-medium">Location</span>
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isPosting}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all shadow-sm ${
            content.trim() && !isPosting
              ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isPosting ? "Posting..." : "Post"}
          {!isPosting && <Send size={16} />}
        </button>
      </div>
    </div>
  );
};

export default CreatePost;
