import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Shield, AlertTriangle, ChevronDown, ChevronRight, Users, RefreshCw, Settings } from "lucide-react";
import { adminApi } from "../../services/adminApi";
import { SuspectIpDto } from "../../../types";
import { format } from "date-fns";
import toast from "react-hot-toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const AdminSuspectPage: React.FC = () => {
  const [suspects, setSuspects] = useState<SuspectIpDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIp, setExpandedIp] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(3);
  const [windowHours, setWindowHours] = useState(24);
  const [ipToBlock, setIpToBlock] = useState<string | null>(null);
  const [ipToUnblock, setIpToUnblock] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchSuspects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSuspiciousIps(threshold, windowHours);
      setSuspects(data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [threshold, windowHours]);

  useEffect(() => {
    fetchSuspects();
  }, [fetchSuspects]);

  const toggleIp = (ip: string) => {
    setExpandedIp(prev => (prev === ip ? null : ip));
  };

  const handleBlockIp = async (ip: string) => {
    setIpToBlock(ip);
  };

  const confirmBlockIp = async () => {
    if (!ipToBlock) return;
    setIsProcessing(true);
    try {
      await adminApi.blockIp(ipToBlock, "Creating too many accounts (Spam/Bot detection)");
      toast.success(`IP ${ipToBlock} has been blocked successfully!`);
      setIpToBlock(null);
      fetchSuspects();
    } catch (err) {
      console.error(err);
      toast("Error blocking IP");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnblockIp = (ip: string) => {
    setIpToUnblock(ip);
  };

  const confirmUnblockIp = async () => {
    if (!ipToUnblock) return;
    setIsProcessing(true);
    try {
      await adminApi.unblockIp(ipToUnblock);
      toast.success(`IP ${ipToUnblock} has been unblocked successfully!`);
      setIpToUnblock(null);
      fetchSuspects();
    } catch (err) {
      console.error(err);
      toast("Error unblocking IP");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <AlertTriangle className="text-amber-600" size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Spam / Multi-Account Detection</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              IPs with {threshold}+ registrations in the last {windowHours} hours
            </p>
          </div>
        </div>
        <button
          onClick={fetchSuspects}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Config Panel */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex flex-wrap gap-6 items-end">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Settings size={16} />
          Detection Configuration
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Min accounts per IP</label>
          <input
            type="number"
            min={2}
            max={20}
            value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Time window (hours)</label>
          <select
            value={windowHours}
            onChange={e => setWindowHours(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 outline-none"
          >
            <option value={1}>1 hour</option>
            <option value={6}>6 hours</option>
            <option value={24}>24 hours</option>
            <option value={72}>3 days</option>
            <option value={168}>7 days</option>
          </select>
        </div>
        <button
          onClick={fetchSuspects}
          className="px-4 py-1.5 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors"
        >
          Apply
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : suspects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
          <Shield size={48} className="mx-auto text-green-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-700">No threats detected</h3>
          <p className="text-sm text-gray-400 mt-1">
            No IP addresses with {threshold}+ registrations in the last {windowHours} hours.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 font-medium">
            Detected <span className="text-amber-600 font-bold">{suspects.length}</span> suspicious IPs
          </p>

          {suspects.map((suspect) => (
            <div key={suspect.ip} className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
              {/* IP Row */}
              <div
                onClick={() => toggleIp(suspect.ip)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleIp(suspect.ip);
                  }
                }}
                role="button"
                tabIndex={0}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-amber-50 transition-colors cursor-pointer outline-none"
              >
                <div className="flex items-center gap-4">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <AlertTriangle size={16} className="text-amber-600" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-bold text-gray-800">{suspect.ip}</p>
                      {suspect.blocked ? (
                        <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border border-rose-200">
                          Blocked
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border border-amber-200">
                          Suspect
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {suspect.accountCount} accounts registered from this address
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {suspect.blocked ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnblockIp(suspect.ip);
                      }}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[11px] font-bold rounded-lg hover:bg-emerald-100 transition-all border border-emerald-100 flex items-center gap-1.5"
                    >
                      <Shield className="rotate-180" size={12} />
                      Unblock IP
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBlockIp(suspect.ip);
                      }}
                      className="px-3 py-1.5 bg-rose-50 text-rose-600 text-[11px] font-bold rounded-lg hover:bg-rose-100 transition-all border border-rose-100 flex items-center gap-1.5"
                    >
                      <Shield size={12} />
                      Block IP
                    </button>
                  )}
                  <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200">
                    <Users size={11} className="inline mr-1" />
                    {suspect.accountCount} accounts
                  </span>
                  {expandedIp === suspect.ip
                    ? <ChevronDown size={18} className="text-gray-400" />
                    : <ChevronRight size={18} className="text-gray-400" />
                  }
                </div>
              </div>

              {/* Expanded: Account List */}
              {expandedIp === suspect.ip && (
                <div className="border-t border-amber-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-5 py-2.5 font-semibold text-gray-500 text-xs uppercase">User</th>
                        <th className="px-5 py-2.5 font-semibold text-gray-500 text-xs uppercase">Email</th>
                        <th className="px-5 py-2.5 font-semibold text-gray-500 text-xs uppercase">Status</th>
                        <th className="px-5 py-2.5 font-semibold text-gray-500 text-xs uppercase">Registration Date</th>
                        <th className="px-5 py-2.5 font-semibold text-gray-500 text-xs uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {suspect.accounts.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.fullName}&size=32`}
                                alt={user.fullName}
                                className="w-8 h-8 rounded-full object-cover border border-gray-100"
                              />
                              <div>
                                <p className="font-medium text-gray-800">{user.fullName || "---"}</p>
                                <p className="text-xs text-gray-400">@{user.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-gray-600">{user.email || "---"}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              }`}>
                              {user.enabled ? "Active" : "Locked"}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-gray-400 text-xs">
                            {user.createdAt ? format(new Date(user.createdAt), "dd/MM/yyyy HH:mm") : "---"}
                          </td>
                          <td className="px-5 py-3">
                            <Link
                              to={`/admin/users/${user.id}`}
                              className="text-blue-600 text-xs font-medium hover:underline"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!ipToBlock}
        onClose={() => setIpToBlock(null)}
        onConfirm={confirmBlockIp}
        title="Block IP Address"
        message={`Are you sure you want to block IP ${ipToBlock}? This action will prevent all new registrations from this address.`}
        confirmText="Block IP"
        isLoading={isProcessing}
        type="danger"
      />

      <ConfirmDialog
        isOpen={!!ipToUnblock}
        onClose={() => setIpToUnblock(null)}
        onConfirm={confirmUnblockIp}
        title="Unblock IP Address"
        message={`Are you sure you want to unblock IP ${ipToUnblock}? This address will be allowed to register accounts again.`}
        confirmText="Unblock IP"
        isLoading={isProcessing}
        type="info"
      />
    </div>
  );
};

export default AdminSuspectPage;
