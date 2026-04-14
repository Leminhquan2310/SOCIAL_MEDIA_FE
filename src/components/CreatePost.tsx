import React, { useState, useRef, useEffect } from "react";
import { Image as ImageIcon, Video, Smile, Send, X, MapPin, Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, FileVideo, Loader2 } from "lucide-react";
import { generateVideoThumbnail } from "../utils/mediaUtils";
import { useAuth } from "../contexts/AuthContext";
import { handleApiError } from "../services/api";
import { postApi } from "../utils/apiClient";
import { validatePostContent } from "../utils/contentModeration";
import { Post, Privacy } from "../../types";
import FeelingSelector from "./post/FeelingSelector";
import PrivacySelector from "./post/PrivacySelector";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import toast from "react-hot-toast";

interface CreatePostProps {
  onPostCreated: (post: Post) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 pb-2 mb-2 border-b border-gray-100 flex-wrap">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive("bold") ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
        title="In đậm"
      >
        <Bold size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive("italic") ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
        title="In nghiêng"
      >
        <Italic size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive("underline") ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
        title="Gạch chân"
      >
        <UnderlineIcon size={18} />
      </button>
      <div className="w-px h-4 bg-gray-200 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive("bulletList") ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
        title="Danh sách dấu chấm"
      >
        <List size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive("orderedList") ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
        title="Danh sách số"
      >
        <ListOrdered size={18} />
      </button>
    </div>
  );
};

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [privacy, setPrivacy] = useState<Privacy>(Privacy.PUBLIC);
  const [feeling, setFeeling] = useState<string | undefined>();
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ url: string; thumbnailUrl?: string; isGenerating?: boolean; type: "IMAGE" | "VIDEO" }[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [contentValidationError, setContentValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: `What's on your mind, ${user?.fullName?.split(" ").pop() || ""}?`,
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[100px] text-[15.5px] text-gray-800 leading-relaxed",
      },
    },
  }, [user]);

  const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "IMAGE" | "VIDEO") => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      if (type === "VIDEO") {
        const oversized = newFiles.filter(f => f.size > 100 * 1024 * 1024);
        if (oversized.length > 0) {
          setSubmitError("Video size exceeds 100MB limit.");
          return;
        }
        setVideos((prev) => [...prev, ...newFiles]);

        // Create initial previews with loading state
        const initialPreviews = newFiles.map(file => ({
          url: URL.createObjectURL(file),
          type,
          isGenerating: true
        }));
        setPreviews(prev => [...prev, ...initialPreviews]);

        // Generate thumbnails asynchronously
        for (let i = 0; i < newFiles.length; i++) {
          try {
            const thumbUrl = await generateVideoThumbnail(newFiles[i]);
            setPreviews(prev => {
              const updated = [...prev];
              // Find the index of this specific video preview
              const absoluteIdx = prev.length - newFiles.length + i;
              if (updated[absoluteIdx]) {
                updated[absoluteIdx] = { ...updated[absoluteIdx], thumbnailUrl: thumbUrl, isGenerating: false };
              }
              return updated;
            });
          } catch (error) {
            console.error("Thumbnail generation failed", error);
            setPreviews(prev => {
              const updated = [...prev];
              const absoluteIdx = prev.length - newFiles.length + i;
              if (updated[absoluteIdx]) {
                updated[absoluteIdx] = { ...updated[absoluteIdx], isGenerating: false };
              }
              return updated;
            });
          }
        }
      } else {
        setImages((prev) => [...prev, ...newFiles]);
        const newPreviews = newFiles.map((file) => ({
          url: URL.createObjectURL(file),
          type
        }));
        setPreviews((prev) => [...prev, ...newPreviews]);
      }
      setSubmitError(null);
    }
  };

  const removeMedia = (index: number) => {
    const item = previews[index];
    URL.revokeObjectURL(item.url);

    if (item.type === "IMAGE") {
      // Find the index in the original images array
      // This is a bit tricky if multiple images/videos are interleaved.
      // Simpler: find the count of items of same type before this index.
      const sameTypeIndex = previews.slice(0, index).filter(p => p.type === item.type).length;
      setImages(prev => prev.filter((_, i) => i !== sameTypeIndex));
    } else {
      const sameTypeIndex = previews.slice(0, index).filter(p => p.type === item.type).length;
      setVideos(prev => prev.filter((_, i) => i !== sameTypeIndex));
    }

    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;

    const htmlContent = editor.getHTML();
    const textContent = editor.getText();
    const isTextEmpty = textContent.trim().length === 0;
    const validation = validatePostContent(textContent);

    if (validation.matches.length > 0) {
      setContentValidationError(`Content contains forbidden terms: ${validation.matches.join(", ")}`);
      return;
    }

    if (isTextEmpty && images.length === 0) return;

    setSubmitError(null);
    setIsPosting(true);
    try {
      const response = await postApi.createPost({
        content: htmlContent,
        privacy,
        feeling,
        images,
        videos
      });

      onPostCreated(response as Post);

      // Reset state
      editor.commands.setContent("");
      setPrivacy(Privacy.PUBLIC);
      setFeeling(undefined);
      setImages([]);
      setVideos([]);
      previews.forEach(p => URL.revokeObjectURL(p.url));
      setPreviews([]);
      setContentValidationError(null);
      setSubmitError(null);
      toast.success("Post created successfully!");
    } catch (error) {
      console.error("Failed to create post:", error);
      setSubmitError(handleApiError(error));
      toast.error(handleApiError(error));
    } finally {
      setIsPosting(false);
    }
  };


  useEffect(() => {
    if (!editor) return;

    const update = () => {
      const textContent = editor.getText();
      const validation = validatePostContent(textContent);
      setContentValidationError(validation.matches.length > 0 ? `Content contains forbidden terms: ${validation.matches.join(", ")}` : null);
      setIsEmpty(textContent.trim().length === 0);
    };

    editor.on("update", update);

    return () => {
      editor.off("update", update);
    };
  }, [editor]);

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100 transition-all hover:border-gray-200">
      <div className="flex gap-3">
        <img
          src={user?.avatarUrl || user?.avatar}
          alt={user?.fullName}
          className="w-10 h-10 rounded-full ring-2 ring-gray-50 shadow-sm object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[14px] text-gray-900">{user?.fullName}</span>
              <PrivacySelector value={privacy} onChange={setPrivacy} />
            </div>
          </div>

          <MenuBar editor={editor} />
          <EditorContent editor={editor} className="cursor-text tiptap" />
        </div>
      </div>

      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {previews.map((item, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
              {item.type === "IMAGE" ? (
                <img src={item.url} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full relative">
                  {item.isGenerating ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin mb-1" />
                      <span className="text-[10px] font-bold">Thumbnail...</span>
                    </div>
                  ) : item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <video src={item.url} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/20 backdrop-blur-sm p-2 rounded-full">
                      <Video size={16} className="text-white" />
                    </div>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeMedia(idx)}
                className="absolute top-1.5 right-1.5 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors group"
          >
            <ImageIcon size={20} className="text-green-500 group-hover:scale-110 transition-transform" />
            <span className="text-[13.5px] font-bold">Image</span>
          </button>

          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors group"
          >
            <Video size={20} className="text-red-500 group-hover:scale-110 transition-transform" />
            <span className="text-[13.5px] font-bold">Video</span>
          </button>

          <FeelingSelector selected={feeling} onSelect={setFeeling} />
        </div>

        <button
          onClick={handleSubmit}
          disabled={(isEmpty && previews.length === 0) || isPosting || !!contentValidationError}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
        >
          {isPosting ? "Censoring..." : "Post"}
          {!isPosting && <Send size={16} />}
        </button>
      </div>

      {contentValidationError && (
        <div className="mt-3 text-sm text-red-600">{contentValidationError}</div>
      )}
      {submitError && (
        <div className="mt-3 text-sm text-red-600">{submitError}</div>
      )}

      <input
        type="file"
        ref={imageInputRef}
        onChange={(e) => handleMediaChange(e, "IMAGE")}
        multiple
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={videoInputRef}
        onChange={(e) => handleMediaChange(e, "VIDEO")}
        multiple
        accept="video/*"
        className="hidden"
      />
    </div>
  );
};

export default CreatePost;
