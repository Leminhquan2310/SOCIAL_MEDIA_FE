import React, { useState, useRef, useEffect } from "react";
import { Image as ImageIcon, Smile, Send, X, MapPin, Bold, Italic, Underline as UnderlineIcon, List, ListOrdered } from "lucide-react";
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
  const [previews, setPreviews] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [contentValidationError, setContentValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: `Bạn đang nghĩ gì, ${user?.fullName?.split(" ").pop() || ""}?`,
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[100px] text-[15.5px] text-gray-800 leading-relaxed",
      },
    },
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
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
        images
      });

      onPostCreated(response as Post);

      // Reset state
      editor.commands.setContent("");
      setPrivacy(Privacy.PUBLIC);
      setFeeling(undefined);
      setImages([]);
      previews.forEach(p => URL.revokeObjectURL(p));
      setPreviews([]);
      setContentValidationError(null);
      setSubmitError(null);
    } catch (error) {
      console.error("Failed to create post:", error);
      setSubmitError(handleApiError(error));
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
          {previews.map((url, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <img src={url} className="w-full h-full object-cover" alt="" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
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
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors group"
          >
            <ImageIcon size={20} className="text-green-500 group-hover:scale-110 transition-transform" />
            <span className="text-[13.5px] font-bold">Ảnh</span>
          </button>

          <FeelingSelector selected={feeling} onSelect={setFeeling} />
        </div>

        <button
          onClick={handleSubmit}
          disabled={(isEmpty && images.length === 0) || isPosting || !!contentValidationError}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
        >
          {isPosting ? "Đang đăng..." : "Đăng bài"}
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
        ref={fileInputRef}
        onChange={handleImageChange}
        multiple
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default CreatePost;
