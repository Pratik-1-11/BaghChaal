import React from 'react';
import { useGameStore } from '../store/gameStore';
import { PWAInstallButton } from './PWAInstallButton';
import { X, Volume2, Smartphone, HelpCircle } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const showSettings = useGameStore(s => s.showSettings);
  const setShowSettings = useGameStore(s => s.setShowSettings);
  const setShowTutorial = useGameStore(s => s.setShowTutorial);

  const mode = useGameStore(s => s.mode);
  const setMode = useGameStore(s => s.setMode);
  const aiDifficulty = useGameStore(s => s.aiDifficulty);
  const setAiDifficulty = useGameStore(s => s.setAiDifficulty);
  const playerRole = useGameStore(s => s.playerRole);
  const setPlayerRole = useGameStore(s => s.setPlayerRole);
  const boardTheme = useGameStore(s => s.boardTheme);
  const setBoardTheme = useGameStore(s => s.setBoardTheme);
  const soundEnabled = useGameStore(s => s.soundEnabled);
  const toggleSound = useGameStore(s => s.toggleSound);
  const hapticsEnabled = useGameStore(s => s.hapticsEnabled);
  const toggleHaptics = useGameStore(s => s.toggleHaptics);

  if (!showSettings) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl bg-[#261005] border border-amber-600/70 p-4 sm:p-5 text-amber-100 shadow-2xl flex flex-col max-h-[88vh] sm:max-h-[90vh] pb-safe">
        {/* Mobile Drag Handle */}
        <div className="w-10 h-1 rounded-full bg-amber-600/40 mx-auto mb-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-amber-800/40">
          <h3 id="settings-title" className="text-sm sm:text-base font-bold text-amber-100 font-cinzel">
            Game Settings
          </h3>
          <button
            onClick={() => setShowSettings(false)}
            aria-label="Close settings"
            className="w-9 h-9 rounded-xl text-amber-400 hover:text-white hover:bg-amber-900/50 flex items-center justify-center active:scale-90 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="py-3 space-y-3.5 overflow-y-auto flex-1 text-xs">
          {/* Game Mode */}
          <div>
            <label className="font-semibold text-amber-200 block mb-1.5 text-xs">Game Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('PVE')}
                className={`py-2.5 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition min-h-[44px] active:scale-95 ${
                  mode === 'PVE'
                    ? 'bg-amber-600 border-amber-400 text-white shadow'
                    : 'bg-black/30 border-amber-900/50 text-amber-300 hover:bg-black/50'
                }`}
              >
                <span>vs AI Opponent</span>
              </button>
              <button
                onClick={() => setMode('PVP')}
                className={`py-2.5 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition min-h-[44px] active:scale-95 ${
                  mode === 'PVP'
                    ? 'bg-amber-600 border-amber-400 text-white shadow'
                    : 'bg-black/30 border-amber-900/50 text-amber-300 hover:bg-black/50'
                }`}
              >
                <span>Pass & Play</span>
              </button>
            </div>
          </div>

          {/* AI Settings (only in vs AI mode) */}
          {mode === 'PVE' && (
            <>
              <div>
                <label className="font-semibold text-amber-200 block mb-1.5 text-xs">
                  Play As
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPlayerRole('GOAT')}
                    className={`py-2.5 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition min-h-[44px] active:scale-95 ${
                      playerRole === 'GOAT'
                        ? 'bg-amber-100 border-amber-300 text-stone-900 font-bold shadow'
                        : 'bg-black/30 border-amber-900/50 text-amber-300 hover:bg-black/50'
                    }`}
                  >
                    <span>🐐 Goats (20)</span>
                  </button>
                  <button
                    onClick={() => setPlayerRole('TIGER')}
                    className={`py-2.5 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition min-h-[44px] active:scale-95 ${
                      playerRole === 'TIGER'
                        ? 'bg-red-600 border-red-400 text-white font-bold shadow'
                        : 'bg-black/30 border-amber-900/50 text-amber-300 hover:bg-black/50'
                    }`}
                  >
                    <span>🐅 Tigers (4)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-amber-200 block mb-1.5 text-xs">
                  AI Difficulty (Minimax Alpha-Beta)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['EASY', 'MEDIUM', 'HARD'] as const).map(diff => (
                    <button
                      key={diff}
                      onClick={() => setAiDifficulty(diff)}
                      className={`py-2.5 px-2 rounded-xl border font-bold text-center transition min-h-[44px] active:scale-95 ${
                        aiDifficulty === diff
                          ? 'bg-amber-600 border-amber-400 text-white shadow'
                          : 'bg-black/30 border-amber-900/50 text-amber-300 hover:bg-black/50'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[10px] text-amber-400/70">
                  {aiDifficulty === 'EASY' && 'Casual: Random and opportunistic moves.'}
                  {aiDifficulty === 'MEDIUM' && 'Balanced: Minimax depth 3 calculation.'}
                  {aiDifficulty === 'HARD' && 'Master: Minimax depth 5 with alpha-beta.'}
                </p>
              </div>
            </>
          )}

          {/* Board Theme */}
          <div>
            <label className="font-semibold text-amber-200 block mb-1.5 text-xs">Board Appearance</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setBoardTheme('wood')}
                className={`py-2.5 px-3 rounded-xl border font-medium flex items-center justify-center gap-1.5 transition min-h-[44px] active:scale-95 ${
                  boardTheme === 'wood'
                    ? 'bg-amber-800 border-amber-400 text-amber-100 shadow'
                    : 'bg-black/30 border-amber-900/50 text-amber-300 hover:bg-black/50'
                }`}
              >
                <span>🪵 Teak Wood</span>
              </button>
              <button
                onClick={() => setBoardTheme('slate')}
                className={`py-2.5 px-3 rounded-xl border font-medium flex items-center justify-center gap-1.5 transition min-h-[44px] active:scale-95 ${
                  boardTheme === 'slate'
                    ? 'bg-slate-700 border-slate-400 text-white shadow'
                    : 'bg-black/30 border-amber-900/50 text-amber-300 hover:bg-black/50'
                }`}
              >
                <span>🪨 Ancient Slate</span>
              </button>
            </div>
          </div>

          {/* Audio & Tactile Switches */}
          <div className="space-y-2 pt-1 border-t border-amber-900/40">
            <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-xl border border-amber-900/50 min-h-[46px]">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span className="font-medium text-xs">Sound Effects</span>
              </div>
              <button
                onClick={toggleSound}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  soundEnabled ? 'bg-amber-600' : 'bg-stone-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    soundEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-xl border border-amber-900/50 min-h-[46px]">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span className="font-medium text-xs">Haptic Feedback</span>
              </div>
              <button
                onClick={toggleHaptics}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  hapticsEnabled ? 'bg-amber-600' : 'bg-stone-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    hapticsEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Help & PWA */}
          <div className="pt-2 border-t border-amber-900/40 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setShowSettings(false);
                setShowTutorial(true);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-black/40 hover:bg-black/60 border border-amber-800/60 text-amber-300 font-semibold flex items-center justify-center gap-1.5 transition min-h-[44px] active:scale-95"
            >
              <HelpCircle className="w-4 h-4" />
              <span>How to Play</span>
            </button>
            <div className="flex-1">
              <PWAInstallButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
