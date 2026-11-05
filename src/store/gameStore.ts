import { create } from 'zustand';
import { 
  PieceType, 
  PlayerSide, 
  GamePhase, 
  GameMode, 
  AIDifficulty, 
  BoardTheme, 
  GameStatus, 
  Move, 
  BoardSnapshot 
} from '../game/types';
import { 
  getInitialBoard, 
  TOTAL_GOATS, 
  GOATS_NEEDED_FOR_TIGER_WIN,
  getPointLabel 
} from '../game/constants';
import { 
  getLegalMovesForGoat, 
  getLegalMovesForTiger, 
  getValidDestinations, 
  applyMove, 
  evaluateGameStatus, 
  createPositionKey, 
  countTrappedTigers,
  isTigerTrapped
} from '../game/rules';
import { getAIMoveAsync } from '../game/ai';
import { audio } from '../utils/audio';

export interface MatchScore {
  goatWins: number;
  tigerWins: number;
  draws: number;
}

interface GameState {
  // Board & Match State
  board: PieceType[];
  phase: GamePhase;
  turn: PlayerSide;
  unplacedGoats: number;
  capturedGoats: number;
  status: GameStatus;
  selectedPoint: number | null;
  validWalkDestinations: number[];
  validCaptureDestinations: Record<number, number>; // dest -> capturedPoint
  moveHistory: Move[];
  snapshotHistory: BoardSnapshot[];
  positionKeys: string[];

  // 2-Player & Tabletop Board Rotation
  boardRotation: 0 | 180;
  autoFlipIn2Player: boolean;
  matchScore: MatchScore;

  // Settings & Configuration
  mode: GameMode;
  aiDifficulty: AIDifficulty;
  playerRole: PlayerSide; // Player's side when mode === 'PVE'
  isAiThinking: boolean;
  boardTheme: BoardTheme;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  showTutorial: boolean;
  showSettings: boolean;
  showHistory: boolean;
  announcement: string;

  // Actions
  handlePointClick: (pointIdx: number) => void;
  undo: () => void;
  restartGame: () => void;
  setMode: (mode: GameMode) => void;
  setAiDifficulty: (diff: AIDifficulty) => void;
  setPlayerRole: (role: PlayerSide) => void;
  setBoardTheme: (theme: BoardTheme) => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
  setShowTutorial: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowHistory: (show: boolean) => void;
  clearSelection: () => void;

  // 2-Player Actions
  toggleBoardRotation: () => void;
  toggleAutoFlip: () => void;
  resetMatchScore: () => void;
}

const SETTINGS_STORAGE_KEY = 'bagh_chal_settings_v3';
const SCORE_STORAGE_KEY = 'bagh_chal_score_v3';

function loadSavedSettings() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadSavedScore(): MatchScore {
  if (typeof window === 'undefined') return { goatWins: 0, tigerWins: 0, draws: 0 };
  try {
    const raw = localStorage.getItem(SCORE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { goatWins: 0, tigerWins: 0, draws: 0 };
  } catch {
    return { goatWins: 0, tigerWins: 0, draws: 0 };
  }
}

function saveScore(score: MatchScore) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(score));
  } catch {
    // Ignore storage quota
  }
}

function saveSettings(settings: {
  mode: GameMode;
  aiDifficulty: AIDifficulty;
  playerRole: PlayerSide;
  boardTheme: BoardTheme;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  autoFlipIn2Player: boolean;
}) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota
  }
}

const savedSettings = loadSavedSettings();
const initialBoard = getInitialBoard();
const initialPositionKey = createPositionKey(initialBoard, 'GOAT', TOTAL_GOATS);

export const useGameStore = create<GameState>((set, get) => {
  const initialSound = savedSettings?.soundEnabled ?? true;
  const initialHaptics = savedSettings?.hapticsEnabled ?? true;
  const initialAutoFlip = savedSettings?.autoFlipIn2Player ?? false;
  const initialScore = loadSavedScore();

  audio.setSoundEnabled(initialSound);
  audio.setHapticsEnabled(initialHaptics);

  // Trigger AI move if initial turn belongs to AI
  const triggerAiIfNeeded = () => {
    const state = get();
    if (state.mode !== 'PVE' || state.status !== 'PLAYING') return;

    const isAiTurn = state.turn !== state.playerRole;
    if (isAiTurn && !state.isAiThinking) {
      set({ isAiThinking: true });

      getAIMoveAsync(
        state.board,
        state.phase,
        state.turn,
        state.unplacedGoats,
        state.capturedGoats,
        state.aiDifficulty
      ).then(move => {
        const currentState = get();
        if (
          currentState.status !== 'PLAYING' ||
          currentState.turn === currentState.playerRole ||
          !move
        ) {
          set({ isAiThinking: false });
          return;
        }

        executeMove(move, true);
        set({ isAiThinking: false });
      });
    }
  };

  const executeMove = (move: Move, isFromAi = false) => {
    const state = get();
    if (state.status !== 'PLAYING') return;

    // Save snapshot for Undo
    const snapshot: BoardSnapshot = {
      board: [...state.board],
      turn: state.turn,
      phase: state.phase,
      unplacedGoats: state.unplacedGoats,
      capturedGoats: state.capturedGoats,
      lastMove: move,
    };

    const next = applyMove(state.board, move, state.unplacedGoats, state.capturedGoats);
    const nextKeys = [...state.positionKeys, createPositionKey(next.nextBoard, next.nextTurn, next.nextUnplaced)];
    const nextStatus = evaluateGameStatus(
      next.nextBoard,
      next.nextTurn,
      next.nextUnplaced,
      next.nextCaptured,
      nextKeys
    );

    // Audio & Haptic feedback
    if (move.type === 'PLACE') {
      audio.playPlacement();
    } else if (move.type === 'CAPTURE') {
      audio.playCapture();
    } else {
      audio.playMove();
    }

    // Update match score if game ended
    let updatedScore = { ...state.matchScore };
    if (nextStatus === 'TIGER_WON') {
      updatedScore.tigerWins += 1;
      saveScore(updatedScore);
      setTimeout(() => audio.playVictory(), 200);
    } else if (nextStatus === 'GOAT_WON') {
      updatedScore.goatWins += 1;
      saveScore(updatedScore);
      setTimeout(() => audio.playVictory(), 200);
    } else if (nextStatus === 'DRAW_REPETITION') {
      updatedScore.draws += 1;
      saveScore(updatedScore);
    } else if (next.nextTurn === 'TIGER') {
      const trappedCount = countTrappedTigers(next.nextBoard);
      if (trappedCount > 0 && trappedCount > countTrappedTigers(state.board)) {
        setTimeout(() => audio.playTrapAlert(), 150);
      }
    }

    // Accessible Announcement
    let announcement = '';
    if (move.type === 'PLACE') {
      announcement = `Goat placed at ${getPointLabel(move.to)}. ${next.nextUnplaced} goats remaining to place.`;
    } else if (move.type === 'CAPTURE') {
      announcement = `Tiger jumped from ${getPointLabel(move.from!)} to ${getPointLabel(move.to)}, capturing goat at ${getPointLabel(move.capturedPoint!)}. Total captures: ${next.nextCaptured}.`;
    } else {
      announcement = `${move.piece} moved from ${getPointLabel(move.from!)} to ${getPointLabel(move.to)}.`;
    }

    if (nextStatus === 'TIGER_WON') {
      announcement += ' Tigers have captured 5 goats and won the game!';
    } else if (nextStatus === 'GOAT_WON') {
      announcement += ' All 4 tigers are blocked! Goats win!';
    } else if (nextStatus === 'DRAW_REPETITION') {
      announcement += ' Game drawn by threefold repetition.';
    }

    // Tabletop auto-flip in 2-Player mode
    let nextRotation = state.boardRotation;
    if (state.mode === 'PVP' && state.autoFlipIn2Player) {
      nextRotation = next.nextTurn === 'TIGER' ? 180 : 0;
    }

    set({
      board: next.nextBoard,
      unplacedGoats: next.nextUnplaced,
      capturedGoats: next.nextCaptured,
      turn: next.nextTurn,
      phase: next.nextPhase,
      status: nextStatus,
      selectedPoint: null,
      validWalkDestinations: [],
      validCaptureDestinations: {},
      moveHistory: [...state.moveHistory, move],
      snapshotHistory: [...state.snapshotHistory, snapshot],
      positionKeys: nextKeys,
      announcement,
      boardRotation: nextRotation,
      matchScore: updatedScore,
    });

    // If game continues and in vs AI mode, trigger AI move
    if (nextStatus === 'PLAYING') {
      setTimeout(() => triggerAiIfNeeded(), 100);
    }
  };

  return {
    board: initialBoard,
    phase: 'PLACEMENT',
    turn: 'GOAT',
    unplacedGoats: TOTAL_GOATS,
    capturedGoats: 0,
    status: 'PLAYING',
    selectedPoint: null,
    validWalkDestinations: [],
    validCaptureDestinations: {},
    moveHistory: [],
    snapshotHistory: [],
    positionKeys: [initialPositionKey],

    boardRotation: 0,
    autoFlipIn2Player: initialAutoFlip,
    matchScore: initialScore,

    mode: savedSettings?.mode ?? 'PVP', // default to PVP or saved
    aiDifficulty: savedSettings?.aiDifficulty ?? 'MEDIUM',
    playerRole: savedSettings?.playerRole ?? 'GOAT',
    isAiThinking: false,
    boardTheme: savedSettings?.boardTheme ?? 'wood',
    soundEnabled: initialSound,
    hapticsEnabled: initialHaptics,
    showTutorial: false,
    showSettings: false,
    showHistory: false,
    announcement: 'Bagh Chal game started. Goat player places first.',

    clearSelection: () => {
      set({
        selectedPoint: null,
        validWalkDestinations: [],
        validCaptureDestinations: {},
      });
    },

    toggleBoardRotation: () => {
      const current = get().boardRotation;
      set({ boardRotation: current === 0 ? 180 : 0 });
    },

    toggleAutoFlip: () => {
      const next = !get().autoFlipIn2Player;
      set({ autoFlipIn2Player: next });
      const state = get();
      saveSettings({
        mode: state.mode,
        aiDifficulty: state.aiDifficulty,
        playerRole: state.playerRole,
        boardTheme: state.boardTheme,
        soundEnabled: state.soundEnabled,
        hapticsEnabled: state.hapticsEnabled,
        autoFlipIn2Player: next,
      });
    },

    resetMatchScore: () => {
      const reset = { goatWins: 0, tigerWins: 0, draws: 0 };
      saveScore(reset);
      set({ matchScore: reset });
    },

    handlePointClick: (pointIdx: number) => {
      const state = get();
      if (state.status !== 'PLAYING') return;

      // In vs AI mode, block input during AI's turn
      if (state.mode === 'PVE') {
        const isPlayerTurn = state.turn === state.playerRole;
        if (!isPlayerTurn || state.isAiThinking) return;
      }

      const pointPiece = state.board[pointIdx];

      // CASE 1: Goat placement phase
      if (state.turn === 'GOAT' && state.phase === 'PLACEMENT') {
        if (pointPiece === 'EMPTY') {
          const move: Move = {
            type: 'PLACE',
            piece: 'GOAT',
            to: pointIdx,
            notation: `G @ ${getPointLabel(pointIdx)}`,
            timestamp: Date.now(),
          };
          executeMove(move);
          return;
        } else {
          audio.playInvalid();
          return;
        }
      }

      // CASE 2: A piece is currently selected, and player taps a destination or re-selects
      if (state.selectedPoint !== null) {
        // Re-tapping selected piece deselects it
        if (state.selectedPoint === pointIdx) {
          get().clearSelection();
          audio.playSelect();
          return;
        }

        // Tapping another piece of player's own side shifts selection
        if (pointPiece === state.turn) {
          const dests = getValidDestinations(state.board, state.phase, pointIdx, state.turn);
          const captureRecord: Record<number, number> = {};
          dests.captureDestinations.forEach((over, dest) => {
            captureRecord[dest] = over;
          });

          set({
            selectedPoint: pointIdx,
            validWalkDestinations: dests.walkDestinations,
            validCaptureDestinations: captureRecord,
          });
          audio.playSelect();
          return;
        }

        // Check if pointIdx is a valid walk destination (orthogonal or diagonal)
        if (state.validWalkDestinations.includes(pointIdx)) {
          const move: Move = {
            type: 'MOVE',
            piece: state.turn,
            from: state.selectedPoint,
            to: pointIdx,
            notation: `${state.turn === 'TIGER' ? 'T' : 'G'} ${getPointLabel(state.selectedPoint)}->${getPointLabel(pointIdx)}`,
            timestamp: Date.now(),
          };
          executeMove(move);
          return;
        }

        // Check if pointIdx is a valid capture jump destination (for Tigers)
        if (state.validCaptureDestinations[pointIdx] !== undefined) {
          const over = state.validCaptureDestinations[pointIdx];
          const move: Move = {
            type: 'CAPTURE',
            piece: 'TIGER',
            from: state.selectedPoint,
            to: pointIdx,
            capturedPoint: over,
            notation: `T ${getPointLabel(state.selectedPoint)}x(${getPointLabel(over)})->${getPointLabel(pointIdx)}`,
            timestamp: Date.now(),
          };
          executeMove(move);
          return;
        }

        // Invalid tap outside valid moves
        audio.playInvalid();
        get().clearSelection();
        return;
      }

      // CASE 3: Selecting a piece to move
      if (pointPiece === state.turn) {
        const dests = getValidDestinations(state.board, state.phase, pointIdx, state.turn);
        const captureRecord: Record<number, number> = {};
        dests.captureDestinations.forEach((over, dest) => {
          captureRecord[dest] = over;
        });

        if (dests.walkDestinations.length === 0 && dests.captureDestinations.size === 0) {
          audio.playInvalid();
          set({ announcement: `${state.turn} at ${getPointLabel(pointIdx)} has no legal moves.` });
          return;
        }

        set({
          selectedPoint: pointIdx,
          validWalkDestinations: dests.walkDestinations,
          validCaptureDestinations: captureRecord,
        });
        audio.playSelect();
      } else {
        audio.playInvalid();
      }
    },

    undo: () => {
      const state = get();
      if (state.snapshotHistory.length === 0 || state.isAiThinking) return;

      let targetSnapshotIndex = state.snapshotHistory.length - 1;
      if (state.mode === 'PVE' && state.snapshotHistory.length >= 2) {
        targetSnapshotIndex = state.snapshotHistory.length - 2;
      }

      const snapshot = state.snapshotHistory[targetSnapshotIndex];
      const remainingSnapshots = state.snapshotHistory.slice(0, targetSnapshotIndex);
      const remainingMoves = state.moveHistory.slice(0, targetSnapshotIndex);
      const remainingKeys = state.positionKeys.slice(0, targetSnapshotIndex + 1);

      audio.playPlacement();

      let targetRotation = state.boardRotation;
      if (state.mode === 'PVP' && state.autoFlipIn2Player) {
        targetRotation = snapshot.turn === 'TIGER' ? 180 : 0;
      }

      set({
        board: snapshot.board,
        turn: snapshot.turn,
        phase: snapshot.phase,
        unplacedGoats: snapshot.unplacedGoats,
        capturedGoats: snapshot.capturedGoats,
        status: 'PLAYING',
        selectedPoint: null,
        validWalkDestinations: [],
        validCaptureDestinations: {},
        snapshotHistory: remainingSnapshots,
        moveHistory: remainingMoves,
        positionKeys: remainingKeys,
        boardRotation: targetRotation,
        announcement: 'Move undone.',
      });
    },

    restartGame: () => {
      const state = get();
      const freshBoard = getInitialBoard();
      const freshKey = createPositionKey(freshBoard, 'GOAT', TOTAL_GOATS);

      audio.playPlacement();

      set({
        board: freshBoard,
        phase: 'PLACEMENT',
        turn: 'GOAT',
        unplacedGoats: TOTAL_GOATS,
        capturedGoats: 0,
        status: 'PLAYING',
        selectedPoint: null,
        validWalkDestinations: [],
        validCaptureDestinations: {},
        moveHistory: [],
        snapshotHistory: [],
        positionKeys: [freshKey],
        isAiThinking: false,
        boardRotation: 0,
        announcement: 'New game started. Goat player places first.',
      });

      if (state.mode === 'PVE' && state.playerRole === 'TIGER') {
        setTimeout(() => triggerAiIfNeeded(), 200);
      }
    },

    setMode: (mode: GameMode) => {
      set({ mode, isAiThinking: false, boardRotation: 0 });
      const state = get();
      saveSettings({
        mode,
        aiDifficulty: state.aiDifficulty,
        playerRole: state.playerRole,
        boardTheme: state.boardTheme,
        soundEnabled: state.soundEnabled,
        hapticsEnabled: state.hapticsEnabled,
        autoFlipIn2Player: state.autoFlipIn2Player,
      });

      get().restartGame();
    },

    setAiDifficulty: (aiDifficulty: AIDifficulty) => {
      set({ aiDifficulty });
      const state = get();
      saveSettings({
        mode: state.mode,
        aiDifficulty,
        playerRole: state.playerRole,
        boardTheme: state.boardTheme,
        soundEnabled: state.soundEnabled,
        hapticsEnabled: state.hapticsEnabled,
        autoFlipIn2Player: state.autoFlipIn2Player,
      });
    },

    setPlayerRole: (playerRole: PlayerSide) => {
      set({ playerRole });
      const state = get();
      saveSettings({
        mode: state.mode,
        aiDifficulty: state.aiDifficulty,
        playerRole,
        boardTheme: state.boardTheme,
        soundEnabled: state.soundEnabled,
        hapticsEnabled: state.hapticsEnabled,
        autoFlipIn2Player: state.autoFlipIn2Player,
      });
      get().restartGame();
    },

    setBoardTheme: (boardTheme: BoardTheme) => {
      set({ boardTheme });
      const state = get();
      saveSettings({
        mode: state.mode,
        aiDifficulty: state.aiDifficulty,
        playerRole: state.playerRole,
        boardTheme,
        soundEnabled: state.soundEnabled,
        hapticsEnabled: state.hapticsEnabled,
        autoFlipIn2Player: state.autoFlipIn2Player,
      });
    },

    toggleSound: () => {
      const state = get();
      const nextSound = !state.soundEnabled;
      audio.setSoundEnabled(nextSound);
      set({ soundEnabled: nextSound });
      saveSettings({
        mode: state.mode,
        aiDifficulty: state.aiDifficulty,
        playerRole: state.playerRole,
        boardTheme: state.boardTheme,
        soundEnabled: nextSound,
        hapticsEnabled: state.hapticsEnabled,
        autoFlipIn2Player: state.autoFlipIn2Player,
      });
    },

    toggleHaptics: () => {
      const state = get();
      const nextHaptics = !state.hapticsEnabled;
      audio.setHapticsEnabled(nextHaptics);
      set({ hapticsEnabled: nextHaptics });
      saveSettings({
        mode: state.mode,
        aiDifficulty: state.aiDifficulty,
        playerRole: state.playerRole,
        boardTheme: state.boardTheme,
        soundEnabled: state.soundEnabled,
        hapticsEnabled: nextHaptics,
        autoFlipIn2Player: state.autoFlipIn2Player,
      });
    },

    setShowTutorial: (showTutorial: boolean) => set({ showTutorial }),
    setShowSettings: (showSettings: boolean) => set({ showSettings }),
    setShowHistory: (showHistory: boolean) => set({ showHistory }),
  };
});
