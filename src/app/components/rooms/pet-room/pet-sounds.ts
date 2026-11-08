/**
 * Pip's noises, made on the spot with the Web Audio API -- no sound files.
 * Quiet on purpose, and only ever in answer to something the visitor did.
 */
export class PetSounds {
  private context?: AudioContext;

  private audio(): AudioContext | undefined {
    if (typeof AudioContext === 'undefined') return undefined;
    this.context ??= new AudioContext();
    if (this.context.state === 'suspended') void this.context.resume();
    return this.context;
  }

  /**
   * Two quick bird-like chirps, for a poke. Cheetahs chirp rather than
   * meow -- the cubs especially.
   */
  chirp(): void {
    const ctx = this.audio();
    if (!ctx) return;
    for (let note = 0; note < 2; note += 1) {
      const now = ctx.currentTime + note * 0.13;
      const tone = ctx.createOscillator();
      const level = ctx.createGain();
      tone.type = 'sine';
      tone.frequency.setValueAtTime(1800, now);
      tone.frequency.exponentialRampToValueAtTime(2600, now + 0.04);
      tone.frequency.exponentialRampToValueAtTime(1500, now + 0.09);
      level.gain.setValueAtTime(0.0001, now);
      level.gain.exponentialRampToValueAtTime(0.1, now + 0.015);
      level.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      tone.connect(level).connect(ctx.destination);
      tone.start(now);
      tone.stop(now + 0.11);
    }
  }

  /** A grumble, lower and buzzier, for one poke too many. */
  grumble(): void {
    const ctx = this.audio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const tone = ctx.createOscillator();
    const level = ctx.createGain();
    tone.type = 'sawtooth';
    tone.frequency.setValueAtTime(220, now);
    tone.frequency.exponentialRampToValueAtTime(140, now + 0.35);
    level.gain.setValueAtTime(0.0001, now);
    level.gain.exponentialRampToValueAtTime(0.06, now + 0.03);
    level.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    tone.connect(level).connect(ctx.destination);
    tone.start(now);
    tone.stop(now + 0.42);
  }

  /**
   * A purr: soft rumbling noise, its loudness throbbing about twenty-five
   * times a second, the way a cat's does.
   */
  purr(seconds = 1.4): void {
    const ctx = this.audio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noise(ctx, seconds);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320;
    const level = ctx.createGain();
    level.gain.setValueAtTime(0.0001, now);
    level.gain.linearRampToValueAtTime(0.35, now + 0.15);
    level.gain.linearRampToValueAtTime(0.35, now + seconds - 0.3);
    level.gain.linearRampToValueAtTime(0.0001, now + seconds);
    const throb = ctx.createOscillator();
    const depth = ctx.createGain();
    throb.frequency.value = 25;
    depth.gain.value = 0.3;
    throb.connect(depth).connect(level.gain);
    noise.connect(filter).connect(level).connect(ctx.destination);
    noise.start(now);
    throb.start(now);
    noise.stop(now + seconds);
    throb.stop(now + seconds);
  }

  /** Three little bites. */
  munch(): void {
    const ctx = this.audio();
    if (!ctx) return;
    for (let bite = 0; bite < 3; bite += 1) {
      const start = ctx.currentTime + bite * 0.22;
      const crunch = ctx.createBufferSource();
      crunch.buffer = this.noise(ctx, 0.08);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1500;
      const level = ctx.createGain();
      level.gain.setValueAtTime(0.18, start);
      level.gain.exponentialRampToValueAtTime(0.0001, start + 0.08);
      crunch.connect(filter).connect(level).connect(ctx.destination);
      crunch.start(start);
    }
  }

  private noise(ctx: AudioContext, seconds: number): AudioBuffer {
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    return buffer;
  }
}
