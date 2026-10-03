class WindAudioEngine {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private windSpeed: number = 5.0; // m/s default

  public init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    } catch {
      console.warn('Web Audio API is not supported in this browser.');
    }
  }

  public async start(): Promise<boolean> {
    this.init();
    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (this.isPlaying) return true;

    // Generate 5 seconds of procedural pink noise
    const bufferSize = this.ctx.sampleRate * 5;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.07;
      b6 = white * 0.115926;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    // Resonant bandpass filter simulating wind whistling & whooshing
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.Q.value = 3.5;

    // Master Gain
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 1.2);

    this.noiseNode.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    this.noiseNode.start(0);
    this.isPlaying = true;
    this.updateWindSound();
    return true;
  }

  public setWindSpeed(speedMps: number) {
    this.windSpeed = Math.max(0.5, Math.min(30, speedMps));
    if (this.isPlaying) {
      this.updateWindSound();
    }
  }

  private updateWindSound() {
    if (!this.filterNode || !this.ctx || !this.gainNode) return;
    // Map 1-25 m/s to 120Hz - 900Hz cutoff
    const targetFreq = 140 + Math.pow(this.windSpeed / 25, 0.75) * 850;
    this.filterNode.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.3);

    // Modulate gain slightly with wind velocity
    const targetGain = 0.04 + Math.min(0.25, (this.windSpeed / 30) * 0.22);
    this.gainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.4);
  }

  public stop() {
    if (!this.isPlaying || !this.gainNode || !this.ctx) return;
    this.gainNode.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.4);
    setTimeout(() => {
      try {
        this.noiseNode?.stop();
        this.noiseNode?.disconnect();
        this.filterNode?.disconnect();
        this.gainNode?.disconnect();
      } catch {
        // cleanup safe
      }
      this.isPlaying = false;
    }, 450);
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const windAudio = new WindAudioEngine();
