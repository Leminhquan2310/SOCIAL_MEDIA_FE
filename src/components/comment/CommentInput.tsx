import React, { useState, useRef } from "react";
import { Send, Image as ImageIcon, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { validateContent } from "../../utils/contentModeration";

interface CommentInputProps {
  onSubmit: (content: string, imageFile?: File) => Promise<void>;
  placeholder?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
  showImageUpload?: boolean;
  initialContent?: string;
}

const CommentInput: React.FC<CommentInputProps> = ({ onSubmit, placeholder = "Viết bình luận...", autoFocus, onCancel, showImageUpload = true, initialContent = "" }) => {
  const { user } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const currentAvatar = user?.avatarUrl || user?.avatar || `https://ui-avatars.com/api/?name=${user?.fullName || user?.username}`;

  const handleRemoveImage = () => {
    setImageFile(undefined);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateCommentText = (text: string) => {
    const result = validateContent(text);
    if (result.matches.length > 0) {
      return `Content contains restricted words: ${result.matches.join(", ")}`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !imageFile) || isSubmitting || validationError) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(content, imageFile);
      setContent("");
      handleRemoveImage();
      setValidationError(null);
      if (onCancel) onCancel(); // Auto close if it's a reply block
    } catch (error) {
      console.error("Gửi bình luận thất bại:", error);
      setSubmitError(error instanceof Error ? error.message : "Gửi bình luận thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-2 w-full mt-2 animate-fade-in">
      <img
        src={currentAvatar}
        className="w-8 h-8 rounded-full shadow-sm object-cover shrink-0 mt-1"
        alt="Avatar"
      />

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-2">
        <div className="relative border border-gray-200 rounded-2xl bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all shadow-sm">
          <input
            autoFocus={autoFocus}
            type="text"
            value={content}
            onChange={(e) => {
              const nextValue = e.target.value;
              setContent(nextValue);
              setValidationError(validateCommentText(nextValue));
              setSubmitError(null);
            }}
            placeholder={placeholder}
            className="w-full bg-transparent px-4 py-2 text-[13.5px] focus:outline-none disabled:opacity-50"
            disabled={isSubmitting}
          />

          <div className="flex items-center justify-between px-2 pb-1">
            {showImageUpload ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
                disabled={isSubmitting}
                title="Đính kèm ảnh"
              >
                <ImageIcon size={18} />
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-1">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 font-medium"
                >
                  Hủy
                </button>
              )}
              <button
                type="submit"
                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
                disabled={(!content.trim() && !imageFile) || isSubmitting || !!validationError}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Image Preview Block */}
        {imagePreview && (
          <div className="relative w-max mt-1 group">
            <img src={imagePreview} alt="Preview" className="max-h-16 rounded-xl object-contain border border-gray-100" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <X size={10} />
            </button>
          </div>
        )}

        {validationError && (
          <div className="text-sm text-red-600">{validationError}</div>
        )}
        {submitError && !validationError && (
          <div className="text-sm text-red-600">{submitError}</div>
        )}
        {showImageUpload && (
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
        )}
      </form>
    </div>
  );
};

export default CommentInput;
