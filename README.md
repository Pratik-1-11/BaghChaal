# Bagh Chal (बाघचाल) - Nepali Tiger and Goat Board Game

A production-ready, mobile-first Progressive Web App (PWA) implementation of the traditional Nepali strategic board game **Bagh Chal** (Tigers & Goats).

## Overview
Bagh Chal is an asymmetric two-player strategic game originating from the high Himalayas of Nepal:
- **4 Tigers (बाघ)**: Hunt and capture goats by jumping over them in a straight line.
- **20 Goats (बाख्रा)**: Encircle and immobilize all 4 tigers through collective coordination.

## Game Rules
1. **Topology**:
   - 5×5 grid with 25 intersection points.
   - All horizontal and vertical lines.
   - Diagonal lines connecting even-sum intersection points (the standard traditional Alquerque / Bagh Chal grid with 4 corner 2×2 squares and central 3×3 square diagonals, forming the inner diamond and two full diagonals).

2. **Setup**:
   - 4 Tigers start on the 4 corners: `(0,0)`, `(0,4)`, `(4,0)`, `(4,4)`.
   - 20 Goats start off-board unplaced.

3. **Phases**:
   - **Phase 1: Placement**: Goat player goes first. Places 1 goat per turn on any vacant point. Tigers move 1 step or jump-capture on their turns.
   - **Phase 2: Movement**: Begins after all 20 goats are placed. Both players move 1 piece per turn to an adjacent vacant intersection.

4. **Captures**:
   - A Tiger may leap over a single adjacent goat in a straight line to an empty point immediately behind it.
   - Captured goats are permanently removed.
   - Capture is optional (not mandatory). Tigers cannot leap over other tigers.

5. **Win & Draw Conditions**:
   - **Tigers Win**: If they capture 5 goats.
   - **Goats Win**: If all 4 tigers are blocked (no legal moves on tigers' turn).
   - **Draw**: Threefold repetition of the same board position.

## Features
- **PWA & Offline First**: Full Web App Manifest, Service Worker caching, and iOS/Android home-screen installability.
- **Minimax AI Opponent**:
  - *Easy*: Casual random and opportunistic play.
  - *Medium*: Minimax depth 3 calculation.
  - *Hard*: Minimax depth 5 with alpha-beta pruning, move ordering (captures and central control first), and positional evaluation.
- **Pass & Play (2 Players)**: Local two-player pass-and-play mode on a shared screen.
- **Web Audio & Haptics Engine**: 100% synthesized Web Audio API sound effects (resonant wood clacks, tiger growls, bells) and vibration haptics with zero external audio assets required.
- **Visual Design**: Authentic Nepali aesthetic with warm terracotta, teak wood grain, slate theme, brass corner brackets, and Mithila-inspired cultural artwork.
- **Accessibility & Mobile Ergonomics**:
  - Minimum 44px+ touch targets on all interactive points.
  - Keyboard navigation (Arrow keys + Enter/Space to select or place).
  - ARIA live announcements for screen readers.
  - Undo functionality and move history with algebraic notation.

## Tech Stack
- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Framer Motion (`motion`)
- Zustand for state management with LocalStorage persistence
- `vite-plugin-pwa` for Progressive Web App capabilities
- Web Audio API for zero-latency, offline sound synthesis

## Setup & Running Locally
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build
```
