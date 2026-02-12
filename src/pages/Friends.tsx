import React, { useState } from "react";
import { UserCheck, UserPlus, Search, UserX, MessageSquare } from "lucide-react";
import { SUGGESTED_FRIENDS, ONLINE_FRIENDS } from "../../constants";

const Friends: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"all" | "requests" | "suggestions">("all");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Friends</h1>
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === "all"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Friends
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all relative ${
              activeTab === "requests"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Requests
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
              2
            </span>
          </button>
          <button
            onClick={() => setActiveTab("suggestions")}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === "suggestions"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Suggestions
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search friends..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
          />
        </div>
      </div>

      <div className="p-6">
        {activeTab === "all" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ONLINE_FRIENDS.concat(SUGGESTED_FRIENDS.slice(0, 1)).map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={friend.avatar}
                      className="w-12 h-12 rounded-full object-cover"
                      alt=""
                    />
                    {friend.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {friend.name}
                    </p>
                    <p className="text-xs text-gray-500">12 mutual friends</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <MessageSquare size={18} />
                  </button>
                  <button className="p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500 rounded-lg transition-colors">
                    <UserX size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "requests" && (
          <div className="space-y-4">
            {[
              {
                id: "r1",
                name: "James Miller",
                username: "jmiller",
                avatar: "https://picsum.photos/seed/james/200",
              },
              {
                id: "r2",
                name: "Emily Blunt",
                username: "eblunt",
                avatar: "https://picsum.photos/seed/emily/200",
              },
            ].map((request) => (
              <div
                key={request.id}
                className="flex flex-col sm:flex-row items-center justify-between p-4 border border-gray-100 rounded-xl bg-blue-50/30"
              >
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <img
                    src={request.avatar}
                    className="w-14 h-14 rounded-full border-2 border-white shadow-sm"
                    alt=""
                  />
                  <div>
                    <p className="font-bold text-gray-900">{request.name}</p>
                    <p className="text-sm text-gray-500">Sent you a friend request</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 shadow-sm transition-all">
                    Confirm
                  </button>
                  <button className="flex-1 sm:flex-none px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "suggestions" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SUGGESTED_FRIENDS.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all bg-white group"
              >
                <div className="flex items-center gap-3">
                  <img src={friend.avatar} className="w-12 h-12 rounded-full object-cover" alt="" />
                  <div>
                    <p className="font-bold text-gray-900">{friend.name}</p>
                    <p className="text-xs text-gray-500">Suggested for you</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-600 hover:text-white transition-all">
                  <UserPlus size={16} />
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
