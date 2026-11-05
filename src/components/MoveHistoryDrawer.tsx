import React from 'react';
import { useGameStore } from '../store/gameStore';
import { X, ScrollText } from 'lucide-react';

export const MoveHistoryDrawer: React.FC = () => {
  const showHistory = useGameStore(s => s.showHistory);
  const setShowHistory = useGameStore(s => s.setShowHistory);
  const moveHistory = useGameStore(s => s.moveHistory);

  if (!showHistory) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-title"
    >
      <div className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl bg-[#261005] border border-amber-600/70 p-4 sm:p-5 text-amber-100 shadow-2xl flex flex-col max-h-[85vh] pb-safe">
        {/* Mobile Drag Handle */}
        <div className="w-10 h-1 rounded-full bg-amber-600/40 mx-auto mb-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-amber-800/40">
          <div className="flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-amber-400" />
            <h3 id="history-title" className="text-sm sm:text-base font-bold text-amber-100 font-cinzel">
              Move History ({moveHistory.length})
            </h3>
          </div>
          <button
            onClick={() => setShowHistory(false)}
            aria-label="Close move history"
            className="w-9 h-9 rounded-xl text-amber-400 hover:text-white hover:bg-amber-900/50 flex items-center justify-center active:scale-90 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Moves List */}
        <div className="py-3 overflow-y-auto flex-1 space-y-1.5 font-mono text-xs">
          {moveHistory.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-xs">
              No moves played yet. Start placing goats!
            </div>
          ) : (
            <div className="divide-y divide-amber-900/30">
              {moveHistory.map((m, idx) => {
                const isGoat = m.piece === 'GOAT';
                const isCapture = m.type === 'CAPTURE';

                return (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between py-2 px-1 hover:bg-white/5 rounded-lg transition min-h-[36px]"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-amber-500/70 w-6 tabular-nums">{idx + 1}.</span>
                      <span className="text-sm">{isGoat ? '🐐' : '🐅'}</span>
                      <span className={`font-semibold ${isCapture ? 'text-red-400 font-bold' : isGoat ? 'text-amber-200' : 'text-orange-300'}`}>
                        {m.notation}
                      </span>
                    </div>

                    {isCapture && (
                      <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-700/60 text-[10px] text-red-300 font-sans font-bold">
                        Capture
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2.5 border-t border-amber-800/40">
          <button
            onClick={() => setShowHistory(false)}
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow transition min-h-[44px] active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
