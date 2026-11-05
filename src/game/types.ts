/**
 * Bagh Chal Game Types and State Definitions
 */

export type PieceType = 'EMPTY' | 'TIGER' | 'GOAT';

export type PlayerSide = 'GOAT' | 'TIGER';

export type GamePhase = 'PLACEMENT' | 'MOVEMENT';

export type GameMode = 'PVP' | 'PVE'; // Pass-and-Play or vs AI

export type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type BoardTheme = 'wood' | 'slate';

export type GameStatus = 
  | 'PLAYING' 
  | 'TIGER_WON' 
  | 'GOAT_WON' 
  | 'DRAW_REPETITION' 
  | 'DRAW_AGREED';

export interface Move {
  type: 'PLACE' | 'MOVE' | 'CAPTURE';
  piece: PieceType;
  from?: number; // point index 0..24
  to: number;   // destination point index 0..24
  capturedPoint?: number; // point index of captured goat
  notation: string; // e.g. "G @ C3", "T A1->B2", "T A1x(B2)->C3"
  timestamp: number;
}

export interface BoardSnapshot {
  board: PieceType[];
  turn: PlayerSide;
  phase: GamePhase;
  unplacedGoats: number;
  capturedGoats: number;
  lastMove?: Move;
}

export interface PointCoords {
  index: number;
  row: number; // 0..4
  col: number; // 0..4
  label: string; // e.g. "A1", "C3"
  isDiagonalNode: boolean;
}

export interface JumpOpportunity {
  over: number;
  to: number;
}
