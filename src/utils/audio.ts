/**
 * Synthesized Web Audio API sound effects and Haptics for Bagh Chal.
 * Zero external audio files required, instant offline support, zero latency.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private hapticsEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setHapticsEnabled(enabled: boolean) {
    this.hapticsEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public isHapticsEnabled(): boolean {
    return this.hapticsEnabled;
  }

  public triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'double' | 'error') {
    if (!this.hapticsEnabled || typeof window === 'undefined' || !navigator.vibrate) return;
    try {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(25);
          break;
        case 'heavy':
          navigator.vibrate(50);
          break;
        case 'double':
          navigator.vibrate([15, 40, 20]);
          break;
        case 'error':
          navigator.vibrate([30, 30, 30]);
          break;
      }
    } catch {
      // Ignore vibration errors if restricted by device
    }
  }

  /**
   * Crisp wooden stone placement sound (for placing a goat)
   */
  public playPlacement() {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.08);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);

    this.triggerHaptic('light');
  }

  /**
   * Resonant woodblock slide & clack (for moving a piece)
   */
  public playMove() {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Strike 1: initial contact click
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(320, t);
    osc1.frequency.exponentialRampToValueAtTime(180, t + 0.09);

    gain1.gain.setValueAtTime(0.3, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.09);

    // Resonant wooden body tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(580, t);
    osc2.frequency.exponentialRampToValueAtTime(220, t + 0.07);

    gain2.gain.setValueAtTime(0.18, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t);
    osc2.stop(t + 0.07);

    this.triggerHaptic('light');
  }

  /**
   * Dramatic Tiger capture pounce sound: deep resonant growl sweep + snap
   */
  public playCapture() {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Low dramatic strike
    const oscLow = ctx.createOscillator();
    const gainLow = ctx.createGain();
    oscLow.type = 'sawtooth';
    oscLow.frequency.setValueAtTime(130, t);
    oscLow.frequency.exponentialRampToValueAtTime(45, t + 0.28);

    gainLow.gain.setValueAtTime(0.4, t);
    gainLow.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    oscLow.connect(gainLow);
    gainLow.connect(ctx.destination);
    oscLow.start(t);
    oscLow.stop(t + 0.28);

    // High snap
    const oscHigh = ctx.createOscillator();
    const gainHigh = ctx.createGain();
    oscHigh.type = 'triangle';
    oscHigh.frequency.setValueAtTime(880, t);
    oscHigh.frequency.exponentialRampToValueAtTime(220, t + 0.12);

    gainHigh.gain.setValueAtTime(0.3, t);
    gainHigh.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    oscHigh.connect(gainHigh);
    gainHigh.connect(ctx.destination);
    oscHigh.start(t);
    oscHigh.stop(t + 0.12);

    this.triggerHaptic('heavy');
  }

  /**
   * Tiger trapped alert sound (resonant Tibetan singing bowl bell chime)
   */
  public playTrapAlert() {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, t); // E5
    osc.frequency.exponentialRampToValueAtTime(587.33, t + 0.4); // D5

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.45);

    this.triggerHaptic('medium');
  }

  /**
   * Traditional brass fanfare for victory
   */
  public playVictory() {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const notes = [392.00, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
    const baseTime = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const t = baseTime + idx * 0.14;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const duration = idx === notes.length - 1 ? 0.8 : 0.22;
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + duration);
    });

    this.triggerHaptic('double');
  }

  /**
   * Gentle selection tap
   */
  public playSelect() {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(380, t + 0.04);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  /**
   * Invalid tap dull thud
   */
  public playInvalid() {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);

    this.triggerHaptic('error');
  }
}

export const audio = new SoundEngine();
