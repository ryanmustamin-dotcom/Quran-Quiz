class AudioService {
  private audioContext: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Initialize lazily to handle browser autoplay policies
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    } catch (e) {
      console.error("Web Audio API not supported", e);
    }
  }

  private initContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    if (!this.audioContext) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            this.audioContext = new AudioContextClass();
        }
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMutedState() {
    return this.isMuted;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0, vol: number = 0.1) {
    if (this.isMuted || !this.audioContext) return;
    this.initContext();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + startTime);

    gain.gain.setValueAtTime(vol, this.audioContext.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(this.audioContext.currentTime + startTime);
    osc.stop(this.audioContext.currentTime + startTime + duration);
  }

  public playCorrect() {
    // Ascending major chord (C - E - G)
    this.playTone(523.25, 'sine', 0.3, 0, 0.1); // C5
    this.playTone(659.25, 'sine', 0.3, 0.1, 0.1); // E5
    this.playTone(783.99, 'sine', 0.6, 0.2, 0.1); // G5
  }

  public playWrong() {
    // Dissonant low tone
    this.playTone(150, 'sawtooth', 0.4, 0, 0.05);
    this.playTone(140, 'sawtooth', 0.4, 0.1, 0.05);
  }

  public playClick() {
    // Short high tick
    this.playTone(800, 'triangle', 0.05, 0, 0.05);
  }

  public playTick() {
    // Wooden block sound simulation
    this.playTone(600, 'sine', 0.1, 0, 0.1);
  }

  public playWin() {
    // Victory fanfare
    const now = 0;
    this.playTone(523.25, 'square', 0.2, now, 0.05);      // C
    this.playTone(523.25, 'square', 0.2, now + 0.1, 0.05); // C
    this.playTone(523.25, 'square', 0.2, now + 0.2, 0.05); // C
    this.playTone(659.25, 'square', 0.6, now + 0.3, 0.05); // E (Long)
    this.playTone(783.99, 'square', 0.6, now + 0.6, 0.05); // G (Long)
  }
}

export const audioService = new AudioService();