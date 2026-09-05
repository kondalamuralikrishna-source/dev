// Real-Time Ambient Sound Synthesizer & Backchannel Audio Engine for FluidConvo AI
// Built using standard Web Audio API with pink/brownian noise synthesis and procedural acoustics

import { AmbientSoundType } from "../types";

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentAmbientType: AmbientSoundType = "none";
  private activeNodes: (AudioNode | number)[] = [];
  private isRunning: boolean = false;
  private volume: number = 0.25;

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
    }
  }

  public stopAmbient() {
    this.currentAmbientType = "none";
    this.isRunning = false;
    this.activeNodes.forEach((node) => {
      if (typeof node === "number") {
        window.clearInterval(node);
      } else if (node && "stop" in node && typeof (node as any).stop === "function") {
        try {
          (node as any).stop();
          (node as any).disconnect();
        } catch (e) {}
      } else if (node && "disconnect" in node) {
        try {
          node.disconnect();
        } catch (e) {}
      }
    });
    this.activeNodes = [];
  }

  public startAmbient(type: AmbientSoundType) {
    this.stopAmbient();
    if (type === "none") return;

    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.currentAmbientType = type;
    this.isRunning = true;

    switch (type) {
      case "coffee_shop":
        this.createCoffeeShopAtmosphere();
        break;
      case "busy_airport":
        this.createAirportAtmosphere();
        break;
      case "boardroom":
        this.createBoardroomAtmosphere();
        break;
      case "city_street":
        this.createCityStreetAtmosphere();
        break;
      case "emergency_dispatch":
        this.createEmergencyAtmosphere();
        break;
    }
  }

  // Generate pink noise buffer for warm organic background rumble
  private createNoiseBuffer(durationSeconds: number = 3): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // 1. Coffee Shop: Low rumble, warm chatter filter, intermittent ceramic clink
  private createCoffeeShopAtmosphere() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(4);
    if (!noiseBuffer) return;

    // Room presence
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 450;
    filter.Q.value = 1.2;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.35;

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noiseNode.start();

    this.activeNodes.push(noiseNode, filter, gain);

    // Periodic subtle cup clink/stir
    const interval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.isRunning) return;
      try {
        const osc = this.ctx.createOscillator();
        const clinkGain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(2200 + Math.random() * 800, this.ctx.currentTime);
        clinkGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        clinkGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);

        osc.connect(clinkGain);
        clinkGain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.16);
      } catch (e) {}
    }, 4500);

    this.activeNodes.push(interval);
  }

  // 2. Busy Airport: Low jet hum, wide terminal reverberation, periodic PA chime
  private createAirportAtmosphere() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(5);
    if (!noiseBuffer) return;

    // Jet / HVAC rumble
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 280;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.45;

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noiseNode.start();

    this.activeNodes.push(noiseNode, filter, gain);

    // Periodic airport PA ding-dong chime
    const interval = window.setInterval(() => {
      this.playAirportPAChime();
    }, 12000);

    this.activeNodes.push(interval);
  }

  public playAirportPAChime() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const notes = [587.33, 880.0]; // D5 -> A5 chime

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const noteGain = this.ctx!.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.28);
      noteGain.gain.setValueAtTime(0, now + idx * 0.28);
      noteGain.gain.linearRampToValueAtTime(0.08, now + idx * 0.28 + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.28 + 0.6);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain!);
      osc.start(now + idx * 0.28);
      osc.stop(now + idx * 0.28 + 0.65);
    });
  }

  // 3. Boardroom: Subtle high-efficiency HVAC hum, clean acoustics
  private createBoardroomAtmosphere() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 60; // 60Hz power/air conditioning floor

    const gain = this.ctx.createGain();
    gain.gain.value = 0.08;

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();

    this.activeNodes.push(osc, gain);
  }

  // 4. City Street: Traffic wash, tire rumble, distant horn
  private createCityStreetAtmosphere() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(5);
    if (!noiseBuffer) return;

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 220;
    filter.Q.value = 0.8;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.4;

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noiseNode.start();

    this.activeNodes.push(noiseNode, filter, gain);
  }

  // 5. Emergency Dispatch: Radio carrier hiss + emergency beeps
  private createEmergencyAtmosphere() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(3);
    if (!noiseBuffer) return;

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1400;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.06;

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noiseNode.start();

    this.activeNodes.push(noiseNode, filter, gain);
  }

  // Synthesize instant backchannel audio acknowledgment ("Uh-huh" / "Mm-hmm" tone pulse)
  public playBackchannelAcousticCue(type: "affirmative" | "acknowledgment" | "clarification" = "acknowledgment") {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";

    if (type === "affirmative") {
      // Rising inflection (Mm-hmm!)
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.18);
    } else if (type === "clarification") {
      // Question inflection (Huh?)
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(392, now + 0.15);
    } else {
      // Grounded nod (I see / mm)
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
    }

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }
}

export const ambientAudioEngine = new AmbientAudioEngine();
