import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../store/gameStore';
import { countTrappedTigers } from '../game/rules';
import heroImage from '../assets/images/bagh_chal_hero_1791626493911.jpg';
import { RotateCcw, Eye } from 'lucide-react';

export const GameOverModal: React.FC = () => {
  const status = useGameStore(s => s.status);
  const restartGame = useGameStore(s => s.restartGame);
  const moveHistory = useGameStore(s => s.moveHistory);
  const capturedGoats = useGameStore(s => s.capturedGoats);
  const board = useGameStore(s => s.board);
  const mode = useGameStore(s => s.mode);
  const playerRole = useGameStore(s => s.playerRole);
  const matchScore = useGameStore(s => s.matchScore);

  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (status !== 'PLAYING') {
      setDismissed(false);
      // Trigger festive victory confetti
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#EF4444', '#10B981', '#FDE68A', '#78350F'],
      });
    }
  }, [status]);

  if (status === 'PLAYING' || dismissed) {
    return null;
  }

  const trappedTigers = countTrappedTigers(board);

  let title = '';
  let subtitle = '';
  let winnerIcon = '🏆';
  let bannerTheme = 'border-amber-600/80';

  if (status === 'TIGER_WON') {
    title = 'Tigers Triumphant!';
    subtitle = 'The Royal Tigers have successfully captured 5 goats and claimed the kingdom.';
    winnerIcon = '🐅';
    bannerTheme = 'border-red-600/80';
  } else if (status === 'GOAT_WON') {
    title = 'Goats Prevail!';
    subtitle = 'All 4 tigers have been completely encircled and immobilized by the vigilant herd.';
    winnerIcon = '🐐';
    bannerTheme = 'border-emerald-600/80';
  } else {
    title = 'Peaceful Draw';
    subtitle = 'The match has concluded in a draw due to threefold repetition of positions.';
    winnerIcon = '⚖️';
    bannerTheme = 'border-amber-500/80';
  }

  // Winner evaluation for 2-Player vs AI
  let pveResult = '';
  if (mode === 'PVP') {
    if (status === 'TIGER_WON') {
      pveResult = `Player 2 (Tigers) Wins! Series: Goats ${matchScore.goatWins} - ${matchScore.tigerWins} Tigers`;
    } else if (status === 'GOAT_WON') {
      pveResult = `Player 1 (Goats) Wins! Series: Goats ${matchScore.goatWins} - ${matchScore.tigerWins} Tigers`;
    } else {
      pveResult = `Game Drawn! Series: Goats ${matchScore.goatWins} - ${matchScore.tigerWins} Tigers`;
    }
  } else {
    if (
      (status === 'TIGER_WON' && playerRole === 'TIGER') ||
      (status === 'GOAT_WON' && playerRole === 'GOAT')
    ) {
      pveResult = 'Victory! You defeated the AI.';
    } else if (status === 'DRAW_REPETITION') {
      pveResult = 'Drawn against the AI.';
    } else {
      pveResult = 'Defeat. The AI prevailed this time.';
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gameover-title"
    >
      <div className={`w-full max-w-sm rounded-3xl bg-[#261005] border-2 ${bannerTheme} overflow-hidden shadow-2xl text-amber-100`}>
        {/* Cultural Hero Image Header */}
        <div className="relative h-36 w-full overflow-hidden bg-black/40">
          <img 
            src={heroImage} 
            alt="Traditional Nepali Tiger and Goat Artwork" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#261005] via-[#261005]/50 to-transparent" />
          
          <div className="absolute bottom-2 left-4 right-4 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-950/90 border border-amber-500/60 flex items-center justify-center text-2xl shadow-lg">
              {winnerIcon}
            </div>
            <div>
              <h2 id="gameover-title" className="text-lg font-black text-amber-100 font-cinzel leading-tight drop-shadow">
                {title}
              </h2>
              {pveResult && (
                <p className="text-xs font-semibold text-amber-300 drop-shadow">
                  {pveResult}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-amber-200/80 leading-relaxed">
            {subtitle}
          </p>

          {/* Match Statistics */}
          <div className="grid grid-cols-3 gap-2 bg-black/40 p-3 rounded-2xl border border-amber-900/60 text-center">
            <div>
              <div className="text-[10px] uppercase font-semibold text-amber-400/80">Moves</div>
              <div className="text-base font-bold text-white font-mono tabular-nums">{moveHistory.length}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-red-400/80">Captures</div>
              <div className="text-base font-bold text-white font-mono tabular-nums">{capturedGoats} / 5</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-emerald-400/80">Trapped</div>
              <div className="text-base font-bold text-white font-mono tabular-nums">{trappedTigers} / 4</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setDismissed(true)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-black/40 hover:bg-black/60 border border-amber-700/60 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Eye className="w-4 h-4" />
              <span>Review Board</span>
            </button>

            <button
              onClick={restartGame}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg shadow-amber-900/50 flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
