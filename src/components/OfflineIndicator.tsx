import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div 
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-4 right-4 z-40 max-w-sm mx-auto flex items-center gap-2.5 rounded-xl bg-amber-950/90 border border-amber-600/50 px-3.5 py-2 text-xs font-medium text-amber-200 shadow-xl backdrop-blur-md"
    >
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <span>Offline Mode — All Bagh Chal game rules and AI work offline.</span>
    </div>
  );
};
