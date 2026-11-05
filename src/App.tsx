import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { Scoreboard } from './components/Scoreboard';
import { GameBoard } from './components/GameBoard';
import { ControlsBar } from './components/ControlsBar';
import { GameOverModal } from './components/GameOverModal';
import { TutorialModal } from './components/TutorialModal';
import { SettingsModal } from './components/SettingsModal';
import { MoveHistoryDrawer } from './components/MoveHistoryDrawer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useGameStore } from './store/gameStore';

export default function App() {
  const setShowTutorial = useGameStore(s => s.setShowTutorial);

  useEffect(() => {
    // Check if first-time user to automatically present tutorial
    const tutorialSeen = localStorage.getItem('bagh_chal_tutorial_seen_v2');
    if (!tutorialSeen) {
      setShowTutorial(true);
      localStorage.setItem('bagh_chal_tutorial_seen_v2', 'true');
    }
  }, [setShowTutorial]);

  return (
    <div className="h-screen h-[100dvh] w-full bg-[#180B05] text-[#F5EBE1] flex flex-col justify-between selection:bg-amber-600 selection:text-white overscroll-none overflow-hidden select-none">
      {/* Offline Status Badge */}
      <OfflineIndicator />

      {/* Main Game Shell (Fits 100dvh with zero vertical scroll on any phone) */}
      <div className="w-full max-w-xl mx-auto flex flex-col flex-1 justify-between h-full overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Turn & Status HUD */}
        <Scoreboard />

        {/* Bagh Chal Responsive 5x5 Board */}
        <main className="flex-1 flex items-center justify-center my-auto w-full min-h-0 py-0.5">
          <GameBoard />
        </main>

        {/* Bottom Controls Bar */}
        <ControlsBar />
      </div>

      {/* Modals & Overlays */}
      <GameOverModal />
      <TutorialModal />
      <SettingsModal />
      <MoveHistoryDrawer />
    </div>
  );
}
