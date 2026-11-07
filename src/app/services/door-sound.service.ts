import { Injectable } from '@angular/core';

import { DoorMaterial } from '../components/doors/door/door-material';

/**
 * The sound a door makes.
 *
 * Every sound here is synthesised rather than played from a file. A knock, a
 * ting and a stone thud are each a shaped burst of noise or a couple of
 * oscillators, which costs a few hundred bytes of code instead of a few
 * hundred kilobytes of audio — and it means every material has its own voice
 * without anyone having to record one.
 *
 * Browsers refuse to start audio until the visitor has interacted with the
 * page, so the AudioContext is created on the first tap and not before.
 */
@Injectable({ providedIn: 'root' })
export class DoorSoundService {
  private context: AudioContext | null = null;

  /** Taps are quiet: a wall of doors should not be a wall of noise. */
  private readonly volume = 0.22;

  /**
   * The sound of knuckles on a door, which depends entirely on what it is
   * made of.
   */
  tap(material: DoorMaterial): void {
    const context = this.ensureContext();
    if (!context) return;

    switch (material) {
      case 'wood':
        this.knock(context, { thump: 180, decay: 0.13, noise: 0.5 });
        break;
      case 'stone':
        // Dense and dead: almost no ring, and it stops immediately.
        this.knock(context, { thump: 95, decay: 0.07, noise: 0.35 });
        break;
      case 'glass':
        this.ring(context, [2480, 3730, 5210], 0.55);
        break;
      case 'metal':
        // Inharmonic partials are what make metal sound like metal.
        this.ring(context, [520, 1190, 1810, 2630], 0.9);
        break;
    }
  }

  /**
   * A knock from the other side: the same sound, heard through the door.
   * Two knocks, because one could be anything.
   */
  knockBack(material: DoorMaterial): void {
    const context = this.ensureContext();
    if (!context) return;

    const muffled = context.createBiquadFilter();
    muffled.type = 'lowpass';
    muffled.frequency.value = 420;
    muffled.connect(context.destination);

    [0, 0.26].forEach((delay) => {
      this.knock(
        context,
        { thump: material === 'stone' ? 80 : 130, decay: 0.16, noise: 0.4 },
        muffled,
        delay
      );
    });
  }

  /**
   * Somebody inside calls out before opening the door.
   *
   * Uses the browser's own speech synthesis, which costs nothing to ship
   * and genuinely says the word. Not every browser has a voice ready, so
   * when there is none a muffled call is played instead — two soft tones
   * through a door, which reads as somebody answering even without words.
   */
  callOut(words: string): void {
    const canSpeak =
      typeof speechSynthesis !== 'undefined' &&
      speechSynthesis.getVoices().length > 0;

    if (canSpeak) {
      const utterance = new SpeechSynthesisUtterance(words);
      // Slightly low and unhurried, like someone crossing a room.
      utterance.rate = 0.95;
      utterance.pitch = 0.85;
      utterance.volume = 0.6;
      speechSynthesis.speak(utterance);
      return;
    }

    this.mutteredReply();
  }

  /** Two soft tones behind a door: somebody answering, words unclear. */
  private mutteredReply(): void {
    const context = this.ensureContext();
    if (!context) return;

    const throughTheDoor = context.createBiquadFilter();
    throughTheDoor.type = 'lowpass';
    throughTheDoor.frequency.value = 520;
    throughTheDoor.connect(context.destination);

    [
      { at: 0, frequency: 240, length: 0.22 },
      { at: 0.3, frequency: 190, length: 0.3 },
    ].forEach(({ at, frequency, length }) => {
      const now = context.currentTime + at;

      const voice = context.createOscillator();
      voice.type = 'sawtooth';
      voice.frequency.setValueAtTime(frequency, now);
      voice.frequency.exponentialRampToValueAtTime(frequency * 0.82, now + length);

      const level = context.createGain();
      level.gain.setValueAtTime(0.0001, now);
      level.gain.exponentialRampToValueAtTime(this.volume * 0.7, now + 0.05);
      level.gain.exponentialRampToValueAtTime(0.0001, now + length);

      voice.connect(level).connect(throughTheDoor);
      voice.start(now);
      voice.stop(now + length);
    });
  }

  /** The drawn-out complaint of a hinge that wants oiling. */
  creak(): void {
    const context = this.ensureContext();
    if (!context) return;

    const now = context.currentTime;
    const duration = 1.1;

    const oscillator = context.createOscillator();
    oscillator.type = 'sawtooth';
    // Sliding pitch with a wobble on top is what reads as a creak rather
    // than a tone.
    oscillator.frequency.setValueAtTime(230, now);
    oscillator.frequency.exponentialRampToValueAtTime(95, now + duration);

    const wobble = context.createOscillator();
    wobble.frequency.value = 17;
    const wobbleDepth = context.createGain();
    wobbleDepth.gain.value = 34;
    wobble.connect(wobbleDepth).connect(oscillator.frequency);

    const throat = context.createBiquadFilter();
    throat.type = 'bandpass';
    throat.frequency.value = 760;
    throat.Q.value = 5;

    const level = context.createGain();
    level.gain.setValueAtTime(0, now);
    level.gain.linearRampToValueAtTime(this.volume * 0.5, now + 0.1);
    level.gain.setValueAtTime(this.volume * 0.5, now + duration - 0.25);
    level.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(throat).connect(level).connect(context.destination);
    oscillator.start(now);
    wobble.start(now);
    oscillator.stop(now + duration);
    wobble.stop(now + duration);
  }

  /** A short, nasty noise for the door that has something behind it. */
  shriek(): void {
    const context = this.ensureContext();
    if (!context) return;

    const now = context.currentTime;
    const duration = 0.55;

    const oscillator = context.createOscillator();
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(880, now);
    oscillator.frequency.exponentialRampToValueAtTime(190, now + duration);

    const level = context.createGain();
    level.gain.setValueAtTime(this.volume * 0.9, now);
    level.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(level).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  /* ----------------------------------------------------------- the parts */

  /**
   * A thump plus a burst of noise: the shape of something solid being
   * struck. The noise is the impact, the sine is the body resonating.
   */
  private knock(
    context: AudioContext,
    shape: { thump: number; decay: number; noise: number },
    destination: AudioNode = context.destination,
    delay = 0
  ): void {
    const now = context.currentTime + delay;

    const body = context.createOscillator();
    body.type = 'sine';
    body.frequency.setValueAtTime(shape.thump, now);
    body.frequency.exponentialRampToValueAtTime(shape.thump * 0.6, now + shape.decay);

    const bodyLevel = context.createGain();
    bodyLevel.gain.setValueAtTime(this.volume, now);
    bodyLevel.gain.exponentialRampToValueAtTime(0.0001, now + shape.decay);

    body.connect(bodyLevel).connect(destination);
    body.start(now);
    body.stop(now + shape.decay);

    const impact = context.createBufferSource();
    impact.buffer = this.noiseBuffer(context, shape.decay);

    const colour = context.createBiquadFilter();
    colour.type = 'lowpass';
    colour.frequency.value = 1400;

    const impactLevel = context.createGain();
    impactLevel.gain.setValueAtTime(this.volume * shape.noise, now);
    impactLevel.gain.exponentialRampToValueAtTime(0.0001, now + shape.decay * 0.7);

    impact.connect(colour).connect(impactLevel).connect(destination);
    impact.start(now);
  }

  /**
   * Several partials struck together and left to die away: glass and metal.
   * Their frequencies are not multiples of one another, which is why they
   * sound like objects rather than notes.
   */
  private ring(context: AudioContext, partials: number[], decay: number): void {
    const now = context.currentTime;

    partials.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = 'triangle';
      oscillator.frequency.value = frequency;

      // Higher partials are quieter and fade first, as they do in life.
      const level = context.createGain();
      const share = this.volume / (index + 1.6);
      level.gain.setValueAtTime(share, now);
      level.gain.exponentialRampToValueAtTime(0.0001, now + decay / (index * 0.4 + 1));

      oscillator.connect(level).connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + decay);
    });
  }

  /** White noise, used as the impact part of a knock. */
  private noiseBuffer(context: AudioContext, seconds: number): AudioBuffer {
    const length = Math.max(1, Math.floor(context.sampleRate * seconds));
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const samples = buffer.getChannelData(0);

    for (let i = 0; i < length; i += 1) {
      samples[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Creates the AudioContext on first use. Returns null where the browser
   * has no Web Audio at all, so callers can simply do nothing.
   */
  private ensureContext(): AudioContext | null {
    if (this.context) {
      // Browsers suspend the context when a tab is backgrounded.
      if (this.context.state === 'suspended') void this.context.resume();
      return this.context;
    }

    if (typeof AudioContext === 'undefined') return null;

    this.context = new AudioContext();
    return this.context;
  }
}
