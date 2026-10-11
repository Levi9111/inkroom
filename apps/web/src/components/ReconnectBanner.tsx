import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, X } from 'lucide-react';

export interface ReconnectBannerProps {
  status: 'connected' | 'connecting' | 'disconnected';
}

export const ReconnectBanner: React.FC<ReconnectBannerProps> = ({ status }) => {
  const [effectiveStatus, setEffectiveStatus] = useState(status);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
    if (status === 'connecting') {
      // If still connecting after 3.5s, downgrade to offline mode so loader doesn't spin forever
      const timer = setTimeout(() => {
        setEffectiveStatus('disconnected');
      }, 3500);
      return () => clearTimeout(timer);
    } else {
      setEffectiveStatus(status);
    }
  }, [status]);

  // In offline mode, automatically fade away after 6 seconds
  useEffect(() => {
    if (effectiveStatus === 'disconnected') {
      const timer = setTimeout(() => {
        setDismissed(true);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [effectiveStatus]);

  if (effectiveStatus === 'connected' || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-16 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 rounded-xl text-xs font-medium shadow-lg backdrop-blur-md flex items-center gap-2.5 transition-all animate-in fade-in duration-200 select-none ${
        effectiveStatus === 'disconnected'
          ? 'bg-amber-600/90 text-white'
          : 'bg-indigo-600/90 text-white'
      }`}
    >
      {effectiveStatus === 'disconnected' ? (
        <>
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>Local offline mode. Edits are saved on this device.</span>
        </>
      ) : (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
          <span>Connecting to classroom server...</span>
        </>
      )}

      <button
        onClick={() => setDismissed(true)}
        className="ml-1 p-0.5 rounded hover:bg-black/20 text-white/80 hover:text-white transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
