import React from "react";
import { AlertTriangle, LogIn, RefreshCw } from "lucide-react";

interface SessionExpiryModalProps {
  isOpen: boolean;
  onLogin: () => void;
  onRefresh?: () => void;
  message?: string;
  showRefresh?: boolean;
}

const SessionExpiryModal: React.FC<SessionExpiryModalProps> = ({
  isOpen,
  onLogin,
  onRefresh,
  message = "Your session has expired. Please login again to continue.",
  showRefresh = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-red-600/30 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Session Expired
            </h3>
            <p className="text-sm text-gray-400">Authentication required</p>
          </div>
        </div>

        <p className="text-gray-300 mb-6">{message}</p>

        <div className="flex gap-3">
          {showRefresh && onRefresh && (
            <button
              onClick={onRefresh}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}

          <button
            onClick={onLogin}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Login Again
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          This helps keep your account secure
        </div>
      </div>
    </div>
  );
};

export default SessionExpiryModal;
