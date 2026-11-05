import React, { useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { BOARD_SIZE, TOTAL_POINTS, indexToCoords, getPointLabel } from '../game/constants';
import { isTigerTrapped } from '../game/rules';
import { RotateCcw } from 'lucide-react';

export const GameBoard: React.FC = () => {
  const board = useGameStore(s => s.board);
  const selectedPoint = useGameStore(s => s.selectedPoint);
  const validWalkDestinations = useGameStore(s => s.validWalkDestinations);
  const validCaptureDestinations = useGameStore(s => s.validCaptureDestinations);
  const handlePointClick = useGameStore(s => s.handlePointClick);
  const clearSelection = useGameStore(s => s.clearSelection);
  const boardTheme = useGameStore(s => s.boardTheme);
  const isAiThinking = useGameStore(s => s.isAiThinking);
  const moveHistory = useGameStore(s => s.moveHistory);
  const mode = useGameStore(s => s.mode);
  const boardRotation = useGameStore(s => s.boardRotation);
  const toggleBoardRotation = useGameStore(s => s.toggleBoardRotation);
  const autoFlipIn2Player = useGameStore(s => s.autoFlipIn2Player);
  const toggleAutoFlip = useGameStore(s => s.toggleAutoFlip);

  // Keyboard navigation focus state
  const [focusedIndex, setFocusedIndex] = useState<number>(12); // center C3
  const boardRef = useRef<HTMLDivElement>(null);

  // SVG Geometry constants (500x500 coordinate space)
  const PADDING = 50;
  const STEP = 100;

  const getSvgCoords = (idx: number) => {
    const { row, col } = indexToCoords(idx);
    return {
      x: PADDING + col * STEP,
      y: PADDING + row * STEP,
    };
  };

  // Keyboard controls handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const { row, col } = indexToCoords(focusedIndex);
    let nextRow = row;
    let nextCol = col;

    switch (e.key) {
      case 'ArrowUp':
        nextRow = Math.max(0, row - 1);
        e.preventDefault();
        break;
      case 'ArrowDown':
        nextRow = Math.min(BOARD_SIZE - 1, row + 1);
        e.preventDefault();
        break;
      case 'ArrowLeft':
        nextCol = Math.max(0, col - 1);
        e.preventDefault();
        break;
      case 'ArrowRight':
        nextCol = Math.min(BOARD_SIZE - 1, col + 1);
        e.preventDefault();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handlePointClick(focusedIndex);
        return;
      case 'Escape':
        e.preventDefault();
        clearSelection();
        return;
      default:
        return;
    }

    const nextIndex = nextRow * BOARD_SIZE + nextCol;
    setFocusedIndex(nextIndex);
  };

  const lastMove = moveHistory.length > 0 ? moveHistory[moveHistory.length - 1] : null;

  return (
    <div 
      ref={boardRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Bagh Chal Board. Use arrow keys to navigate intersections, Enter to select or move."
      className="w-full flex flex-col items-center justify-center outline-none px-2 sm:px-4 select-none touch-none"
    >
      {/* 2-Player Tabletop Controls Bar */}
      {mode === 'PVP' && (
        <div className="w-full max-w-[min(90vw,420px)] flex items-center justify-between px-2 mb-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-amber-300/80 font-medium text-[11px] sm:text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Pass & Play</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleAutoFlip}
              title="Automatically rotate board on turn switch"
              className={`px-2 py-1 rounded-lg border text-[11px] font-semibold transition active:scale-95 min-h-[32px] flex items-center ${
                autoFlipIn2Player
                  ? 'bg-amber-600/80 border-amber-400 text-white'
                  : 'bg-black/30 border-amber-900/50 text-amber-400/80'
              }`}
            >
              Flip: {autoFlipIn2Player ? 'Auto' : 'Off'}
            </button>

            <button
              onClick={toggleBoardRotation}
              title="Rotate board 180 degrees"
              aria-label="Rotate board 180 degrees"
              className="px-2 py-1 rounded-lg bg-black/40 border border-amber-800/60 text-amber-300 hover:text-white flex items-center gap-1 text-[11px] font-medium transition active:scale-95 min-h-[32px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rotate</span>
            </button>
          </div>
        </div>
      )}

      {/* Board Container with Responsive Viewport Calculation */}
      <div 
        style={{
          transform: `rotate(${boardRotation}deg)`,
          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`relative aspect-square w-full max-w-[min(90vw,54vh,440px)] rounded-3xl shadow-2xl overflow-hidden border-3 sm:border-4 duration-500 select-none ${
          boardTheme === 'wood'
            ? 'wood-board-pattern border-[#78350F] shadow-amber-950/80'
            : 'bg-[#1E252B] border-[#475569] shadow-slate-950/80'
        }`}
      >
        {/* Subtle Decorative Mandala Background Rings */}
        <div className="absolute inset-0 pointer-events-none opacity-15 flex items-center justify-center">
          <div className="w-[85%] h-[85%] rounded-full border border-amber-400 border-dashed animate-spin-slow" />
          <div className="absolute w-[60%] h-[60%] rounded-full border border-amber-300" />
        </div>

        {/* SVG Board Lines & Intersections */}
        <svg 
          viewBox="0 0 500 500" 
          className="w-full h-full relative z-10 filter drop-shadow-md select-none touch-none"
        >
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={boardTheme === 'wood' ? '#D97706' : '#94A3B8'} />
              <stop offset="50%" stopColor={boardTheme === 'wood' ? '#F59E0B' : '#CBD5E1'} />
              <stop offset="100%" stopColor={boardTheme === 'wood' ? '#92400E' : '#64748B'} />
            </linearGradient>

            <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>

            <radialGradient id="tigerPieceGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FED7AA" />
              <stop offset="35%" stopColor="#F97316" />
              <stop offset="85%" stopColor="#C2410C" />
              <stop offset="100%" stopColor="#7C2D12" />
            </radialGradient>

            <radialGradient id="goatPieceGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#FEF3C7" />
              <stop offset="85%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </radialGradient>

            <filter id="pieceShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.65"/>
            </filter>
          </defs>

          {/* Traditional Brass Corner Plates */}
          <g fill="url(#brassGrad)" opacity="0.85">
            <polygon points="26,26 62,26 44,44 26,62" />
            <circle cx="38" cy="38" r="3.5" fill="#451A03" />
            <polygon points="474,26 438,26 456,44 474,62" />
            <circle cx="462" cy="38" r="3.5" fill="#451A03" />
            <polygon points="26,474 62,474 44,456 26,438" />
            <circle cx="38" cy="462" r="3.5" fill="#451A03" />
            <polygon points="474,474 438,474 456,456 474,438" />
            <circle cx="462" cy="462" r="3.5" fill="#451A03" />
          </g>

          {/* Engraved Coordinate Identifiers (A-E and 1-5) */}
          <g 
            fontFamily="monospace" 
            fontSize="13" 
            fontWeight="bold" 
            fill={boardTheme === 'wood' ? '#D97706' : '#94A3B8'} 
            opacity="0.8" 
            textAnchor="middle" 
            dominantBaseline="middle"
          >
            {['A', 'B', 'C', 'D', 'E'].map((letter, i) => {
              const xPos = PADDING + i * STEP;
              return (
                <React.Fragment key={`col-label-${letter}`}>
                  <text x={xPos} y="25">{letter}</text>
                  <text x={xPos} y="475">{letter}</text>
                </React.Fragment>
              );
            })}
            {['1', '2', '3', '4', '5'].map((num, i) => {
              const yPos = PADDING + i * STEP;
              return (
                <React.Fragment key={`row-label-${num}`}>
                  <text x="25" y={yPos}>{num}</text>
                  <text x="475" y={yPos}>{num}</text>
                </React.Fragment>
              );
            })}
          </g>

          {/* Depth Relief Groove Shadows */}
          <g stroke="#180702" strokeWidth="5.5" strokeLinecap="round" opacity="0.9">
            <line x1="50" y1="50" x2="450" y2="50" />
            <line x1="50" y1="150" x2="450" y2="150" />
            <line x1="50" y1="250" x2="450" y2="250" />
            <line x1="50" y1="350" x2="450" y2="350" />
            <line x1="50" y1="450" x2="450" y2="450" />

            <line x1="50" y1="50" x2="50" y2="450" />
            <line x1="150" y1="50" x2="150" y2="450" />
            <line x1="250" y1="50" x2="250" y2="450" />
            <line x1="350" y1="50" x2="350" y2="450" />
            <line x1="450" y1="50" x2="450" y2="450" />

            <line x1="50" y1="50" x2="450" y2="450" />
            <line x1="450" y1="50" x2="50" y2="450" />

            <line x1="250" y1="50" x2="50" y2="250" />
            <line x1="50" y1="250" x2="250" y2="450" />
            <line x1="250" y1="450" x2="450" y2="250" />
            <line x1="450" y1="250" x2="250" y2="50" />
          </g>

          {/* Visible Metallic Lines */}
          <g stroke="url(#lineGrad)" strokeWidth="3.5" strokeLinecap="round" opacity="0.95">
            <line x1="50" y1="50" x2="450" y2="50" />
            <line x1="50" y1="150" x2="450" y2="150" />
            <line x1="50" y1="250" x2="450" y2="250" />
            <line x1="50" y1="350" x2="450" y2="350" />
            <line x1="50" y1="450" x2="450" y2="450" />

            <line x1="50" y1="50" x2="50" y2="450" />
            <line x1="150" y1="50" x2="150" y2="450" />
            <line x1="250" y1="50" x2="250" y2="450" />
            <line x1="350" y1="50" x2="350" y2="450" />
            <line x1="450" y1="50" x2="450" y2="450" />

            <line x1="50" y1="50" x2="450" y2="450" />
            <line x1="450" y1="50" x2="50" y2="450" />

            <line x1="250" y1="50" x2="50" y2="250" />
            <line x1="50" y1="250" x2="250" y2="450" />
            <line x1="250" y1="450" x2="450" y2="250" />
            <line x1="450" y1="250" x2="250" y2="50" />
          </g>

          {/* Brass Intersection Studs */}
          {Array.from({ length: TOTAL_POINTS }).map((_, idx) => {
            const { x, y } = getSvgCoords(idx);
            return (
              <g key={`pin-${idx}`}>
                <circle cx={x} cy={y} r="6.5" fill="#1C0A03" stroke="url(#brassGrad)" strokeWidth="1.8" opacity="0.95" />
                <circle cx={x} cy={y} r="2.2" fill="#FDE68A" opacity="0.85" />
              </g>
            );
          })}

          {/* Destination Highlights */}
          {validWalkDestinations.map(destIdx => {
            const { x, y } = getSvgCoords(destIdx);
            return (
              <g key={`walk-dest-${destIdx}`} className="pointer-events-none">
                <circle 
                  cx={x} 
                  cy={y} 
                  r="26" 
                  fill="none" 
                  stroke="#10B981" 
                  strokeWidth="3.5" 
                  strokeDasharray="4 3" 
                  className="animate-spin-slow"
                />
                <circle cx={x} cy={y} r="18" fill="rgba(16, 185, 129, 0.3)" />
                <circle cx={x} cy={y} r="6" fill="#34D399" />
              </g>
            );
          })}

          {Object.entries(validCaptureDestinations).map(([destStr]) => {
            const destIdx = Number(destStr);
            const { x, y } = getSvgCoords(destIdx);
            return (
              <g key={`capture-dest-${destIdx}`} className="pointer-events-none">
                <circle 
                  cx={x} 
                  cy={y} 
                  r="28" 
                  fill="none" 
                  stroke="#EF4444" 
                  strokeWidth="4" 
                  strokeDasharray="6 3" 
                />
                <circle cx={x} cy={y} r="20" fill="rgba(239, 68, 68, 0.35)" />
                <line x1={x - 12} y1={y} x2={x + 12} y2={y} stroke="#EF4444" strokeWidth="3" />
                <line x1={x} y1={y - 12} x2={x} y2={y + 12} stroke="#EF4444" strokeWidth="3" />
              </g>
            );
          })}

          {/* Interactive Nodes & Touch Hitboxes */}
          {Array.from({ length: TOTAL_POINTS }).map((_, idx) => {
            const { x, y } = getSvgCoords(idx);
            const piece = board[idx];
            const isSelected = selectedPoint === idx;
            const isWalkTarget = validWalkDestinations.includes(idx);
            const isCaptureTarget = validCaptureDestinations[idx] !== undefined;
            const isKeyboardFocused = focusedIndex === idx;
            const isTiger = piece === 'TIGER';
            const isGoat = piece === 'GOAT';
            const trapped = isTiger && isTigerTrapped(board, idx);
            const isLastMoveDestination = lastMove && lastMove.to === idx;

            const pointLabel = getPointLabel(idx);
            let ariaLabel = `Point ${pointLabel}`;
            if (isTiger) {
              ariaLabel += trapped ? ', Tiger trapped' : ', Tiger';
            } else if (isGoat) {
              ariaLabel += ', Goat';
            } else {
              ariaLabel += ', Empty';
            }
            if (isWalkTarget) ariaLabel += ', Legal move destination';
            if (isCaptureTarget) ariaLabel += ', Legal tiger capture destination';

            return (
              <g 
                key={`point-${idx}`}
                onClick={() => handlePointClick(idx)}
                className="cursor-pointer focus:outline-none"
                role="button"
                aria-label={ariaLabel}
                aria-pressed={isSelected}
              >
                {/* Generous Touch Target Hitbox (r=36 -> 72px touch circle on mobile) */}
                <circle 
                  cx={x} 
                  cy={y} 
                  r="36" 
                  fill="transparent" 
                />

                {/* Keyboard Navigation Focus Indicator */}
                {isKeyboardFocused && (
                  <circle 
                    cx={x} 
                    cy={y} 
                    r="27" 
                    fill="none" 
                    stroke="#F59E0B" 
                    strokeWidth="2.5" 
                    strokeDasharray="3 3"
                    className="pointer-events-none"
                  />
                )}

                {/* Last Move Destination Marker */}
                {isLastMoveDestination && piece !== 'EMPTY' && (
                  <circle 
                    cx={x} 
                    cy={y} 
                    r="25" 
                    fill="none" 
                    stroke="#FBBF24" 
                    strokeWidth="2" 
                    opacity="0.75"
                    className="pointer-events-none"
                  />
                )}

                {/* Selected Piece Radiating Halo */}
                {isSelected && (
                  <g className="pointer-events-none">
                    <circle 
                      cx={x} 
                      cy={y} 
                      r="26" 
                      fill="none" 
                      stroke="#F59E0B" 
                      strokeWidth="3.5" 
                      className="pulse-target"
                    />
                    <circle cx={x} cy={y} r="33" fill="none" stroke="#FDE68A" strokeWidth="1.5" opacity="0.6" />
                  </g>
                )}

                {/* PIECE: TIGER */}
                {isTiger && (
                  <g filter="url(#pieceShadow)">
                    <circle 
                      cx={x} 
                      cy={y} 
                      r="21" 
                      fill="url(#tigerPieceGrad)" 
                      stroke="#FDE68A" 
                      strokeWidth={isSelected ? "3.5" : "2"}
                    />

                    {trapped && (
                      <circle 
                        cx={x} 
                        cy={y} 
                        r="23" 
                        fill="none" 
                        stroke="#EF4444" 
                        strokeWidth="2.5" 
                        strokeDasharray="2 2"
                      />
                    )}

                    <g fill="#180702" stroke="#180702" strokeLinecap="round">
                      <polygon points={`${x-14},${y-12} ${x-8},${y-18} ${x-5},${y-10}`} />
                      <polygon points={`${x+14},${y-12} ${x+8},${y-18} ${x+5},${y-10}`} />
                      
                      <path d={`M ${x-6} ${y-8} L ${x+6} ${y-8}`} stroke="#180702" strokeWidth="1.8" />
                      <path d={`M ${x-4} ${y-5} L ${x+4} ${y-5}`} stroke="#180702" strokeWidth="1.8" />
                      <line x1={x} y1={y-11} x2={x} y2={y-3} strokeWidth="1.8" />

                      <circle cx={x-5} cy={y} r="2" fill="#FEF08A" stroke="none" />
                      <circle cx={x+5} cy={y} r="2" fill="#FEF08A" stroke="none" />
                      <circle cx={x-5} cy={y} r="0.9" fill="#000000" stroke="none" />
                      <circle cx={x+5} cy={y} r="0.9" fill="#000000" stroke="none" />

                      <polygon points={`${x-2.5},${y+4} ${x+2.5},${y+4} ${x},${y+7}`} fill="#180702" stroke="none" />
                      <line x1={x-4} y1={y+6} x2={x-12} y2={y+7} strokeWidth="1.2" />
                      <line x1={x+4} y1={y+6} x2={x-12} y2={y+7} strokeWidth="1.2" />
                      <line x1={x-4} y1={y+8} x2={x-11} y2={y+11} strokeWidth="1.2" />
                      <line x1={x+4} y1={y+8} x2={x+11} y2={y+11} strokeWidth="1.2" />
                    </g>
                  </g>
                )}

                {/* PIECE: GOAT */}
                {isGoat && (
                  <g filter="url(#pieceShadow)">
                    <circle 
                      cx={x} 
                      cy={y} 
                      r="19" 
                      fill="url(#goatPieceGrad)" 
                      stroke="#B45309" 
                      strokeWidth={isSelected ? "3.5" : "2"}
                    />

                    <path 
                      d={`M ${x-4} ${y-7} Q ${x-13} ${y-16} ${x-6} ${y-17}`} 
                      fill="none" 
                      stroke="#78350F" 
                      strokeWidth="2.5" 
                      strokeLinecap="round"
                    />
                    <path 
                      d={`M ${x+4} ${y-7} Q ${x+13} ${y-16} ${x+6} ${y-17}`} 
                      fill="none" 
                      stroke="#78350F" 
                      strokeWidth="2.5" 
                      strokeLinecap="round"
                    />

                    <ellipse cx={x} cy={y+1} rx="7.5" ry="9" fill="#F8FAFC" stroke="#92400E" strokeWidth="1.2" />
                    
                    <circle cx={x-3.5} cy={y} r="1.3" fill="#1E293B" />
                    <circle cx={x+3.5} cy={y} r="1.3" fill="#1E293B" />

                    <polygon points={`${x-2},${y+5} ${x+2},${y+5} ${x},${y+8}`} fill="#78350F" />
                    <path d={`M ${x} ${y+8} L ${x} ${y+12}`} stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />

                    <circle cx={x} cy={y+11} r="2.2" fill="#F59E0B" stroke="#78350F" strokeWidth="0.8" />
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* AI Thinking Floating Badge */}
        {isAiThinking && (
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/85 border border-amber-500/70 text-amber-200 text-[11px] font-semibold shadow-lg backdrop-blur-sm animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>AI Thinking...</span>
          </div>
        )}
      </div>

      {/* Screen Reader Live Status Region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {useGameStore(s => s.announcement)}
      </div>
    </div>
  );
};
