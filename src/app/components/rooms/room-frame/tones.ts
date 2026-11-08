/**
 * Small sounds for the rooms that make them -- pops, notes, a rattle --
 * synthesised on the spot with the Web Audio API, so there are no sound
 * files. Quiet, and only ever in answer to the visitor doing something.
 */
let context: AudioContext | undefined;

function audio(): AudioContext | undefined {
  if (typeof AudioContext === 'undefined') return undefined;
  context ??= new AudioContext();
  if (context.state === 'suspended') void context.resume();
  return context;
}

function noise(ctx: AudioContext, seconds: number): AudioBuffer {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** A pop: a burst of noise, bright and very short. */
export function pop(pitch = 1): void {
  const ctx = audio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const burst = ctx.createBufferSource();
  burst.buffer = noise(ctx, 0.06);
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200 * pitch;
  filter.Q.value = 1.5;
  const level = ctx.createGain();
  level.gain.setValueAtTime(0.5, now);
  level.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
  burst.connect(filter).connect(level).connect(ctx.destination);
  burst.start(now);
}

/** A struck bar: a bright tone that rings and fades, like a xylophone. */
export function bar(frequency: number): void {
  const ctx = audio();
  if (!ctx) return;
  const now = ctx.currentTime;
  for (const [ratio, loudness] of [[1, 0.22], [3.9, 0.05]]) {
    const tone = ctx.createOscillator();
    const level = ctx.createGain();
    tone.type = 'sine';
    tone.frequency.value = frequency * ratio;
    level.gain.setValueAtTime(loudness, now);
    level.gain.exponentialRampToValueAtTime(0.0001, now + (ratio === 1 ? 1.2 : 0.25));
    tone.connect(level).connect(ctx.destination);
    tone.start(now);
    tone.stop(now + 1.3);
  }
}

/** A soft rising chime, for getting something right. */
export function chime(): void {
  [660, 880, 1320].forEach((frequency, i) => setTimeout(() => bar(frequency), i * 90));
}

/** Dice rattling: a few quick clicks. */
export function rattle(times = 6): void {
  for (let i = 0; i < times; i += 1) setTimeout(() => pop(1.6 + Math.random()), i * 55);
}
