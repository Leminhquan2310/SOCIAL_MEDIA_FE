import React, { useState } from "react";
import { X, AlertTriangle, ShieldCheck } from "lucide-react";
import { postApi } from "../../services/postApi";
import { handleApiError } from "../../services/api";

interface ReportModalProps {
  postId: string | number;
  onClose: () => void;
  onSuccess: () => void;
}

const REPORT_REASONS = [
  "Spam (Nội dung rác)",
  "Nội dung gây thù ghét",
  "Bạo lực hoặc đe dọa",
  "Nội dung nhạy cảm / Khiêu dâm",
  "Quấy rối hoặc bắt nạt",
  "Thông tin sai sự thật",
  "Vi phạm bản quyền",
  "Khác (Vui lòng điền chi tiết)"
];

const ReportModal: React.FC<ReportModalProps> = ({ postId, onClose, onSuccess }) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    const finalReason = selectedReason === "Khác (Vui lòng điền chi tiết)" ? customReason : selectedReason;
    
    if (!finalReason) {
      setError("Vui lòng chọn hoặc nhập lý do báo cáo");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await postApi.reportPost(postId, finalReason);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (e) {
      setError(handleApiError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle size={20} />
            <h3 className="font-bold text-lg">Báo cáo bài viết</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck size={32} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Đã gửi báo cáo</h4>
              <p className="text-gray-500">Cảm ơn bạn đã phản hồi. Chúng tôi sẽ xem xét bài viết này sớm nhất có thể.</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 text-[14px] mb-4">
                Tại sao bạn muốn báo cáo bài viết này? Phản hồi của bạn giúp chúng tôi cải thiện cộng đồng hơn.
              </p>

              <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {REPORT_REASONS.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-[14px] transition-all flex items-center justify-between ${
                      selectedReason === reason 
                        ? "border-rose-500 bg-rose-50 text-rose-700 font-bold shadow-sm" 
                        : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {reason}
                    {selectedReason === reason && (
                      <div className="w-4 h-4 rounded-full border-4 border-rose-500" />
                    )}
                  </button>
                ))}
              </div>

              {selectedReason === "Khác (Vui lòng điền chi tiết)" && (
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Vui lòng mô tả chi tiết vi phạm..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-[14px] mb-4 min-h-[100px] resize-none animate-slide-down"
                />
              )}

              {error && (
                <div className="p-3 mb-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm flex items-center gap-2 animate-shake">
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 text-[14px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                >
                  Hủy
                </button>
                <button
                  disabled={loading || !selectedReason || (selectedReason === "Khác (Vui lòng điền chi tiết)" && !customReason)}
                  onClick={handleSubmit}
                  className="flex-[2] py-3 text-[14px] font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Gửi báo cáo"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
