// Audio Synthesizer using Web Audio API for Stress Test Soundscapes
// Zero external mp3 dependencies; works 100% reliably in any modern browser.

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private heartbeatInterval: any = null;
  private ambientSource: AudioNode | null = null;
  private ambientGain: GainNode | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopHeartbeat();
      this.stopAmbient();
    }
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  // Play a single heart thump "lub-dub"
  public playHeartbeatThump(intensity: number = 1.0) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // First beat (Lub) - ~60Hz
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(65, now);
    osc1.frequency.exponentialRampToValueAtTime(35, now + 0.12);

    gain1.gain.setValueAtTime(0.35 * intensity, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.13);

    // Second beat (Dub) - ~80Hz slightly louder and shorter
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(80, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(40, now + 0.28);

    gain2.gain.setValueAtTime(0.45 * intensity, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.29);
  }

  // Start continuous heartbeat with dynamic BPM
  public startHeartbeat(bpm: number = 75) {
    this.stopHeartbeat();
    if (this.isMuted) return;

    const intervalMs = (60 / bpm) * 1000;
    this.playHeartbeatThump(bpm > 100 ? 1.2 : 0.8);

    this.heartbeatInterval = setInterval(() => {
      this.playHeartbeatThump(bpm > 100 ? 1.2 : 0.8);
    }, intervalMs);
  }

  public updateHeartbeatBpm(bpm: number) {
    if (this.heartbeatInterval) {
      this.startHeartbeat(bpm);
    }
  }

  public stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Ticking sound for countdown clock
  public playClockTick(isUrgent: boolean = false) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isUrgent ? "sawtooth" : "sine";
    osc.frequency.setValueAtTime(isUrgent ? 880 : 600, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.04);

    gain.gain.setValueAtTime(isUrgent ? 0.25 : 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Stress interruption alert gong
  public playSurpriseInterruptionAlert() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(220, now + 0.35);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  // Time expired buzzer
  public playTimeExpiredBuzzer() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.setValueAtTime(130, now + 0.2);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  // Celebratory Chime
  public playCelebrationChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const now = ctx.currentTime + i * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    });
  }

  // Synthesize soft ambient noise simulation (Airport/Office/Emergency)
  public startAmbientNoise(type: "airport" | "office" | "emergency" | "silent") {
    this.stopAmbient();
    if (type === "silent" || this.isMuted) return;

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);

      // Pink/Brown noise generator
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.1;
        b2 = 0.85 * b2 + white * 0.2;
        output[i] = (b0 + b1 + b2) * 0.15;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      whiteNoise.loop = true;

      // Filter to shape sound
      const filter = ctx.createBiquadFilter();
      if (type === "airport") {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(450, ctx.currentTime);
      } else if (type === "office") {
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(800, ctx.currentTime);
      } else {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(300, ctx.currentTime);
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      this.ambientSource = whiteNoise;
      this.ambientGain = gain;
    } catch (e) {
      console.warn("Ambient noise not supported in this browser:", e);
    }
  }

  public stopAmbient() {
    if (this.ambientSource) {
      try {
        (this.ambientSource as any).stop?.();
        this.ambientSource.disconnect();
      } catch (e) {}
      this.ambientSource = null;
    }
  }

  public cleanup() {
    this.stopHeartbeat();
    this.stopAmbient();
  }
}

export const soundFx = new SoundSynthesizer();
