/** WebAudio 合成音效（参照 legacy engine/sound.ts：振荡器 + 包络，无采样文件）。 */
type SoundName =
  | 'sword' | 'fireball' | 'thunder' | 'pickup' | 'hurt'
  | 'levelup' | 'gameover' | 'victory' | 'talisman' | 'ultimate';

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private master: GainNode | null = null;

  /** 必须在用户手势后调用。 */
  init(): void {
    if (this.ctx) return;
    try {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.35;
      this.master.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  get isMuted(): boolean {
    return this.muted;
  }

  private tone(
    freq: number, duration: number, type: OscillatorType = 'sine',
    volume = 0.4, slideTo?: number, delay = 0,
  ): void {
    if (!this.ctx || !this.master || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + duration);
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + duration);
  }

  private noise(duration: number, volume = 0.3, delay = 0): void {
    if (!this.ctx || !this.master || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    src.connect(gain);
    gain.connect(this.master);
    src.start(t0);
  }

  play(name: SoundName): void {
    switch (name) {
      case 'sword':
        this.tone(1200, 0.08, 'sawtooth', 0.12, 400);
        break;
      case 'fireball':
        this.tone(220, 0.15, 'square', 0.15, 80);
        this.noise(0.1, 0.08);
        break;
      case 'thunder':
        this.noise(0.35, 0.3);
        this.tone(90, 0.3, 'sawtooth', 0.25, 40);
        break;
      case 'pickup':
        this.tone(880, 0.07, 'sine', 0.15, 1320);
        break;
      case 'hurt':
        this.tone(160, 0.12, 'square', 0.2, 90);
        break;
      case 'levelup':
        this.tone(523, 0.1, 'sine', 0.2);
        this.tone(659, 0.1, 'sine', 0.2, undefined, 0.1);
        this.tone(784, 0.18, 'sine', 0.25, undefined, 0.2);
        break;
      case 'gameover':
        this.tone(440, 0.3, 'sawtooth', 0.2, 110);
        this.tone(220, 0.5, 'sawtooth', 0.2, 55, 0.25);
        break;
      case 'victory':
        this.tone(523, 0.15, 'sine', 0.25);
        this.tone(659, 0.15, 'sine', 0.25, undefined, 0.15);
        this.tone(784, 0.15, 'sine', 0.25, undefined, 0.3);
        this.tone(1047, 0.4, 'sine', 0.3, undefined, 0.45);
        break;
      case 'talisman':
        this.noise(0.25, 0.25);
        this.tone(300, 0.3, 'square', 0.2, 60);
        break;
      case 'ultimate':
        this.tone(180, 0.5, 'sawtooth', 0.25, 720);
        this.noise(0.4, 0.2, 0.1);
        break;
    }
  }
}

export const sound = new SoundEngine();
