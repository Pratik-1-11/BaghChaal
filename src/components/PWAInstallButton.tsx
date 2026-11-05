import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, X, Smartphone } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        aria-label="Install Bagh Chal PWA App"
        className={`flex items-center gap-1.5 rounded-xl border border-amber-600/60 bg-amber-950/70 text-amber-200 hover:bg-amber-900/80 hover:text-amber-100 transition shadow-sm active:scale-95 ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm font-semibold'
        }`}
      >
        <Download className="w-4 h-4 text-amber-400" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          aria-label="Install Bagh Chal on iPhone or iPad"
          className={`flex items-center gap-1.5 rounded-xl border border-amber-600/50 bg-amber-950/60 text-amber-200 hover:bg-amber-900/70 hover:text-amber-100 transition text-xs active:scale-95 ${
            compact ? 'px-2 py-1.5' : 'px-3 py-2 font-medium'
          }`}
        >
          <Smartphone className="w-4 h-4 text-amber-400" />
          <span>Install PWA</span>
        </button>

        {showIOSGuide && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
          >
            <div className="w-full max-w-sm rounded-2xl bg-[#261005] border border-amber-600/60 p-6 text-amber-100 shadow-2xl relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-2 text-amber-400 hover:text-white rounded-lg hover:bg-amber-950"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-900/50 flex items-center justify-center border border-amber-600/40">
                  <Share2 className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 id="ios-install-title" className="text-base font-bold text-amber-200">
                    Install on iOS Safari
                  </h3>
                  <p className="text-xs text-amber-300/70">Play offline anytime like a native app</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-amber-100/90 leading-relaxed mb-5">
                <div className="flex items-start gap-2.5 bg-black/30 p-2.5 rounded-lg border border-amber-900/50">
                  <span className="w-5 h-5 rounded-full bg-amber-600/30 text-amber-300 flex items-center justify-center shrink-0 font-bold">1</span>
                  <p>Tap the <strong className="text-amber-300">Share</strong> button at the bottom of Safari.</p>
                </div>
                <div className="flex items-start gap-2.5 bg-black/30 p-2.5 rounded-lg border border-amber-900/50">
                  <span className="w-5 h-5 rounded-full bg-amber-600/30 text-amber-300 flex items-center justify-center shrink-0 font-bold">2</span>
                  <p>Scroll down and select <strong className="text-amber-300">Add to Home Screen</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5 bg-black/30 p-2.5 rounded-lg border border-amber-900/50">
                  <span className="w-5 h-5 rounded-full bg-amber-600/30 text-amber-300 flex items-center justify-center shrink-0 font-bold">3</span>
                  <p>Tap <strong className="text-amber-300">Add</strong> in top-right corner to finish!</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition shadow-md"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
