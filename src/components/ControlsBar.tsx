import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Undo2, RotateCcw, ScrollText, Volume2, VolumeX, AlertTriangle } from 'lucide-react';

export const ControlsBar: React.FC = () => {
  const undo = useGameStore(s => s.undo);
  const restartGame = useGameStore(s => s.restartGame);
  const snapshotHistory = useGameStore(s => s.snapshotHistory);
  const isAiThinking = useGameStore(s => s.isAiThinking);
  const status = useGameStore(s => s.status);
  const soundEnabled = useGameStore(s => s.soundEnabled);
  const toggleSound = useGameStore(s => s.toggleSound);
  const setShowHistory = useGameStore(s => s.setShowHistory);
  const moveHistory = useGameStore(s => s.moveHistory);

  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  const canUndo = snapshotHistory.length > 0 && !isAiThinking && status === 'PLAYING';

  const handleRestart = () => {
    restartGame();
    setShowRestartConfirm(false);
  };

  return (
    <>
      <nav 
        aria-label="Game controls"
        className="w-full max-w-xl mx-auto px-2.5 sm:px-4 py-1.5 pb-safe flex items-center justify-between gap-1.5 sm:gap-2 shrink-0 bg-[#160A04]/90 backdrop-blur-md border-t border-amber-950/60"
      >
        {/* Undo Button */}
        <button
          onClick={undo}
          disabled={!canUndo}
          aria-label="Undo last move"
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2.5 px-2 rounded-2xl border text-xs sm:text-xs font-semibold transition active:scale-95 min-h-[46px] select-none ${
            canUndo
              ? 'bg-[#2A1208] border-amber-700/60 text-amber-200 hover:bg-amber-900/60 shadow-sm active:bg-amber-800'
              : 'bg-black/20 border-white/5 text-stone-600 cursor-not-allowed opacity-40'
          }`}
        >
          <Undo2 className="w-4 h-4 shrink-0" />
          <span>Undo</span>
        </button>

        {/* Move History Log Button */}
        <button
          onClick={() => setShowHistory(true)}
          aria-label="View move history log"
          className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2.5 px-2 rounded-2xl bg-[#2A1208] border border-amber-700/60 text-amber-200 hover:bg-amber-900/60 text-xs sm:text-xs font-semibold transition active:scale-95 min-h-[46px] select-none"
        >
          <ScrollText className="w-4 h-4 shrink-0" />
          <span>Moves ({moveHistory.length})</span>
        </button>

        {/* Restart Button */}
        <button
          onClick={() => {
            if (moveHistory.length === 0) {
              restartGame();
            } else {
              setShowRestartConfirm(true);
            }
          }}
          disabled={isAiThinking}
          aria-label="Restart Bagh Chal game"
          className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2.5 px-2 rounded-2xl bg-[#2A1208] border border-amber-700/60 text-amber-200 hover:bg-amber-900/60 text-xs sm:text-xs font-semibold transition active:scale-95 min-h-[46px] select-none"
        >
          <RotateCcw className="w-4 h-4 shrink-0" />
          <span>Restart</span>
        </button>

        {/* Quick Audio Mute Toggle */}
        <button
          onClick={toggleSound}
          aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          title={soundEnabled ? 'Mute sound' : 'Enable sound'}
          className="w-12 h-[46px] rounded-2xl bg-[#2A1208] border border-amber-700/60 text-amber-300 hover:text-amber-100 hover:bg-amber-900/60 flex items-center justify-center transition active:scale-95 shrink-0 select-none"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
        </button>
      </nav>

      {/* Restart Confirmation Dialog */}
      {showRestartConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="restart-dialog-title"
        >
          <div className="w-full max-w-xs rounded-3xl bg-[#240F06] border border-amber-600/70 p-5 text-amber-100 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-amber-400 mb-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 id="restart-dialog-title" className="text-sm font-bold">Restart Game?</h3>
            </div>
            <p className="text-xs text-amber-200/80 mb-5 leading-relaxed">
              Reset the current match and start a fresh round of Bagh Chal?
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRestartConfirm(false)}
                className="flex-1 min-h-[44px] py-2 rounded-xl bg-black/40 border border-amber-800/60 text-amber-300 hover:bg-black/60 text-xs font-semibold transition active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleRestart}
                className="flex-1 min-h-[44px] py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-md active:scale-95"
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
