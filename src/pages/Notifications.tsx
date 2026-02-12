import React from "react";
import { Hammer } from "lucide-react";

/**
 * Notifications Page
 * Shows all notifications
 */
const Notifications: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center animate-fade-in">
      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Hammer size={40} />
      </div>
      <h2 className="text-2xl font-black text-gray-900 mb-2">Notifications is Coming Soon</h2>
      <p className="text-gray-500 max-w-sm mx-auto">
        We're working hard to bring you this feature. Stay tuned for NexusSocial updates!
      </p>
    </div>
  );
};

export default Notifications;
