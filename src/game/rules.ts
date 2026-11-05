import { 
  PieceType, 
  PlayerSide, 
  GamePhase, 
  GameStatus, 
  Move 
} from './types';
import { 
  ADJACENCY_LIST, 
  JUMP_MAP, 
  getPointLabel, 
  TOTAL_POINTS,
  GOATS_NEEDED_FOR_TIGER_WIN 
} from './constants';

/**
 * Generates all legal moves for Goats given the current board state and phase.
 */
export function getLegalMovesForGoat(
  board: PieceType[],
  phase: GamePhase,
  unplacedGoats: number
): Move[] {
  const moves: Move[] = [];

  if (phase === 'PLACEMENT' && unplacedGoats > 0) {
    // Placement Phase: Goat can be placed on any empty point
    for (let p = 0; p < TOTAL_POINTS; p++) {
      if (board[p] === 'EMPTY') {
        moves.push({
          type: 'PLACE',
          piece: 'GOAT',
          to: p,
          notation: `G @ ${getPointLabel(p)}`,
          timestamp: Date.now(),
        });
      }
    }
    return moves;
  }

  // Movement Phase: Goat on-board moves to adjacent empty points
  for (let from = 0; from < TOTAL_POINTS; from++) {
    if (board[from] === 'GOAT') {
      const neighbors = ADJACENCY_LIST[from];
      for (const to of neighbors) {
        if (board[to] === 'EMPTY') {
          moves.push({
            type: 'MOVE',
            piece: 'GOAT',
            from,
            to,
            notation: `G ${getPointLabel(from)}->${getPointLabel(to)}`,
            timestamp: Date.now(),
          });
        }
      }
    }
  }

  return moves;
}

/**
 * Generates all legal moves for Tigers (walk and jump/capture).
 */
export function getLegalMovesForTiger(board: PieceType[]): Move[] {
  const moves: Move[] = [];

  for (let from = 0; from < TOTAL_POINTS; from++) {
    if (board[from] === 'TIGER') {
      // 1. Walk moves to adjacent empty points
      const neighbors = ADJACENCY_LIST[from];
      for (const to of neighbors) {
        if (board[to] === 'EMPTY') {
          moves.push({
            type: 'MOVE',
            piece: 'TIGER',
            from,
            to,
            notation: `T ${getPointLabel(from)}->${getPointLabel(to)}`,
            timestamp: Date.now(),
          });
        }
      }

      // 2. Jump/Capture moves over adjacent goat to empty point
      const jumps = JUMP_MAP[from];
      for (const jump of jumps) {
        if (board[jump.over] === 'GOAT' && board[jump.to] === 'EMPTY') {
          moves.push({
            type: 'CAPTURE',
            piece: 'TIGER',
            from,
            to: jump.to,
            capturedPoint: jump.over,
            notation: `T ${getPointLabel(from)}x(${getPointLabel(jump.over)})->${getPointLabel(jump.to)}`,
            timestamp: Date.now(),
          });
        }
      }
    }
  }

  return moves;
}

/**
 * Returns legal moves for a specific tiger.
 */
export function getLegalMovesForSingleTiger(board: PieceType[], tigerIndex: number): Move[] {
  if (board[tigerIndex] !== 'TIGER') return [];
  const moves: Move[] = [];

  // Walk
  for (const to of ADJACENCY_LIST[tigerIndex]) {
    if (board[to] === 'EMPTY') {
      moves.push({
        type: 'MOVE',
        piece: 'TIGER',
        from: tigerIndex,
        to,
        notation: `T ${getPointLabel(tigerIndex)}->${getPointLabel(to)}`,
        timestamp: Date.now(),
      });
    }
  }

  // Jump
  for (const jump of JUMP_MAP[tigerIndex]) {
    if (board[jump.over] === 'GOAT' && board[jump.to] === 'EMPTY') {
      moves.push({
        type: 'CAPTURE',
        piece: 'TIGER',
        from: tigerIndex,
        to: jump.to,
        capturedPoint: jump.over,
        notation: `T ${getPointLabel(tigerIndex)}x(${getPointLabel(jump.over)})->${getPointLabel(jump.to)}`,
        timestamp: Date.now(),
      });
    }
  }

  return moves;
}

/**
 * Returns legal destinations for a selected piece.
 */
export interface ValidDestinations {
  walkDestinations: number[];
  captureDestinations: Map<number, number>; // destination point index -> captured point index
}

export function getValidDestinations(
  board: PieceType[],
  phase: GamePhase,
  selectedPoint: number,
  turn: PlayerSide
): ValidDestinations {
  const result: ValidDestinations = {
    walkDestinations: [],
    captureDestinations: new Map(),
  };

  if (selectedPoint < 0 || selectedPoint >= TOTAL_POINTS) {
    return result;
  }

  const piece = board[selectedPoint];

  if (turn === 'TIGER' && piece === 'TIGER') {
    // Tiger moves
    for (const to of ADJACENCY_LIST[selectedPoint]) {
      if (board[to] === 'EMPTY') {
        result.walkDestinations.push(to);
      }
    }
    for (const jump of JUMP_MAP[selectedPoint]) {
      if (board[jump.over] === 'GOAT' && board[jump.to] === 'EMPTY') {
        result.captureDestinations.set(jump.to, jump.over);
      }
    }
  } else if (turn === 'GOAT' && piece === 'GOAT' && phase === 'MOVEMENT') {
    // Goat movement
    for (const to of ADJACENCY_LIST[selectedPoint]) {
      if (board[to] === 'EMPTY') {
        result.walkDestinations.push(to);
      }
    }
  }

  return result;
}

/**
 * Checks if a tiger is currently immobilized (trapped).
 */
export function isTigerTrapped(board: PieceType[], tigerIndex: number): boolean {
  if (board[tigerIndex] !== 'TIGER') return false;
  return getLegalMovesForSingleTiger(board, tigerIndex).length === 0;
}

/**
 * Counts how many tigers currently have zero legal moves.
 */
export function countTrappedTigers(board: PieceType[]): number {
  let trapped = 0;
  for (let p = 0; p < TOTAL_POINTS; p++) {
    if (board[p] === 'TIGER' && isTigerTrapped(board, p)) {
      trapped++;
    }
  }
  return trapped;
}

/**
 * Creates a unique signature string for the board position.
 * Used for threefold repetition detection.
 */
export function createPositionKey(
  board: PieceType[],
  turn: PlayerSide,
  unplacedGoats: number
): string {
  return `${turn}|${unplacedGoats}|${board.join('')}`;
}

/**
 * Determines current game status (winner or draw).
 */
export function evaluateGameStatus(
  board: PieceType[],
  turn: PlayerSide,
  unplacedGoats: number,
  capturedGoats: number,
  positionHistory: string[]
): GameStatus {
  // 1. Tigers win condition: 5 or more goats captured
  if (capturedGoats >= GOATS_NEEDED_FOR_TIGER_WIN) {
    return 'TIGER_WON';
  }

  // 2. Goats win condition: all 4 tigers are blocked (no legal moves on tigers turn or all trapped)
  const tigerMoves = getLegalMovesForTiger(board);
  if (tigerMoves.length === 0) {
    return 'GOAT_WON';
  }

  // 3. Threefold repetition check
  const currentKey = createPositionKey(board, turn, unplacedGoats);
  let count = 0;
  for (const key of positionHistory) {
    if (key === currentKey) {
      count++;
    }
  }
  if (count >= 2) { // will become 3 when added
    return 'DRAW_REPETITION';
  }

  return 'PLAYING';
}

/**
 * Applies a move immutably and returns the next game state.
 */
export function applyMove(
  board: PieceType[],
  move: Move,
  unplacedGoats: number,
  capturedGoats: number
): {
  nextBoard: PieceType[];
  nextUnplaced: number;
  nextCaptured: number;
  nextTurn: PlayerSide;
  nextPhase: GamePhase;
} {
  const nextBoard = [...board];
  let nextUnplaced = unplacedGoats;
  let nextCaptured = capturedGoats;

  if (move.type === 'PLACE') {
    nextBoard[move.to] = 'GOAT';
    nextUnplaced = Math.max(0, unplacedGoats - 1);
  } else if (move.type === 'MOVE') {
    if (move.from !== undefined) {
      nextBoard[move.from] = 'EMPTY';
    }
    nextBoard[move.to] = move.piece;
  } else if (move.type === 'CAPTURE') {
    if (move.from !== undefined) {
      nextBoard[move.from] = 'EMPTY';
    }
    if (move.capturedPoint !== undefined) {
      nextBoard[move.capturedPoint] = 'EMPTY';
      nextCaptured = capturedGoats + 1;
    }
    nextBoard[move.to] = 'TIGER';
  }

  const nextPhase: GamePhase = nextUnplaced > 0 ? 'PLACEMENT' : 'MOVEMENT';
  const nextTurn: PlayerSide = move.piece === 'GOAT' ? 'TIGER' : 'GOAT';

  return {
    nextBoard,
    nextUnplaced,
    nextCaptured,
    nextTurn,
    nextPhase,
  };
}
