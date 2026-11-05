import React from 'react';
import { useGameStore } from '../store/gameStore';
import { countTrappedTigers } from '../game/rules';
import { TOTAL_GOATS, GOATS_NEEDED_FOR_TIGER_WIN } from '../game/constants';
import { Loader2, Users } from 'lucide-react';

export const Scoreboard: React.FC = () => {
  const turn = useGameStore(s => s.turn);
  const phase = useGameStore(s => s.phase);
  const unplacedGoats = useGameStore(s => s.unplacedGoats);
  const capturedGoats = useGameStore(s => s.capturedGoats);
  const board = useGameStore(s => s.board);
  const mode = useGameStore(s => s.mode);
  const playerRole = useGameStore(s => s.playerRole);
  const isAiThinking = useGameStore(s => s.isAiThinking);
  const aiDifficulty = useGameStore(s => s.aiDifficulty);
  const matchScore = useGameStore(s => s.matchScore);

  const placedCount = TOTAL_GOATS - unplacedGoats;
  const trappedTigers = countTrappedTigers(board);
  const isGoatTurn = turn === 'GOAT';

  // Human readable turn description
  let turnTitle = '';
  let turnSubtitle = '';

  if (mode === 'PVP') {
    turnTitle = isGoatTurn ? 'Player 1: Goats (बाख्रा)' : 'Player 2: Tigers (बाघ)';
    turnSubtitle = isGoatTurn 
      ? (phase === 'PLACEMENT' ? 'Tap empty point to place goat' : 'Move goat 1 step')
      : 'Move tiger or jump to capture';
  } else {
    if (turn === playerRole) {
      turnTitle = `Your Turn (${turn === 'GOAT' ? 'Goats' : 'Tigers'})`;
    } else {
      turnTitle = `AI ${turn === 'GOAT' ? 'Goat' : 'Tiger'} (${aiDifficulty})`;
    }
    turnSubtitle = phase === 'PLACEMENT'
      ? (isGoatTurn ? 'Tap empty point to place goat' : 'Move or leap to capture')
      : (isGoatTurn ? 'Move goat to adjacent empty point' : 'Move or leap to capture');
  }

  return (
    <div className="w-full max-w-xl mx-auto px-2.5 sm:px-4 py-1.5 shrink-0">
      {/* Turn Banner & Phase Indicator */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#200D05] via-[#2D1307] to-[#200D05] border border-amber-800/40 p-2.5 sm:p-3 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          {/* Active Player Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div 
              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-md border shrink-0 transition-all duration-300 ${
                isGoatTurn
                  ? 'bg-amber-100/90 border-amber-300 ring-2 ring-amber-400/50 text-stone-900 shadow-amber-400/20'
                  : 'bg-gradient-to-br from-amber-600 to-red-600 border-amber-400 ring-2 ring-red-500/50 text-white shadow-red-500/20'
              }`}
            >
              {isGoatTurn ? '🐐' : '🐅'}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-amber-100 tracking-wide truncate">
                  {turnTitle}
                </span>
                {isAiThinking && (
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-amber-400 animate-pulse">
                    <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin" />
                    <span>Thinking...</span>
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-amber-300/70 truncate">
                {turnSubtitle}
              </p>
            </div>
          </div>

          {/* Phase Badge */}
          <div className="text-right shrink-0 pl-1">
            <div className="text-[9px] sm:text-[11px] font-semibold text-amber-400/90 uppercase tracking-wider font-mono leading-none">
              {phase === 'PLACEMENT' ? 'Phase 1: Placing' : 'Phase 2: Moving'}
            </div>
            <div className="text-[10px] sm:text-xs font-medium text-amber-200/80 mt-0.5">
              {phase === 'PLACEMENT' ? (
                <span>{placedCount}/20 goats</span>
              ) : (
                <span className="text-emerald-400 font-semibold">20/20 placed</span>
              )}
            </div>
          </div>
        </div>

        {/* Tactical Counters Strip */}
        <div className="mt-2 pt-1.5 border-t border-amber-900/40 grid grid-cols-2 gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
          {/* Captures Meter (Tiger Win Condition) */}
          <div className="flex items-center justify-between bg-black/40 px-2 sm:px-2.5 py-1.5 rounded-xl border border-red-950/60 min-h-[32px]">
            <div className="flex items-center gap-1">
              <span className="text-red-400 font-semibold text-[10px] sm:text-xs">Captures:</span>
              <span className="font-bold text-white font-mono tabular-nums text-xs sm:text-sm">
                {capturedGoats}/{GOATS_NEEDED_FOR_TIGER_WIN}
              </span>
            </div>
            <div className="flex items-center gap-1" aria-hidden="true">
              {Array.from({ length: GOATS_NEEDED_FOR_TIGER_WIN }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border transition-colors ${
                    i < capturedGoats
                      ? 'bg-red-500 border-red-300 shadow-sm shadow-red-500/50'
                      : 'bg-stone-800/80 border-stone-600/50'
                  }`}
                  title={i < capturedGoats ? 'Captured Goat' : 'Uncaptured'}
                />
              ))}
            </div>
          </div>

          {/* Trapped Tigers Meter (Goat Win Condition) */}
          <div className="flex items-center justify-between bg-black/40 px-2 sm:px-2.5 py-1.5 rounded-xl border border-amber-950/60 min-h-[32px]">
            <div className="flex items-center gap-1">
              <span className="text-amber-400 font-semibold text-[10px] sm:text-xs">Trapped:</span>
              <span className="font-bold text-white font-mono tabular-nums text-xs sm:text-sm">
                {trappedTigers}/4
              </span>
            </div>
            <div className="flex items-center gap-1" aria-hidden="true">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border transition-colors ${
                    i < trappedTigers
                      ? 'bg-emerald-500 border-emerald-300 shadow-sm shadow-emerald-500/50'
                      : 'bg-stone-800/80 border-stone-600/50'
                  }`}
                  title={i < trappedTigers ? 'Trapped Tiger' : 'Free Tiger'}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 2-Player Match Series Score Tracker */}
        {mode === 'PVP' && (matchScore.goatWins > 0 || matchScore.tigerWins > 0 || matchScore.draws > 0) && (
          <div className="mt-1.5 pt-1 border-t border-amber-900/30 flex items-center justify-between text-[10px] sm:text-[11px] text-amber-300/80 font-mono">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-amber-400" />
              <span>Series:</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span>Goats: <strong className="text-white">{matchScore.goatWins}</strong></span>
              <span>Tigers: <strong className="text-white">{matchScore.tigerWins}</strong></span>
              {matchScore.draws > 0 && <span>Draws: {matchScore.draws}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
