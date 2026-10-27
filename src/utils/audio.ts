/**
 * Web Audio API synthesizer for Ai La Trieu Phu sound effects.
 * Works seamlessly in all modern browsers without relying on external MP3 assets.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private tensionInterval: number | null = null;

  constructor() {
    // Lazily init AudioContext upon first user gesture
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('altp_muted');
      this.isMuted = savedMute === 'true';
    }
  }

  private initCtx(): AudioContext | null {
    if (this.isMuted) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('altp_muted', String(this.isMuted));
    }
    if (this.isMuted) {
      this.stopTension();
    }
    return this.isMuted;
  }

  /**
   * Snappy click sound for spinner / wheel ticks
   */
  public playSpinClick(pitchModifier = 1) {
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450 * pitchModifier, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.045);
  }

  /**
   * Joyous chime when spinner selects a student
   */
  public playSpinWinner() {
    const ctx = this.initCtx();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.09;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.36);
    });
  }

  /**
   * Click on an answer option
   */
  public playSelectOption() {
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.07);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  /**
   * Dramatic "Lock In" sound when user confirms answer
   */
  public playLockIn() {
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(160, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.5);

    osc2.frequency.setValueAtTime(320, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.55);
    osc2.stop(ctx.currentTime + 0.55);
  }

  /**
   * Correct answer celebration sound
   */
  public playCorrect(isMilestone = false) {
    const ctx = this.initCtx();
    if (!ctx) return;

    const notes = isMilestone 
      ? [392, 523.25, 659.25, 783.99, 1046.5, 1318.5] // G4, C5, E5, G5, C6, E6
      : [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5

    const duration = isMilestone ? 0.45 : 0.28;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.07;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    });
  }

  /**
   * Wrong answer dramatic sound
   */
  public playWrong() {
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(130, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(65, ctx.currentTime + 0.7);

    osc2.frequency.setValueAtTime(123.47, ctx.currentTime); // Dissonant half step
    osc2.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.7);

    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.75);
    osc2.stop(ctx.currentTime + 0.75);
  }

  /**
   * Lifeline sound (50:50, Audience, Phone, Switch)
   */
  public playLifeline() {
    const ctx = this.initCtx();
    if (!ctx) return;

    const notes = [300, 450, 600, 900];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const st = ctx.currentTime + i * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);

      gain.gain.setValueAtTime(0.18, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(st);
      osc.stop(st + 0.25);
    });
  }

  /**
   * Grand victory fanfare
   */
  public playGrandVictory() {
    const ctx = this.initCtx();
    if (!ctx) return;

    const chord1 = [261.63, 329.63, 392.00, 523.25]; // C major
    const chord2 = [349.23, 440.00, 523.25, 698.46]; // F major
    const chord3 = [392.00, 493.88, 587.33, 783.99]; // G major
    const chord4 = [523.25, 659.25, 783.99, 1046.5]; // C high triumph

    const sequences = [
      { chord: chord1, start: 0, dur: 0.3 },
      { chord: chord2, start: 0.35, dur: 0.3 },
      { chord: chord3, start: 0.7, dur: 0.35 },
      { chord: chord4, start: 1.1, dur: 0.9 },
    ];

    sequences.forEach(seq => {
      seq.chord.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const st = ctx.currentTime + seq.start;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, st);

        gain.gain.setValueAtTime(0.2, st);
        gain.gain.exponentialRampToValueAtTime(0.001, st + seq.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(st);
        osc.stop(st + seq.dur + 0.05);
      });
    });
  }

  /**
   * Start tension heartbeat drone while question is active
   */
  public startTension() {
    this.stopTension();
    if (this.isMuted) return;

    this.tensionInterval = window.setInterval(() => {
      if (this.isMuted) return;
      const ctx = this.initCtx();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    }, 1500);
  }

  public stopTension() {
    if (this.tensionInterval !== null) {
      clearInterval(this.tensionInterval);
      this.tensionInterval = null;
    }
  }
}

export const sounds = new SoundEngine();
