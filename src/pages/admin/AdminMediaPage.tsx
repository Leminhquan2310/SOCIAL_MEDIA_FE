import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle,
  Trash2,
  LayoutGrid,
  MoreVertical,
  CheckSquare,
  Square,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock
} from "lucide-react";
import { AdminMedia, MediaStatus, MediaType } from "../../../types";
import { adminApi } from "../../services/adminApi";
import { getAdminMediaThumbnail } from "./adminMediaUtils";
import AdminMediaDetailModal from "./AdminMediaDetailModal";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

const AdminMediaPage: React.FC = () => {
  const [mediaList, setMediaList] = useState<AdminMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [minScore, setMinScore] = useState<number>(0);

  // Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ id: number, sourceType: string }[]>([]);

  // Detail
  const [viewingMedia, setViewingMedia] = useState<AdminMedia | null>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        size: 18,
      };
      if (statusFilter) params.status = statusFilter;
      if (minScore > 0) params.minScore = minScore / 100;

      const response = await adminApi.getMediaList(params);
      console.log(response);
      setMediaList(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error("Error fetching media:", error);
      toast.error("Failed to load media stream");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, minScore]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const toggleSelect = (item: AdminMedia) => {
    if (selectedIds.includes(item.id)) {
      setSelectedIds(selectedIds.filter(id => id !== item.id));
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    } else {
      setSelectedIds([...selectedIds, item.id]);
      setSelectedItems([...selectedItems, { id: item.id, sourceType: item.sourceType }]);
    }
  };

  const selectAllOnPage = () => {
    if (selectedIds.length === mediaList.length) {
      setSelectedIds([]);
      setSelectedItems([]);
    } else {
      setSelectedIds(mediaList.map(m => m.id));
      setSelectedItems(mediaList.map(m => ({ id: m.id, sourceType: m.sourceType })));
    }
  };

  const handleBulkAction = async (status: MediaStatus) => {
    if (selectedItems.length === 0) return;

    const loadingToast = toast.loading(`Updating ${selectedItems.length} items...`);
    try {
      await adminApi.bulkUpdateMediaStatus(selectedItems, status);
      toast.success(`Successfully updated ${selectedItems.length} items`, { id: loadingToast });
      setSelectedIds([]);
      setSelectedItems([]);
      fetchMedia();
    } catch (error) {
      toast.error("Bulk action failed", { id: loadingToast });
    }
  };

  const getStatusStyle = (status: MediaStatus) => {
    switch (status) {
      case MediaStatus.REJECTED: return "bg-red-700";
      case MediaStatus.FLAGGED: return "bg-rose-500";
      case MediaStatus.ACTIVE: return "bg-emerald-500";
      case MediaStatus.DELETED: return "bg-gray-400";
      default: return "bg-blue-500";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <LayoutGrid className="text-blue-600" />
            Media Moderation
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">
            Review and manage all uploaded content ({totalElements} items total)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setPage(0); fetchMedia(); }}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-600 shadow-sm"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Filter & Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
            {[
              { label: "All Media", value: "" },
              { label: "Rejected", value: "REJECTED" },
              { label: "Flagged", value: "FLAGGED" },
              { label: "Safe", value: "ACTIVE" },
              { label: "Deleted", value: "DELETED" }
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setStatusFilter(tab.value); setPage(0); }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === tab.value
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 flex-1 md:flex-none justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Min AI Score:</span>
              <select
                value={minScore}
                onChange={(e) => { setMinScore(Number(e.target.value)); setPage(0); }}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value={0}>Any</option>
                <option value={50}>50%+</option>
                <option value={80}>80%+</option>
                <option value={95}>95%+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Selection / Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-xl border border-blue-100 animate-slide-up">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-blue-700">
                {selectedIds.length} items selected
              </span>
              <button
                onClick={() => { setSelectedIds([]); setSelectedItems([]); }}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Deselect all
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleBulkAction(MediaStatus.ACTIVE)}
                className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-sm"
              >
                <CheckCircle size={14} />
                Mark Safe
              </button>
              <button
                onClick={() => handleBulkAction(MediaStatus.DELETED)}
                className="flex items-center gap-2 px-4 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition-all shadow-sm"
              >
                <Trash2 size={14} />
                Delete Content
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : mediaList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <AlertCircle className="text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-500">No media found</h3>
          <p className="text-sm text-gray-400">Try adjusting your filters or score threshold.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in">
          {mediaList.map((media) => {
            const isSelected = selectedIds.includes(media.id);
            const isFlagged = media.violationScore >= 0.8;

            return (
              <div
                key={`${media.sourceType}-${media.id}`}
                className={`relative group aspect-[3/4] rounded-2xl overflow-hidden shadow-sm transition-all duration-300 border-2 cursor-pointer ${isSelected ? "border-blue-500 scale-[0.98]" : "border-transparent hover:border-gray-200 hover:shadow-md"
                  }`}
                onClick={() => setViewingMedia(media)}
              >
                {/* Media Preview */}
                <img
                  src={getAdminMediaThumbnail(media.url, media.type)}
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${media.status === MediaStatus.DELETED || media.status === MediaStatus.REJECTED ? "opacity-30 grayscale" : ""
                    }`}
                  alt=""
                />

                {/* Meta Overlays */}
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex gap-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase text-white shadow-sm ${media.status === MediaStatus.REJECTED ? 'bg-red-700' : isFlagged ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                        Score: {Math.round(media.violationScore * 100)}%
                      </span>
                      {media.status !== MediaStatus.ACTIVE && (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase text-white shadow-sm ${getStatusStyle(media.status)}`}>
                          {media.status}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-white/70 font-bold tabular-nums">
                      {format(new Date(media.createdAt), "dd/MM")}
                    </span>
                  </div>
                  <p className="text-[10px] text-white font-bold truncate leading-none">
                    {media.ownerName}
                  </p>
                </div>

                {/* Selection Checkbox */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSelect(media); }}
                  className={`absolute top-2 left-2 p-1.5 rounded-lg transition-all ${isSelected ? "bg-blue-600 text-white" : "bg-black/30 text-white opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                    }`}
                >
                  {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>

                {/* Status Dot */}
                <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border border-white shadow-sm ${getStatusStyle(media.status)}`} />

                {/* Type Indicator */}
                {media.type === MediaType.VIDEO && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30">
                      <LayoutGrid className="text-white" size={18} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-all text-gray-600 shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              i < 5 || i === totalPages - 1 || (i > page - 2 && i < page + 2) ? (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${page === i
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                      : "bg-white border border-gray-100 text-gray-500 hover:bg-gray-50"
                    }`}
                >
                  {i + 1}
                </button>
              ) : i === 5 ? <span key={i} className="text-gray-300">...</span> : null
            ))}
          </div>

          <button
            disabled={page === totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-all text-gray-600 shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Selection Control Footer */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={selectAllOnPage}
          className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 text-sm font-bold hover:scale-105 active:scale-95 transition-all text-gray-900"
        >
          {selectedIds.length === mediaList.length ? <CheckSquare size={18} /> : <CheckSquare size={18} />}
          {selectedIds.length === mediaList.length ? "Deselect All on Page" : "Select All on Page"}
        </button>
      </div>

      {/* Detail Modal */}
      {viewingMedia && (
        <AdminMediaDetailModal
          media={viewingMedia}
          onClose={() => setViewingMedia(null)}
          onActionSuccess={() => { fetchMedia(); }}
        />
      )}
    </div>
  );
};

export default AdminMediaPage;
