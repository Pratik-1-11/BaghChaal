import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface TutorialStep {
  title: string;
  badge: string;
  description: string;
  diagram: React.ReactNode;
  tips: string[];
}

export const TutorialModal: React.FC = () => {
  const showTutorial = useGameStore(s => s.showTutorial);
  const setShowTutorial = useGameStore(s => s.setShowTutorial);
  const [currentStep, setCurrentStep] = useState(0);

  if (!showTutorial) return null;

  const steps: TutorialStep[] = [
    {
      title: 'The Sacred Board & Roles',
      badge: 'Step 1 of 5',
      description: 'Bagh Chal (बाघचाल) is Nepal’s ancient two-player abstract strategy game of Tigers (बाघ) and Goats (बाख्रा).',
      diagram: (
        <div className="w-full aspect-video bg-black/50 rounded-2xl p-3 flex flex-col items-center justify-center border border-amber-800/40">
          <div className="flex items-center justify-around w-full max-w-xs">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-red-600 flex items-center justify-center text-2xl sm:text-3xl shadow-lg border border-amber-400 mx-auto">
                🐅
              </div>
              <p className="mt-1.5 text-xs font-bold text-amber-200">4 Tigers</p>
              <p className="text-[10px] text-amber-400/80">Start on 4 corners</p>
            </div>
            <div className="text-lg sm:text-xl font-bold text-amber-500">VS</div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl sm:text-3xl shadow-lg border border-amber-300 mx-auto">
                🐐
              </div>
              <p className="mt-1.5 text-xs font-bold text-amber-200">20 Goats</p>
              <p className="text-[10px] text-amber-400/80">Start off-board</p>
            </div>
          </div>
        </div>
      ),
      tips: [
        'The board is a 5x5 grid of 25 intersections connected by lines.',
        'Goat player always moves first.',
      ],
    },
    {
      title: 'Phase 1: Placing the Goats',
      badge: 'Step 2 of 5',
      description: 'The goat player places one goat per turn on any vacant intersection point.',
      diagram: (
        <div className="w-full aspect-video bg-black/50 rounded-2xl p-3 flex items-center justify-center border border-amber-800/40">
          <div className="text-center max-w-xs space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-900/60 border border-amber-600/50 text-xs text-amber-200">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span>Goats cannot move until all 20 are placed!</span>
            </div>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              Meanwhile, on each tiger turn, tigers move 1 step or leap over a goat to capture.
            </p>
          </div>
        </div>
      ),
      tips: [
        'Keep goats spread out or in tight defensive clusters.',
        'Avoid leaving empty points behind goats near tigers!',
      ],
    },
    {
      title: 'Tiger Pounce & Capturing',
      badge: 'Step 3 of 5',
      description: 'Tigers can leap over an adjacent goat in a straight line to an empty point immediately behind it.',
      diagram: (
        <div className="w-full aspect-video bg-black/50 rounded-2xl p-3 flex flex-col items-center justify-center border border-amber-800/40">
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-600 flex items-center justify-center text-lg shadow">🐅</div>
            <span className="text-red-400 font-bold text-xs sm:text-sm">➔ leaps ➔</span>
            <div className="w-8 h-8 rounded-full bg-red-950/80 border border-red-500 flex items-center justify-center text-xs">❌🐐</div>
            <span className="text-amber-400 font-bold text-xs sm:text-sm">➔ lands ➔</span>
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-emerald-400 bg-emerald-950/40 flex items-center justify-center text-xs text-emerald-300">◯</div>
          </div>
          <p className="mt-2.5 text-[11px] text-amber-300/80 text-center">
            Captured goat is removed permanently.
          </p>
        </div>
      ),
      tips: [
        'A tiger jumps over only ONE goat at a time.',
        'Tigers CANNOT leap over other tigers.',
        'Captures are optional, but deadly!',
      ],
    },
    {
      title: 'Phase 2: Movement & Trapping',
      badge: 'Step 4 of 5',
      description: 'Once all 20 goats are on the board, the movement phase begins.',
      diagram: (
        <div className="w-full aspect-video bg-black/50 rounded-2xl p-3 flex items-center justify-center border border-amber-800/40">
          <div className="text-center max-w-xs space-y-1.5">
            <div className="text-sm font-bold text-amber-200">Encircle & Blockade</div>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              Now Goats slide 1 step along connected lines to adjacent empty points. Their goal is to surround every tiger until none can move!
            </p>
          </div>
        </div>
      ),
      tips: [
        'Form interlocking walls of goats.',
        'Never leave an empty landing space behind a goat adjacent to a tiger.',
      ],
    },
    {
      title: 'Victory Conditions',
      badge: 'Step 5 of 5',
      description: 'How each side wins the ancient contest:',
      diagram: (
        <div className="w-full aspect-video bg-black/50 rounded-2xl p-3 flex flex-col justify-around border border-amber-800/40">
          <div className="flex items-center gap-3 bg-red-950/40 p-2 rounded-xl border border-red-800/40">
            <span className="text-2xl">🐅</span>
            <div className="text-left text-xs">
              <span className="font-bold text-red-300">Tiger Victory: </span>
              <span className="text-amber-100">Capture 5 goats.</span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-emerald-950/40 p-2 rounded-xl border border-emerald-800/40">
            <span className="text-2xl">🐐</span>
            <div className="text-left text-xs">
              <span className="font-bold text-emerald-300">Goat Victory: </span>
              <span className="text-amber-100">Trap and immobilize all 4 tigers.</span>
            </div>
          </div>
        </div>
      ),
      tips: [
        'Threefold repetition of the exact same position results in a draw.',
        'Play Pass & Play with a friend or challenge the AI!',
      ],
    },
  ];

  const step = steps[currentStep];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[#261005] border border-amber-600/70 p-4 sm:p-5 text-amber-100 shadow-2xl flex flex-col max-h-[88vh] sm:max-h-[90vh] pb-safe">
        {/* Mobile Drag Handle */}
        <div className="w-10 h-1 rounded-full bg-amber-600/40 mx-auto mb-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-amber-800/40">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">
              {step.badge}
            </span>
            <h3 id="tutorial-title" className="text-sm sm:text-base font-bold text-amber-100 font-cinzel">
              {step.title}
            </h3>
          </div>
          <button
            onClick={() => setShowTutorial(false)}
            aria-label="Close tutorial"
            className="w-9 h-9 rounded-xl text-amber-400 hover:text-white hover:bg-amber-900/50 flex items-center justify-center active:scale-90 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-3 space-y-3 overflow-y-auto flex-1">
          <p className="text-xs text-amber-200/90 leading-relaxed">
            {step.description}
          </p>

          {step.diagram}

          <div className="space-y-1.5 pt-1">
            {step.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-amber-300/80">
                <span className="text-amber-500 font-bold">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="pt-2.5 border-t border-amber-800/40 flex items-center justify-between gap-2">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className={`flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-semibold min-h-[44px] transition active:scale-95 ${
              currentStep === 0
                ? 'opacity-30 cursor-not-allowed text-stone-500'
                : 'bg-black/40 text-amber-300 hover:bg-black/60'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                aria-label={`Go to step ${i + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentStep ? 'w-6 bg-amber-400' : 'bg-amber-900/60'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="flex items-center gap-1 px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition min-h-[44px] active:scale-95"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowTutorial(false)}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-bold shadow transition min-h-[44px] active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Play Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
