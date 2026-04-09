import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Eye, Filter, ShieldAlert, Globe, Users, Lock, ChevronLeft, ChevronRight } from "lucide-react";
import { adminApi } from "../../services/adminApi";
import { AdminPostResponseDto, PaginatedResponse, Privacy } from "../../../types";
import { format } from "date-fns";
import AdminPostDetailModal from "./AdminPostDetailModal";

const AdminPostsPage: React.FC = () => {
    const [data, setData] = useState<PaginatedResponse<AdminPostResponseDto> | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [size] = useState(10);

    const [selectedPost, setSelectedPost] = useState<AdminPostResponseDto | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    
    // Filters
    const [username, setUsername] = useState("");
    const [status, setStatus] = useState<Privacy | "">("");
    const [minReports, setMinReports] = useState<number | "">("");
    const [maxReports, setMaxReports] = useState<number | "">("");

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getAllPosts(page, size, "createdAt", "desc", {
                username: username || undefined,
                status: status || undefined,
                minReports: minReports !== "" ? minReports : undefined,
                maxReports: maxReports !== "" ? maxReports : undefined,
            });
            setData(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [page]);

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        fetchPosts();
    };

    const resetFilters = () => {
        setUsername("");
        setStatus("");
        setMinReports("");
        setMaxReports("");
        setPage(0);
        // We'll let the next render trigger fetch due to reset behavior or just call it
        setTimeout(() => fetchPosts(), 0);
    };

    const getPrivacyIcon = (p: Privacy) => {
        switch (p) {
            case Privacy.PUBLIC: return <Globe size={14} className="text-blue-500" />;
            case Privacy.FRIEND_ONLY: return <Users size={14} className="text-green-500" />;
            case Privacy.ONLY_ME: return <Lock size={14} className="text-gray-500" />;
            case Privacy.HIDDEN: return <Lock size={14} className="text-rose-500" />;
            default: return null;
        }
    };

    const getStatusLabel = (p: Privacy) => {
        switch (p) {
            case Privacy.PUBLIC: return "PUBLIC";
            case Privacy.FRIEND_ONLY: return "FRIENDS";
            case Privacy.ONLY_ME: return "ONLY ME";
            case Privacy.HIDDEN: return "HIDDEN BY ADMIN";
            default: return "UNKNOWN";
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters Section */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative">
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block px-1">Poster</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Username or ID..."
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block px-1">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as Privacy | "")}
                            className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium appearance-none"
                        >
                            <option value="">All statuses</option>
                            <option value={Privacy.PUBLIC}>Public</option>
                            <option value={Privacy.FRIEND_ONLY}>Friends</option>
                            <option value={Privacy.ONLY_ME}>Only me</option>
                            <option value={Privacy.HIDDEN}>Hidden</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block px-1">Reports (Min)</label>
                        <input
                            type="number"
                            placeholder="Min..."
                            value={minReports}
                            onChange={(e) => setMinReports(e.target.value === "" ? "" : parseInt(e.target.value))}
                            className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        />
                    </div>

                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block px-1">Reports (Max)</label>
                            <input
                                type="number"
                                placeholder="Max..."
                                value={maxReports}
                                onChange={(e) => setMaxReports(e.target.value === "" ? "" : parseInt(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                            />
                        </div>
                        <button
                            type="submit"
                            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                        >
                            <Filter size={20} />
                        </button>
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="p-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 text-[11px] uppercase tracking-wider font-bold">
                                <th className="px-6 py-4 border-b border-gray-50">ID</th>
                                <th className="px-6 py-4 border-b border-gray-50">Poster</th>
                                <th className="px-6 py-4 border-b border-gray-50">Content</th>
                                <th className="px-6 py-4 border-b border-gray-50">Status</th>
                                <th className="px-6 py-4 border-b border-gray-50 text-center">Reports</th>
                                <th className="px-6 py-4 border-b border-gray-50">Created Date</th>
                                <th className="px-6 py-4 border-b border-gray-50 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-[13.5px]">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
                                            <span className="font-medium">Loading post data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : data?.content.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No posts found matching the filtered criteria.
                                    </td>
                                </tr>
                            ) : (
                                data?.content.map((post) => (
                                    <tr key={post.postId} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="px-6 py-4 font-mono text-gray-400 text-xs">#{post.postId}</td>
                                        <td className="px-6 py-4">
                                            <Link to={`/u/${post.username}`} className="flex items-center gap-2 group">
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${post.username}&background=random`}
                                                    alt={post.username}
                                                    className="w-8 h-8 rounded-full border border-gray-100 shadow-sm"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">@{post.username}</span>
                                                    <span className="text-[10px] text-gray-400">UID: {post.userId}</span>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 max-w-[300px]">
                                            <p className="line-clamp-2 text-gray-600 font-medium">{post.content || <span className="italic text-gray-300">No text content</span>}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 font-bold text-[11px]">
                                                {getPrivacyIcon(post.status)}
                                                <span className={`${
                                                    post.status === Privacy.PUBLIC ? "text-blue-600" : 
                                                    post.status === Privacy.FRIEND_ONLY ? "text-green-600" :
                                                    post.status === Privacy.HIDDEN ? "text-rose-600" : "text-gray-500"
                                                }`}>
                                                    {getStatusLabel(post.status)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-xs ${
                                                post.reportCount > 0 ? "bg-rose-50 text-rose-600 shadow-sm shadow-rose-100" : "bg-gray-50 text-gray-400"
                                            }`}>
                                                {post.reportCount > 0 && <ShieldAlert size={12} />}
                                                {post.reportCount}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-medium">
                                            {format(new Date(post.createdAt), "dd/MM/yyyy HH:mm")}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedPost(post);
                                                    setIsDetailModalOpen(true);
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-blue-600 bg-blue-50 font-bold hover:bg-blue-100 transition-all active:scale-95"
                                            >
                                                <Eye size={16} />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && data && data.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
                        <div className="text-[13px] text-gray-400 font-medium">
                            Viewing <span className="text-gray-800 font-bold">{data.pageable.offset + 1}-{Math.min(data.pageable.offset + data.numberOfElements, data.totalElements)}</span> of <span className="text-gray-800 font-bold">{data.totalElements}</span> posts
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={data.first}
                                className="p-2 rounded-xl border border-gray-100 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(data.totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i)}
                                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                                            page === i ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-gray-500 hover:bg-gray-50"
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={data.last}
                                className="p-2 rounded-xl border border-gray-100 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Modal chi tiết bài viết */}
            {isDetailModalOpen && selectedPost && (
                <AdminPostDetailModal
                    postBrief={selectedPost}
                    onClose={() => {
                        setIsDetailModalOpen(false);
                        setSelectedPost(null);
                    }}
                    onActionSuccess={() => {
                        fetchPosts();
                    }}
                />
            )}
        </div>
    );
};

export default AdminPostsPage;
