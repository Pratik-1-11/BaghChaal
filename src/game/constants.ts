import { PieceType, PointCoords, JumpOpportunity } from './types';

export const BOARD_SIZE = 5;
export const TOTAL_POINTS = 25;
export const TOTAL_GOATS = 20;
export const GOATS_NEEDED_FOR_TIGER_WIN = 5;

// Column letters A through E, row numbers 1 through 5
const COL_LETTERS = ['A', 'B', 'C', 'D', 'E'];
const ROW_NUMBERS = ['1', '2', '3', '4', '5'];

export function indexToCoords(idx: number): { row: number; col: number } {
  return {
    row: Math.floor(idx / BOARD_SIZE),
    col: idx % BOARD_SIZE,
  };
}

export function coordsToIndex(row: number, col: number): number {
  return row * BOARD_SIZE + col;
}

export function getPointLabel(idx: number): string {
  const { row, col } = indexToCoords(idx);
  return `${COL_LETTERS[col]}${ROW_NUMBERS[row]}`;
}

export const POINTS_DATA: PointCoords[] = Array.from({ length: TOTAL_POINTS }, (_, idx) => {
  const { row, col } = indexToCoords(idx);
  return {
    index: idx,
    row,
    col,
    label: getPointLabel(idx),
    isDiagonalNode: (row + col) % 2 === 0,
  };
});

/**
 * Standard Bagh Chal Adjacency List:
 * - All orthogonal steps: (dr=0, dc=±1) and (dr=±1, dc=0)
 * - Diagonal steps: (dr=±1, dc=±1) ONLY IF (r + c) % 2 === 0
 * This forms the exact traditional Bagh Chal network (outer diamond + central X diagonals + corner diagonals).
 */
export const ADJACENCY_LIST: number[][] = Array.from({ length: TOTAL_POINTS }, (_, idx) => {
  const { row, col } = indexToCoords(idx);
  const neighbors: number[] = [];

  // Orthogonal neighbors
  const orthogonalDeltas = [
    [-1, 0], [1, 0], [0, -1], [0, 1]
  ];
  for (const [dr, dc] of orthogonalDeltas) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
      neighbors.push(coordsToIndex(nr, nc));
    }
  }

  // Diagonal neighbors (only on even-sum coordinates)
  if ((row + col) % 2 === 0) {
    const diagonalDeltas = [
      [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];
    for (const [dr, dc] of diagonalDeltas) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
        neighbors.push(coordsToIndex(nr, nc));
      }
    }
  }

  return neighbors;
});

/**
 * Precomputed straight-line jumps for Tigers:
 * Tiger jumps 2 steps in any valid line direction (dr, dc) over an adjacent point.
 */
export const JUMP_MAP: JumpOpportunity[][] = Array.from({ length: TOTAL_POINTS }, (_, idx) => {
  const { row, col } = indexToCoords(idx);
  const jumps: JumpOpportunity[] = [];

  // Orthogonal jumps (length 2)
  const orthogonalDirs = [
    [-1, 0], [1, 0], [0, -1], [0, 1]
  ];
  for (const [dr, dc] of orthogonalDirs) {
    const midRow = row + dr;
    const midCol = col + dc;
    const landRow = row + dr * 2;
    const landCol = col + dc * 2;

    if (landRow >= 0 && landRow < BOARD_SIZE && landCol >= 0 && landCol < BOARD_SIZE) {
      jumps.push({
        over: coordsToIndex(midRow, midCol),
        to: coordsToIndex(landRow, landCol),
      });
    }
  }

  // Diagonal jumps (length 2, only from even-sum nodes)
  if ((row + col) % 2 === 0) {
    const diagDirs = [
      [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];
    for (const [dr, dc] of diagDirs) {
      const midRow = row + dr;
      const midCol = col + dc;
      const landRow = row + dr * 2;
      const landCol = col + dc * 2;

      // Note: in Bagh Chal, diagonal jump must follow the board line.
      // If (row, col) has (row+col)%2===0, then mid is odd-sum, but the diagonal line connects (row,col) to (landRow,landCol)
      // which both have even sums!
      if (landRow >= 0 && landRow < BOARD_SIZE && landCol >= 0 && landCol < BOARD_SIZE) {
        jumps.push({
          over: coordsToIndex(midRow, midCol),
          to: coordsToIndex(landRow, landCol),
        });
      }
    }
  }

  return jumps;
});

/**
 * Precomputed lines for SVG rendering
 * 1. 5 horizontal lines
 * 2. 5 vertical lines
 * 3. 2 main diagonals
 * 4. 4 diamond diagonals
 */
export interface BoardLine {
  from: number;
  to: number;
  type: 'outer' | 'grid' | 'diagonal';
}

export const BOARD_LINES: BoardLine[] = [
  // 5 Horizontal lines
  { from: 0, to: 4, type: 'outer' },
  { from: 5, to: 9, type: 'grid' },
  { from: 10, to: 14, type: 'grid' },
  { from: 15, to: 19, type: 'grid' },
  { from: 20, to: 24, type: 'outer' },

  // 5 Vertical lines
  { from: 0, to: 20, type: 'outer' },
  { from: 1, to: 21, type: 'grid' },
  { from: 2, to: 22, type: 'grid' },
  { from: 3, to: 23, type: 'grid' },
  { from: 4, to: 24, type: 'outer' },

  // 2 Full Main Diagonals
  { from: 0, to: 24, type: 'diagonal' },
  { from: 4, to: 20, type: 'diagonal' },

  // Inscribed Diamond
  { from: 2, to: 10, type: 'diagonal' }, // top center to left center
  { from: 2, to: 14, type: 'diagonal' }, // top center to right center
  { from: 10, to: 22, type: 'diagonal' }, // left center to bottom center
  { from: 14, to: 22, type: 'diagonal' }, // right center to bottom center
];

/**
 * Initial board layout:
 * 4 Tigers on the 4 corners: 0 (A1), 4 (E1), 20 (A5), 24 (E5)
 * All other 21 points are EMPTY.
 */
export function getInitialBoard(): PieceType[] {
  const board: PieceType[] = Array(TOTAL_POINTS).fill('EMPTY');
  board[0] = 'TIGER';
  board[4] = 'TIGER';
  board[20] = 'TIGER';
  board[24] = 'TIGER';
  return board;
}
