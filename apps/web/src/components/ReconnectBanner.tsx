import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export interface ReconnectBannerProps {
  status: 'connected' | 'connecting' | 'disconnected';
}

export const ReconnectBanner: React.FC<ReconnectBannerProps> = ({ status }) => {
  if (status === 'connected') return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl text-xs font-semibold shadow-lg backdrop-blur-md flex items-center gap-2 transition-all ${
        status === 'disconnected'
          ? 'bg-amber-500/90 text-white'
          : 'bg-indigo-600/90 text-white'
      }`}
    >
      {status === 'disconnected' ? (
        <>
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>Offline mode active. Your whiteboard is saved locally on this device.</span>
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Reconnecting to classroom server...</span>
        </>
      )}
    </div>
  );
};
