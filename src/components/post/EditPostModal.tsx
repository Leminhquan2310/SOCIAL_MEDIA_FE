import React, { useState, useRef, useEffect } from "react";
import { X, Image as ImageIcon, Globe, Users, Lock, Send, Bold, Italic, Underline as UnderlineIcon, List, ListOrdered } from "lucide-react";
import { Post, Privacy } from "../../../types";
import { postApi } from "../../utils/apiClient";
import FeelingSelector from "./FeelingSelector";
import PrivacySelector from "./PrivacySelector";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

interface EditPostModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updatedPost: Post) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 pb-2 mb-2 border-b border-gray-100 flex-wrap">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive("bold") ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
      >
        <Bold size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive("italic") ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
      >
        <Italic size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive("underline") ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
      >
        <UnderlineIcon size={18} />
      </button>
      <div className="w-px h-4 bg-gray-200 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive("bulletList") ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
      >
        <List size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive("orderedList") ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
      >
        <ListOrdered size={18} />
      </button>
    </div>
  );
};

const EditPostModal: React.FC<EditPostModalProps> = ({ post, isOpen, onClose, onUpdated }) => {
  const [privacy, setPrivacy] = useState<Privacy>(post.privacy);
  const [feeling, setFeeling] = useState<string | undefined>(post.feeling);
  
  // Existing images management
  const [existingImages, setExistingImages] = useState(post.images || []);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  
  // New images
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: "Bạn đang nghĩ gì?",
      }),
    ],
    content: post.content,
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[120px] text-[15.5px] text-gray-800 leading-relaxed",
      },
    },
  });

  useEffect(() => {
    if (isOpen && editor) {
      editor.commands.setContent(post.content);
      setPrivacy(post.privacy);
      setFeeling(post.feeling);
      setExistingImages(post.images || []);
      setDeletedImageIds([]);
      setNewImages([]);
      newPreviews.forEach(p => URL.revokeObjectURL(p));
      setNewPreviews([]);
    }
  }, [isOpen, post, editor]);

  if (!isOpen) return null;

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewImages((prev) => [...prev, ...filesArray]);

      const previewsArray = filesArray.map((file) => URL.createObjectURL(file));
      setNewPreviews((prev) => [...prev, ...previewsArray]);
    }
  };

  const removeExistingImage = (id: number) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
    setDeletedImageIds((prev) => [...prev, id]);
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    if (!editor) return;

    const htmlContent = editor.getHTML();
    const isTextEmpty = editor.getText().trim().length === 0;

    if (isTextEmpty && existingImages.length === 0 && newImages.length === 0) return;

    setIsUpdating(true);
    try {
      const response = await postApi.updatePost(post.id, {
        content: htmlContent,
        privacy,
        feeling,
        deletedImageIds,
        newImages
      });
      onUpdated(response as Post);
      onClose();
    } catch (error) {
      console.error("Failed to update post:", error);
      alert("Cập nhật bài viết thất bại!");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden animate-scale-up border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="w-10" />
          <h2 className="text-lg font-bold text-gray-900">Chỉnh sửa bài viết</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {/* User Info */}
          <div className="flex gap-3 mb-4">
            <img 
              src={post.author.avatarUrl || post.author.avatar} 
              className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-50 shadow-sm"
              alt="" 
            />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-[14.5px] text-gray-900">{post.author.fullName || post.author.name}</span>
                {feeling && (
                  <span className="text-[13.5px] text-gray-500">
                    đang cảm thấy <span className="font-bold text-gray-700">{feeling}</span>
                  </span>
                )}
              </div>
              <div className="mt-1">
                <PrivacySelector value={privacy} onChange={setPrivacy} />
              </div>
            </div>
          </div>

          <div className="tiptap-edit-container">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="cursor-text tiptap" />
          </div>

          {/* Images Grid */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {/* Existing Images */}
            {existingImages.map((img) => (
              <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <img src={img.imageUrl} className="w-full h-full object-cover" alt="" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(img.id)}
                  className="absolute top-1.5 right-1.5 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            
            {/* New Image Previews */}
            {newPreviews.map((url, idx) => (
              <div key={`new-${idx}`} className="relative group aspect-square rounded-xl overflow-hidden shadow-sm border border-blue-100">
                <img src={url} className="w-full h-full object-cover" alt="" />
                <div className="absolute top-1.5 left-1.5 bg-blue-600 text-[10px] text-white font-bold px-1.5 py-0.5 rounded uppercase">Mới</div>
                <button
                  type="button"
                  onClick={() => removeNewImage(idx)}
                  className="absolute top-1.5 right-1.5 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all gap-1.5 text-gray-400 group"
            >
              <div className="p-2 rounded-full group-hover:bg-gray-100 transition-colors">
                <ImageIcon size={24} />
              </div>
              <span className="text-[12px] font-bold">Thêm ảnh</span>
            </button>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleNewImageChange}
            multiple
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <FeelingSelector selected={feeling} onSelect={setFeeling} />
          
          <button
            onClick={handleUpdate}
            disabled={(!editor?.getText().trim() && existingImages.length === 0 && newImages.length === 0) || isUpdating}
            className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
            {!isUpdating && <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
