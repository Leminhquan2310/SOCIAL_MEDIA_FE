import React, { useState, useEffect } from "react";
import { X, ShieldAlert, AlertTriangle, Trash2, EyeOff, Calendar, User, FileText } from "lucide-react";
import { format } from "date-fns";
import DOMPurify from "dompurify";
import { AdminPostResponseDto, Post, Privacy } from "../../../types";
import { adminApi } from "../../services/adminApi";
import PostCarousel from "../../components/post/PostCarousel";
import ConfirmDialog from "../../components/common/ConfirmDialog";

interface AdminPostDetailModalProps {
  postBrief: AdminPostResponseDto;
  onClose: () => void;
  onActionSuccess: () => void;
}

interface ReportDetail {
  id: number;
  reporterUsername: string;
  reporterFullName: string;
  reason: string;
  createdAt: string;
}

type ConfirmAction = "hide" | "dismiss" | "delete" | null;

const AdminPostDetailModal: React.FC<AdminPostDetailModalProps> = ({ postBrief, onClose, onActionSuccess }) => {
  const [post, setPost] = useState<Post | null>(null);
  const [reports, setReports] = useState<ReportDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "reports">("content");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [postData, reportsData] = await Promise.all([
          adminApi.getPostById(postBrief.postId),
          adminApi.getPostReports(postBrief.postId)
        ]);
        setPost(postData);
        setReports(reportsData);
      } catch (error) {
        console.error("Error fetching post detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postBrief.postId]);

  const handleHide = async () => {
    setActionLoading(true);
    try {
      await adminApi.hidePost(postBrief.postId);
      onActionSuccess();
      onClose();
    } catch (error) {
      alert("Error hiding post");
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleDismiss = async () => {
    setActionLoading(true);
    try {
      await adminApi.dismissReports(postBrief.postId);
      onActionSuccess();
      onClose();
    } catch (error) {
      alert("Error dismissing reports");
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await adminApi.deletePost(postBrief.postId);
      onActionSuccess();
      onClose();
    } catch (error) {
      alert("Error deleting post");
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const confirmDialogConfig = confirmAction === "hide"
    ? {
      title: "Hide this post?",
      message: "This will change the post visibility to HIDDEN. Only admins can apply this state, and the post will no longer appear in user-facing post APIs.",
      confirmText: "Hide Post",
      type: "warning" as const,
      onConfirm: handleHide,
    }
    : confirmAction === "dismiss"
      ? {
        title: "Dismiss all reports?",
        message: "This will clear every report associated with this post.",
        confirmText: "Dismiss Reports",
        type: "info" as const,
        onConfirm: handleDismiss,
      }
      : confirmAction === "delete"
        ? {
          title: "Delete this post permanently?",
          message: "This action cannot be undone. The post and its related data will be permanently removed.",
          confirmText: "Delete Permanently",
          type: "danger" as const,
          onConfirm: handleDelete,
        }
      : null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-scale-up">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${postBrief.reportCount > 0 ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"}`}>
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Post Details #{postBrief.postId}</h3>
                <p className="text-xs text-gray-400">Posted by: @{postBrief.username}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Action Bar */}
          <div className="px-6 py-3 border-b border-gray-100 bg-white flex items-center justify-between">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("content")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "content" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <FileText size={16} />
                Content
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "reports" ? "bg-white text-rose-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <AlertTriangle size={16} />
                Reports ({postBrief.reportCount})
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={actionLoading}
                onClick={() => setConfirmAction("hide")}
                className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all flex items-center gap-2"
              >
                <EyeOff size={18} />
                Hide Post
              </button>
              <button
                disabled={actionLoading || postBrief.reportCount === 0}
                onClick={() => setConfirmAction("dismiss")}
                className="px-4 py-2 text-sm font-bold text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-all flex items-center gap-2"
              >
                <ShieldAlert size={18} />
                Dismiss Reports
              </button>
              <button
                disabled={actionLoading}
                onClick={() => setConfirmAction("delete")}
                className="px-4 py-2 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-rose-100"
              >
                <Trash2 size={18} />
                Delete Permanently
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Loading details...</p>
              </div>
            ) : activeTab === "content" ? (
              <div className="space-y-6 max-w-2xl mx-auto">
                {/* Author Info */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post?.author?.avatarUrl || `https://ui-avatars.com/api/?name=${postBrief.username}`}
                      alt="avatar"
                      className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900">{post?.author?.fullName || postBrief.username}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={12} /> {post && format(new Date(post.createdAt), "dd/MM/yyyy HH:mm:ss")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${postBrief.status === Privacy.PUBLIC ? "bg-blue-50 text-blue-600" :
                      postBrief.status === Privacy.FRIEND_ONLY ? "bg-green-50 text-green-600" :
                      postBrief.status === Privacy.HIDDEN ? "bg-rose-50 text-rose-600" : "bg-gray-100 text-gray-500"
                      }`}>
                      {postBrief.status}
                    </span>
                  </div>
                </div>

                {/* Post Text */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm prose prose-sm max-w-none">
                  <div
                    className="text-gray-800 text-[16px] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post?.content || "") }}
                  />
                </div>

                {/* Post Images */}
                {post?.images && post.images.length > 0 && (
                  <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <PostCarousel images={post.images} onImageClick={() => { }} />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 font-medium">
                    There are no reports for this post.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reports.map((report) => (
                      <div key={report.id} className="bg-white p-4 rounded-xl border border-rose-50 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                              <User size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{report.reporterFullName}</p>
                              <p className="text-[11px] text-gray-400">@{report.reporterUsername}</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {format(new Date(report.createdAt), "HH:mm dd/MM/yy")}
                          </span>
                        </div>
                        <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-50 text-sm text-gray-700 font-medium italic">
                          "{report.reason}"
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmDialogConfig && (
        <ConfirmDialog
          isOpen={Boolean(confirmDialogConfig)}
          onClose={() => !actionLoading && setConfirmAction(null)}
          onConfirm={confirmDialogConfig.onConfirm}
          title={confirmDialogConfig.title}
          message={confirmDialogConfig.message}
          confirmText={confirmDialogConfig.confirmText}
          cancelText="Cancel"
          type={confirmDialogConfig.type}
          isLoading={actionLoading}
        />
      )}
    </>
  );
};

export default AdminPostDetailModal;
