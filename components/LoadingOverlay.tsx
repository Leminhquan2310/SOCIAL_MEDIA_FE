import React from "react";
import { useLoading } from "../contexts/LoadingContext";
import { Loader } from "lucide-react";

/**
 * Global Loading Overlay Component
 * Displays loading spinner and message when app is loading
 */
const LoadingOverlay: React.FC = () => {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
        <div className="animate-spin">
          <Loader size={40} className="text-blue-600" />
        </div>
        <p className="text-gray-700 font-medium text-center">{loadingMessage || "Loading..."}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
