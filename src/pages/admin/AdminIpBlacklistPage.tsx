import React, { useState, useEffect, useCallback } from "react";
import { Shield, ShieldOff, RefreshCw, AlertTriangle, Calendar, Search } from "lucide-react";
import { adminApi } from "../../services/adminApi";
import { PaginatedResponse } from "../../../types";
import { format } from "date-fns";
import toast from "react-hot-toast";

const AdminIpBlacklistPage: React.FC = () => {
  const [data, setData] = useState<PaginatedResponse<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const fetchBlacklist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllBlacklistedIps(page, size);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchBlacklist();
  }, [fetchBlacklist]);

  const handleUnblock = async (ip: string) => {
    if (!window.confirm(`Are you sure you want to UNBLOCK IP ${ip}?`)) {
      return;
    }

    try {
      await adminApi.unblockIp(ip);
      toast.success(`IP ${ip} has been removed from the blacklist successfully!`);
      fetchBlacklist();
    } catch (err) {
      console.error(err);
      toast("Error removing IP from blacklist");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 rounded-lg">
            <Shield className="text-rose-600" size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">IP Blacklist Management</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              List of network addresses currently blocked from account registration
            </p>
          </div>
        </div>
        <button
          onClick={fetchBlacklist}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[11px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4 border-b border-gray-50">IP Address</th>
                <th className="px-6 py-4 border-b border-gray-50">Block Reason</th>
                <th className="px-6 py-4 border-b border-gray-50">Blocked Date</th>
                <th className="px-6 py-4 border-b border-gray-50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-[13px]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
                      <span className="font-medium">Loading blacklist...</span>
                    </div>
                  </td>
                </tr>
              ) : data?.content.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                    No IP addresses are currently in the blacklist.
                  </td>
                </tr>
              ) : (
                data?.content.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-gray-800">
                      {item.ipAddress}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={14} className="text-rose-400 flex-shrink-0" />
                        <span className="text-gray-600 font-medium line-clamp-1">{item.reason || "---"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleUnblock(item.ipAddress)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-emerald-600 bg-emerald-50 font-bold hover:bg-emerald-100 transition-all active:scale-95"
                      >
                        <ShieldOff size={16} />
                        Unblock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminIpBlacklistPage;
