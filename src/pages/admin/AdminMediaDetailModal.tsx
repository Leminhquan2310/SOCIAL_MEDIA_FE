import React, { useState } from "react";
import { X, ShieldAlert, CheckCircle, Trash2, Calendar, User, FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import DOMPurify from "dompurify";
import { AdminMedia, MediaStatus, MediaType } from "../../../types";
import { adminApi } from "../../services/adminApi";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { toast } from "react-hot-toast";

interface AdminMediaDetailModalProps {
  media: AdminMedia;
  onClose: () => void;
  onActionSuccess: () => void;
}

const AdminMediaDetailModal: React.FC<AdminMediaDetailModalProps> = ({ media, onClose, onActionSuccess }) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<MediaStatus | null>(null);

  const handleUpdateStatus = async (status: MediaStatus) => {
    setActionLoading(true);
    try {
      await adminApi.updateMediaStatus(media.sourceType, media.id, status);
      toast.success(`Media marked as ${status.toLowerCase()}`);
      onActionSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating media status:", error);
      toast.error("Failed to update status");
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-red-700 bg-red-50 border-red-100";
    if (score >= 0.5) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-emerald-600 bg-emerald-50 border-emerald-100";
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
        <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-scale-up border border-gray-100 text-gray-900">

          {/* Media View Area (Left or Top) */}
          <div className="flex-[1.5] bg-gray-900 flex items-center justify-center relative min-h-[400px]">
            {media.type === MediaType.VIDEO ? (
              <video
                src={media.url}
                controls
                autoPlay
                className="max-w-full max-h-full"
              />
            ) : (
              <img
                src={media.url}
                className="max-w-full max-h-full object-contain"
                alt="Mod detail"
              />
            )}

            <button
              onClick={onClose}
              className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Info & Actions Area (Right or Bottom) */}
          <div className="flex-1 flex flex-col bg-white border-l border-gray-100">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${media.status === MediaStatus.REJECTED ? "bg-red-100 text-red-700" : media.status === MediaStatus.FLAGGED ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"}`}>
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    Media Review
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest text-white ${media.status === MediaStatus.REJECTED ? "bg-red-700" : media.status === MediaStatus.FLAGGED ? "bg-rose-500" : media.status === MediaStatus.ACTIVE ? "bg-emerald-500" : "bg-gray-400"}`}>
                      {media.status}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400">ID: {media.sourceType}#{media.id}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all hidden md:block"
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrolling Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* AI Analysis */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">AI Analysis</span>
                  <div className={`px-2 py-1 rounded-lg border text-sm font-black ${getScoreColor(media.violationScore)}`}>
                    Score: {(media.violationScore * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${media.violationScore >= 0.8 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${media.violationScore * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed italic">
                  * Low scores indicate safe content. Scores above 50% are flagged, and scores above 80% are automatically rejected from the newsfeed.
                </p>
              </div>

              {/* Context / Text */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-900">
                  <FileText size={16} className="text-blue-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">Text Context</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 max-h-[200px] overflow-y-auto text-gray-900">
                  <div
                    className="text-[14px] text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(media.content || "<i>No text content available.</i>") }}
                  />
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <User size={14} />
                    <span className="text-[10px] font-bold uppercase">Owner</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 truncate">{media.ownerName}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Calendar size={14} />
                    <span className="text-[10px] font-bold uppercase">Date</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {format(new Date(media.createdAt), "dd/MM/yyyy")}
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span>Source: <b className="text-gray-900">{media.sourceType}</b></span>
                  <a
                    href={media.sourceType === 'POST' ? `/post/${media.sourceId}` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    View on Site <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-3">
              {/* Mark Safe Button - Show if not already ACTIVE */}
              {media.status !== MediaStatus.ACTIVE && (
                <button
                  disabled={actionLoading}
                  onClick={() => setConfirmAction(MediaStatus.ACTIVE)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-50 font-bold rounded-xl transition-all shadow-sm active:scale-95"
                >
                  <CheckCircle size={18} />
                  {media.status === MediaStatus.DELETED ? "Restore Content" : "Mark Safe"}
                </button>
              )}

              {/* Reject Button - Show if ACTIVE or FLAGGED */}
              {(media.status === MediaStatus.ACTIVE || media.status === MediaStatus.FLAGGED) && (
                <button
                  disabled={actionLoading}
                  onClick={() => setConfirmAction(MediaStatus.REJECTED)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-red-600 border border-red-100 hover:bg-red-50 font-bold rounded-xl transition-all shadow-sm active:scale-95"
                >
                  <ShieldAlert size={18} />
                  Reject Content
                </button>
              )}

              {/* Delete Button - Show unless already DELETED */}
              {media.status !== MediaStatus.DELETED && (
                <button
                  disabled={actionLoading}
                  onClick={() => setConfirmAction(MediaStatus.DELETED)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 active:scale-95"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmAction === MediaStatus.ACTIVE}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => handleUpdateStatus(MediaStatus.ACTIVE)}
        title="Mark as Safe?"
        message="This will clear flags and ensure the content is visible to everyone."
        confirmText="Confirm Safe"
        type="info"
        isLoading={actionLoading}
      />

      <ConfirmDialog
        isOpen={confirmAction === MediaStatus.REJECTED}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => handleUpdateStatus(MediaStatus.REJECTED)}
        title="Reject Content?"
        message="This will hide the content from the newsfeed and mark it as a violation."
        confirmText="Confirm Reject"
        type="danger"
        isLoading={actionLoading}
      />

      <ConfirmDialog
        isOpen={confirmAction === MediaStatus.DELETED}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => handleUpdateStatus(MediaStatus.DELETED)}
        title="Delete Content?"
        message="This will permanently remove the content from the system (soft-delete)."
        confirmText="Confirm Delete"
        type="danger"
        isLoading={actionLoading}
      />
    </>
  );
};

export default AdminMediaDetailModal;
