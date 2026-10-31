// Authentic chess sound generator using Web Audio API (Zero external assets, instant zero-latency response)
// Designed according to Apple & tournament haptics standards: crisp wooden click transients & ethereal soft pings.

class ChessAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Crisp, tactile click for standard piece movement.
   * Simulates the physical snap of a weighted wooden piece landing on a tournament board.
   */
  public playMove() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. High-frequency click / snap transient (tactile attack)
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(2800, now);
      clickOsc.frequency.exponentialRampToValueAtTime(600, now + 0.012);

      clickGain.gain.setValueAtTime(0.14, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.013);

      // 2. Warm wooden body knock ("thock")
      const bodyOsc = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      bodyOsc.type = 'sine';
      bodyOsc.frequency.setValueAtTime(320, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(110, now + 0.04);

      bodyGain.gain.setValueAtTime(0.22, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      bodyOsc.connect(bodyGain);
      bodyGain.connect(ctx.destination);
      bodyOsc.start(now);
      bodyOsc.stop(now + 0.042);

      // 3. Low-frequency felt absorption resonance
      const feltOsc = ctx.createOscillator();
      const feltGain = ctx.createGain();
      feltOsc.type = 'sine';
      feltOsc.frequency.setValueAtTime(160, now);
      feltOsc.frequency.exponentialRampToValueAtTime(80, now + 0.035);

      feltGain.gain.setValueAtTime(0.08, now);
      feltGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      feltOsc.connect(feltGain);
      feltGain.connect(ctx.destination);
      feltOsc.start(now);
      feltOsc.stop(now + 0.036);
    } catch {
      // Audio fails gracefully if blocked by browser autoplay policy
    }
  }

  /**
   * Soft, crystalline 'ping' for brilliant move annotations (!!).
   * Combines a crisp tactile piece placement with an ethereal, harmonic bell chime.
   */
  public playBrilliant() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // First trigger the tactile piece placement click
      this.playMove();

      // Soft crystalline bell harmonic chords: A6 (1760Hz), A7 (3520Hz overtone), E6 (1318.5Hz fifth)
      const harmonics = [
        { freq: 1760, gain: 0.12, decay: 0.48, delay: 0.004 },   // Celestial fundamental ping
        { freq: 3520, gain: 0.04, decay: 0.32, delay: 0.004 },   // Shimmering overtone
        { freq: 1318.5, gain: 0.07, decay: 0.38, delay: 0.012 }, // Gentle harmonic warmth
        { freq: 2637, gain: 0.03, decay: 0.25, delay: 0.014 },   // Delicate sparkle
      ];

      harmonics.forEach(({ freq, gain: peakGain, decay, delay }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const start = now + delay;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        // Soft, smooth attack prevents any harsh audio pop
        gainNode.gain.setValueAtTime(0.0001, start);
        gainNode.gain.linearRampToValueAtTime(peakGain, start + 0.008);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + decay);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + decay + 0.02);
      });
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Crisp, subtle micro-ping for Best Move annotations (★).
   */
  public playBest() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      this.playMove();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const start = now + 0.005;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1318.5, start); // E6
      osc.frequency.exponentialRampToValueAtTime(1760, start + 0.06); // Soft upward micro-glide

      gainNode.gain.setValueAtTime(0.0001, start);
      gainNode.gain.linearRampToValueAtTime(0.06, start + 0.006);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.13);
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Snappy dual-click tactile impact for captures.
   */
  public playCapture() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Initial capture collision snap (piece struck)
      const strikeOsc = ctx.createOscillator();
      const strikeGain = ctx.createGain();
      strikeOsc.type = 'triangle';
      strikeOsc.frequency.setValueAtTime(440, now);
      strikeOsc.frequency.exponentialRampToValueAtTime(180, now + 0.02);

      strikeGain.gain.setValueAtTime(0.18, now);
      strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      strikeOsc.connect(strikeGain);
      strikeGain.connect(ctx.destination);
      strikeOsc.start(now);
      strikeOsc.stop(now + 0.022);

      // 2. Second landing click (capturing piece firmly placed on board)
      const landTime = now + 0.024;
      const landOsc = ctx.createOscillator();
      const landGain = ctx.createGain();
      landOsc.type = 'sine';
      landOsc.frequency.setValueAtTime(310, landTime);
      landOsc.frequency.exponentialRampToValueAtTime(120, landTime + 0.038);

      landGain.gain.setValueAtTime(0.24, landTime);
      landGain.gain.exponentialRampToValueAtTime(0.001, landTime + 0.038);

      landOsc.connect(landGain);
      landGain.connect(ctx.destination);
      landOsc.start(landTime);
      landOsc.stop(landTime + 0.04);
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Muted, low wooden felt thud for blunders (??).
   * Informative, dignified, non-abrasive.
   */
  public playBlunder() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.125);
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Subtle muted wood tap for mistakes (?).
   */
  public playMistake() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.085);
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Ultra-subtle tactile tap when selecting or picking up a piece.
   */
  public playSelect() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.008);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.009);
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Crisp tournament check alert chime (+)
   */
  public playCheck() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      this.playMove();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + 0.006;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, start);
      osc.frequency.exponentialRampToValueAtTime(1174.66, start + 0.09);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.08, start + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.17);
    } catch {
      // Graceful fallback
    }
  }
}

export const chessAudio = new ChessAudioEngine();

