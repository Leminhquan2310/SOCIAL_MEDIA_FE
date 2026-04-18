import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Image as ImageIcon, Video, Send, Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { generateVideoThumbnail } from "../../utils/mediaUtils";
import { Post, Privacy, MediaType } from "../../../types";
import { postApi } from "../../utils/apiClient";
import FeelingSelector from "./FeelingSelector";
import PrivacySelector from "./PrivacySelector";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { toast } from "react-hot-toast";

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

interface MediaData {
  id?: number;
  url: string;
  thumbnailUrl?: string;
  isGenerating?: boolean;
  file?: File;
  type: MediaType;
  isNew: boolean;
  newIdx?: number;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, isOpen, onClose, onUpdated }) => {
  const [privacy, setPrivacy] = useState<Privacy>(post.privacy);
  const [feeling, setFeeling] = useState<string | undefined>(post.feeling);

  // Unified media management for reordering
  const [media, setMedia] = useState<MediaData[]>([]);
  const [deletedMediaIds, setDeletedMediaIds] = useState<number[]>([]);

  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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

      // Initialize unified media
      const initialMedia: MediaData[] = (post.images || []).map(img => ({
        id: img.id,
        url: img.mediaUrl,
        type: img.mediaType,
        isNew: false
      }));
      setMedia(initialMedia);

      setDeletedMediaIds([]);
    }
  }, [isOpen, post, editor]);

  if (!isOpen) return null;

  const handleNewMediaChange = async (e: React.ChangeEvent<HTMLInputElement>, type: MediaType) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      if (type === MediaType.VIDEO) {
        const oversized = filesArray.filter(f => f.size > 100 * 1024 * 1024);
        if (oversized.length > 0) {
          toast.error("Video size exceeds 100MB limit.");
          return;
        }

        // Add initial media with loading state
        const initialNewItems: MediaData[] = filesArray.map((file) => ({
          url: URL.createObjectURL(file),
          file: file,
          type: type,
          isNew: true,
          isGenerating: true
        }));
        
        const currentMediaCount = media.length;
        setMedia([...media, ...initialNewItems]);

        // Generate thumbnails asynchronously
        for (let i = 0; i < filesArray.length; i++) {
          try {
            const thumbUrl = await generateVideoThumbnail(filesArray[i]);
            setMedia(prev => {
              const updated = [...prev];
              const absoluteIdx = currentMediaCount + i;
              if (updated[absoluteIdx]) {
                updated[absoluteIdx] = { ...updated[absoluteIdx], thumbnailUrl: thumbUrl, isGenerating: false };
              }
              return updated;
            });
          } catch (error) {
            console.error("Thumbnail generation failed", error);
            setMedia(prev => {
              const updated = [...prev];
              const absoluteIdx = currentMediaCount + i;
              if (updated[absoluteIdx]) {
                updated[absoluteIdx] = { ...updated[absoluteIdx], isGenerating: false };
              }
              return updated;
            });
          }
        }
      } else {
        const newItems: MediaData[] = filesArray.map((file) => ({
          url: URL.createObjectURL(file),
          file: file,
          type: type,
          isNew: true
        }));
        setMedia([...media, ...newItems]);
      }
    }
  };

  const removeMedia = (index: number) => {
    const item = media[index];
    if (!item.isNew && item.id) {
      setDeletedMediaIds([...deletedMediaIds, item.id]);
    } else if (item.isNew) {
      URL.revokeObjectURL(item.url);
    }
    setMedia(media.filter((_, i) => i !== index));
  };

  const moveMedia = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === media.length - 1) return;

    const newMedia = [...media];
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    [newMedia[index], newMedia[targetIdx]] = [newMedia[targetIdx], newMedia[index]];
    setMedia(newMedia);
  };

  const handleUpdate = async () => {
    if (!editor) return;

    const htmlContent = editor.getHTML();
    const isTextEmpty = editor.getText().trim().length === 0;

    if (isTextEmpty && media.length === 0) return;

    setIsUpdating(true);
    try {
      // Construction imageOrder (media order) and separate files
      const newImagesFiles: File[] = [];
      const newVideoFiles: File[] = [];
      const imageOrder: string[] = [];

      let newCount = 0;
      media.forEach(item => {
        if (item.isNew && item.file) {
          const key = `new-${newCount++}`;
          imageOrder.push(key);
          if (item.type === MediaType.VIDEO) {
            newVideoFiles.push(item.file);
          } else {
            newImagesFiles.push(item.file);
          }
        } else if (item.id) {
          imageOrder.push(item.id.toString());
        }
      });

      const response = await postApi.updatePost(post.id, {
        content: htmlContent,
        privacy,
        feeling,
        deletedImageIds: deletedMediaIds,
        newImages: newImagesFiles,
        newVideos: newVideoFiles,
        imageOrder: imageOrder
      });

      toast.success("Cập nhật bài viết thành công!");
      onUpdated(response as Post);
      onClose();
    } catch (error: any) {
      console.error("Failed to update post:", error);
      toast.error(error.message || "Cập nhật bài viết thất bại!");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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

          {/* Media Grid */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {media.map((item, idx) => (
              <div key={item.id || `new-${idx}`} className="relative group aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
                {item.type === MediaType.VIDEO ? (
                  <div className="w-full h-full relative">
                    {item.isGenerating ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                        <Loader2 className="w-5 h-5 animate-spin mb-1" />
                        <span className="text-[9px] font-bold">Thumbnail...</span>
                      </div>
                    ) : item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <video src={item.url} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-black/20 backdrop-blur-sm p-1.5 rounded-full">
                        <Video size={14} className="text-white" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img src={item.url} className="w-full h-full object-cover" alt="" />
                )}

                {/* Media Actions Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                  <div className="flex justify-between items-start">
                    {item.isNew ? (
                      <div className="bg-blue-600 text-[9px] text-white font-bold px-1.5 py-0.5 rounded uppercase shadow-sm">Mới</div>
                    ) : <div />}
                    <button
                      type="button"
                      onClick={() => removeMedia(idx)}
                      className="bg-black/60 text-white p-1.5 rounded-full hover:bg-rose-600 transition-colors backdrop-blur-sm"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  <div className="flex justify-center gap-2 mb-1">
                    <button
                      type="button"
                      onClick={() => moveMedia(idx, 'left')}
                      disabled={idx === 0}
                      className="bg-black/60 text-white p-1.5 rounded-lg hover:bg-blue-600 transition-colors backdrop-blur-sm disabled:opacity-30"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveMedia(idx, 'right')}
                      disabled={idx === media.length - 1}
                      className="bg-black/60 text-white p-1.5 rounded-lg hover:bg-blue-600 transition-colors backdrop-blur-sm disabled:opacity-30"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all gap-1.5 text-gray-400 group"
            >
              <div className="p-2 rounded-full group-hover:bg-gray-100 transition-colors text-green-500">
                <ImageIcon size={24} />
              </div>
              <span className="text-[12px] font-bold">Thêm ảnh</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleNewMediaChange(e, MediaType.IMAGE)}
              multiple
              accept="image/*"
              className="hidden"
            />

            <button
              onClick={() => videoInputRef.current?.click()}
              className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all gap-1.5 text-gray-400 group"
            >
              <div className="p-2 rounded-full group-hover:bg-gray-100 transition-colors text-rose-500">
                <Video size={24} />
              </div>
              <span className="text-[12px] font-bold">Thêm video</span>
            </button>
            <input
              type="file"
              ref={videoInputRef}
              onChange={(e) => handleNewMediaChange(e, MediaType.VIDEO)}
              multiple
              accept="video/*"
              className="hidden"
            />
          </div>

        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <FeelingSelector selected={feeling} onSelect={setFeeling} />

          <button
            onClick={handleUpdate}
            disabled={(!editor?.getText().trim() && media.length === 0) || isUpdating}
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
