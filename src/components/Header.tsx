import React from 'react';
import { useGameStore } from '../store/gameStore';
import { PWAInstallButton } from './PWAInstallButton';
import { HelpCircle, Settings, Swords, User } from 'lucide-react';

export const Header: React.FC = () => {
  const mode = useGameStore(s => s.mode);
  const setMode = useGameStore(s => s.setMode);
  const setShowTutorial = useGameStore(s => s.setShowTutorial);
  const setShowSettings = useGameStore(s => s.setShowSettings);

  return (
    <header className="w-full max-w-xl mx-auto px-3 sm:px-4 pt-safe pb-1.5 flex items-center justify-between gap-1.5 sm:gap-2 border-b border-amber-900/30">
      {/* Brand Zone */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center shadow-md border border-amber-500/40 text-base sm:text-lg select-none">
          🐅
        </div>
        <div>
          <h1 className="text-sm sm:text-base font-extrabold tracking-wide text-amber-100 font-cinzel leading-none">
            BAGH CHAL
          </h1>
          <p className="text-[9px] sm:text-[10px] font-semibold text-amber-400/80 tracking-wider leading-tight">
            बाघचाल · NEPAL
          </p>
        </div>
      </div>

      {/* Mode Switch (Touch-Optimized Segmented Control) */}
      <div className="flex items-center bg-black/50 p-0.5 sm:p-1 rounded-xl border border-amber-900/50 shadow-inner">
        <button
          onClick={() => setMode('PVE')}
          aria-label="Play versus AI"
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 min-h-[36px] sm:min-h-[40px] ${
            mode === 'PVE'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-amber-300/70 hover:text-amber-200'
          }`}
        >
          <Swords className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden xs:inline sm:inline">vs AI</span>
          <span className="inline xs:hidden sm:hidden">AI</span>
        </button>
        <button
          onClick={() => setMode('PVP')}
          aria-label="Play Pass and Play with friend"
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 min-h-[36px] sm:min-h-[40px] ${
            mode === 'PVP'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-amber-300/70 hover:text-amber-200'
          }`}
        >
          <User className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden xs:inline sm:inline">2-Player</span>
          <span className="inline xs:hidden sm:hidden">2P</span>
        </button>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <PWAInstallButton compact />

        <button
          onClick={() => setShowTutorial(true)}
          aria-label="How to play Bagh Chal"
          title="How to play"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-950/60 border border-amber-700/50 text-amber-300 hover:text-amber-100 hover:bg-amber-900/60 flex items-center justify-center transition active:scale-90"
        >
          <HelpCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        <button
          onClick={() => setShowSettings(true)}
          aria-label="Game settings"
          title="Settings"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-950/60 border border-amber-700/50 text-amber-300 hover:text-amber-100 hover:bg-amber-900/60 flex items-center justify-center transition active:scale-90"
        >
          <Settings className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>
      </div>
    </header>
  );
};
