import { PieceType, PlayerSide, GamePhase, Move, AIDifficulty } from './types';
import { 
  getLegalMovesForGoat, 
  getLegalMovesForTiger, 
  applyMove, 
  countTrappedTigers, 
  evaluateGameStatus 
} from './rules';
import { 
  TOTAL_POINTS, 
  ADJACENCY_LIST, 
  JUMP_MAP, 
  GOATS_NEEDED_FOR_TIGER_WIN 
} from './constants';

const WIN_SCORE = 100000;
const LOSS_SCORE = -100000;

/**
 * Evaluates the board from the perspective of Tigers (positive = good for Tigers, negative = good for Goats).
 */
export function evaluateBoard(
  board: PieceType[],
  phase: GamePhase,
  unplacedGoats: number,
  capturedGoats: number
): number {
  // 1. Terminal states
  if (capturedGoats >= GOATS_NEEDED_FOR_TIGER_WIN) {
    return WIN_SCORE;
  }

  const tigerMoves = getLegalMovesForTiger(board);
  if (tigerMoves.length === 0) {
    return LOSS_SCORE;
  }

  let score = 0;

  // 2. Captured goats weight (massive priority for tigers)
  score += capturedGoats * 400;

  // 3. Tiger mobility & trapped penalty
  score += tigerMoves.length * 20;

  let trappedTigers = 0;
  let restrictedTigers = 0;

  for (let p = 0; p < TOTAL_POINTS; p++) {
    if (board[p] === 'TIGER') {
      let tigerSingleMoves = 0;
      // walks
      for (const to of ADJACENCY_LIST[p]) {
        if (board[to] === 'EMPTY') tigerSingleMoves++;
      }
      // jumps
      for (const j of JUMP_MAP[p]) {
        if (board[j.over] === 'GOAT' && board[j.to] === 'EMPTY') tigerSingleMoves += 2; // captures count double
      }

      if (tigerSingleMoves === 0) {
        trappedTigers++;
      } else if (tigerSingleMoves === 1) {
        restrictedTigers++;
      }

      // Bonus for center control (node 12 is center with 8 degrees)
      if (p === 12) {
        score += 35;
      } else if ([6, 8, 16, 18].includes(p)) {
        score += 15;
      }
    }
  }

  // Trapped tigers are heavily penalized for Tiger (and heavily favored for Goat)
  score -= trappedTigers * 320;
  score -= restrictedTigers * 90;

  // 4. Capture threats on next turn
  let captureThreats = 0;
  for (const m of tigerMoves) {
    if (m.type === 'CAPTURE') {
      captureThreats++;
    }
  }
  score += captureThreats * 75;

  // 5. Goat safety and formation (favors goats -> negative score)
  let protectedGoats = 0;
  let isolatedGoats = 0;

  for (let p = 0; p < TOTAL_POINTS; p++) {
    if (board[p] === 'GOAT') {
      // Check if this goat is currently vulnerable to being jumped
      let isVulnerable = false;
      for (const jump of JUMP_MAP[p]) {
        // If an adjacent node has a tiger and the opposite node is empty
        // jump.over is p's neighbor, jump.to is opposite
        // If jump.over has a tiger, can tiger jump over p?
        // Let's check jumps where jump.over === p:
        // Already precomputed via reverse check:
      }

      // Check adjacent goats for cluster defense
      let adjacentGoats = 0;
      for (const neighbor of ADJACENCY_LIST[p]) {
        if (board[neighbor] === 'GOAT') adjacentGoats++;
      }

      if (adjacentGoats >= 2) {
        protectedGoats++;
      } else if (adjacentGoats === 0) {
        isolatedGoats++;
      }
    }
  }

  score -= protectedGoats * 25;
  score += isolatedGoats * 30;

  // In placement phase, unplaced goats count as potential future defense
  if (phase === 'PLACEMENT') {
    score -= (20 - capturedGoats) * 10;
  }

  return score;
}

/**
 * Move ordering heuristic for alpha-beta pruning:
 * - Tiger: Captures first, then moves towards center/open spaces
 * - Goat: Moves that block tigers first, or safe placements
 */
function orderMoves(moves: Move[], board: PieceType[], side: PlayerSide): Move[] {
  return moves.slice().sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (side === 'TIGER') {
      if (a.type === 'CAPTURE') scoreA += 1000;
      if (b.type === 'CAPTURE') scoreB += 1000;

      // Prefer center
      if (a.to === 12) scoreA += 50;
      if (b.to === 12) scoreB += 50;
    } else {
      // Goat
      // In placement, placing adjacent to a tiger restricts it
      if (a.type === 'PLACE') {
        let adjTigersA = 0;
        for (const n of ADJACENCY_LIST[a.to]) {
          if (board[n] === 'TIGER') adjTigersA++;
        }
        scoreA += adjTigersA * 40;
      }
      if (b.type === 'PLACE') {
        let adjTigersB = 0;
        for (const n of ADJACENCY_LIST[b.to]) {
          if (board[n] === 'TIGER') adjTigersB++;
        }
        scoreB += adjTigersB * 40;
      }
    }

    return scoreB - scoreA;
  });
}

/**
 * Minimax with Alpha-Beta pruning
 */
function minimax(
  board: PieceType[],
  phase: GamePhase,
  turn: PlayerSide,
  unplacedGoats: number,
  capturedGoats: number,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean, // true if Tiger, false if Goat
  startTime: number,
  timeLimitMs: number
): number {
  if (Date.now() - startTime > timeLimitMs) {
    return evaluateBoard(board, phase, unplacedGoats, capturedGoats);
  }

  // Terminal conditions
  if (capturedGoats >= GOATS_NEEDED_FOR_TIGER_WIN) {
    return WIN_SCORE - (5 - depth); // prefer quicker wins
  }

  const legalTigerMoves = getLegalMovesForTiger(board);
  if (legalTigerMoves.length === 0) {
    return LOSS_SCORE + (5 - depth); // prefer slower losses
  }

  if (depth === 0) {
    return evaluateBoard(board, phase, unplacedGoats, capturedGoats);
  }

  if (maximizingPlayer) {
    // TIGER's turn
    let maxEval = -Infinity;
    const moves = orderMoves(legalTigerMoves, board, 'TIGER');

    for (const move of moves) {
      const next = applyMove(board, move, unplacedGoats, capturedGoats);
      const evalScore = minimax(
        next.nextBoard,
        next.nextPhase,
        next.nextTurn,
        next.nextUnplaced,
        next.nextCaptured,
        depth - 1,
        alpha,
        beta,
        false, // Goat's turn next
        startTime,
        timeLimitMs
      );

      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) {
        break; // Beta cut-off
      }
    }
    return maxEval;
  } else {
    // GOAT's turn
    let minEval = Infinity;
    const rawGoatMoves = getLegalMovesForGoat(board, phase, unplacedGoats);
    if (rawGoatMoves.length === 0) {
      return WIN_SCORE; // Tigers win if goats have no moves
    }

    // In placement phase, goats have up to 21 moves. Prune branch count for performance at deeper depths.
    let goatMoves = rawGoatMoves;
    if (phase === 'PLACEMENT' && depth > 2 && goatMoves.length > 10) {
      goatMoves = orderMoves(goatMoves, board, 'GOAT').slice(0, 10);
    } else {
      goatMoves = orderMoves(goatMoves, board, 'GOAT');
    }

    for (const move of goatMoves) {
      const next = applyMove(board, move, unplacedGoats, capturedGoats);
      const evalScore = minimax(
        next.nextBoard,
        next.nextPhase,
        next.nextTurn,
        next.nextUnplaced,
        next.nextCaptured,
        depth - 1,
        alpha,
        beta,
        true, // Tiger's turn next
        startTime,
        timeLimitMs
      );

      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) {
        break; // Alpha cut-off
      }
    }
    return minEval;
  }
}

/**
 * Finds the optimal move for the AI opponent based on difficulty.
 */
export function findBestMove(
  board: PieceType[],
  phase: GamePhase,
  turn: PlayerSide,
  unplacedGoats: number,
  capturedGoats: number,
  difficulty: AIDifficulty
): Move | null {
  const isTiger = turn === 'TIGER';
  const legalMoves = isTiger 
    ? getLegalMovesForTiger(board) 
    : getLegalMovesForGoat(board, phase, unplacedGoats);

  if (legalMoves.length === 0) return null;

  // EASY DIFFICULTY: Random moves with slight capture greediness for Tiger
  if (difficulty === 'EASY') {
    if (isTiger) {
      const captures = legalMoves.filter(m => m.type === 'CAPTURE');
      if (captures.length > 0 && Math.random() < 0.7) {
        return captures[Math.floor(Math.random() * captures.length)];
      }
    }
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  // MEDIUM: Minimax depth 3
  // HARD: Minimax depth 5 (with time budget fallback)
  const maxDepth = difficulty === 'HARD' ? 5 : 3;
  const timeLimitMs = difficulty === 'HARD' ? 900 : 400;
  const startTime = Date.now();

  let bestMove: Move = legalMoves[0];
  const ordered = orderMoves(legalMoves, board, turn);

  if (isTiger) {
    let bestValue = -Infinity;
    for (const move of ordered) {
      const next = applyMove(board, move, unplacedGoats, capturedGoats);
      const score = minimax(
        next.nextBoard,
        next.nextPhase,
        next.nextTurn,
        next.nextUnplaced,
        next.nextCaptured,
        maxDepth - 1,
        -Infinity,
        Infinity,
        false,
        startTime,
        timeLimitMs
      );

      if (score > bestValue) {
        bestValue = score;
        bestMove = move;
      }
    }
  } else {
    // Goat
    let bestValue = Infinity;
    for (const move of ordered) {
      const next = applyMove(board, move, unplacedGoats, capturedGoats);
      const score = minimax(
        next.nextBoard,
        next.nextPhase,
        next.nextTurn,
        next.nextUnplaced,
        next.nextCaptured,
        maxDepth - 1,
        -Infinity,
        Infinity,
        true,
        startTime,
        timeLimitMs
      );

      if (score < bestValue) {
        bestValue = score;
        bestMove = move;
      }
    }
  }

  return bestMove;
}

/**
 * Asynchronously calculates best move with a natural human-like delay (350-500ms).
 */
export async function getAIMoveAsync(
  board: PieceType[],
  phase: GamePhase,
  turn: PlayerSide,
  unplacedGoats: number,
  capturedGoats: number,
  difficulty: AIDifficulty
): Promise<Move | null> {
  const minDelayPromise = new Promise(resolve => setTimeout(resolve, 380));
  
  // Calculate best move in next macrotask
  const movePromise = new Promise<Move | null>(resolve => {
    setTimeout(() => {
      const move = findBestMove(board, phase, turn, unplacedGoats, capturedGoats, difficulty);
      resolve(move);
    }, 20);
  });

  const [, move] = await Promise.all([minDelayPromise, movePromise]);
  return move;
}
