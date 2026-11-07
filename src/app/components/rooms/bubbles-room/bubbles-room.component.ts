import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { pop } from '../room-frame/tones';

/** How long lifting the wand to the lips takes. */
const RAISE_MS = 450;
/** The time between one bubble and the next in a breath. */
const BUBBLE_GAP_MS = 180;

interface Bubble {
  id: number;
  size: number;
  /** How far it drifts sideways on the way up, in cqi. */
  drift: number;
  seconds: number;
  hue: number;
}

interface Burst {
  id: number;
  x: number;
  y: number;
}

/**
 * Bubbles: someone stands on the grass with a bubble wand. Press Blow and
 * they lift it, blow a stream of bubbles that float off wobbling and
 * drifting, and lower it again. Tap a bubble to pop it in the air.
 */
@Component({
  selector: 'app-bubbles-room',
  imports: [RoomFrameComponent],
  template: `
    <app-room-frame status="ready">
      <div class="sky">
        @for (b of bubbles(); track b.id) {
          <button type="button" class="bubble" aria-label="Pop this bubble"
                  [style.--size]="b.size + 'cqi'"
                  [style.--drift]="b.drift + 'cqi'" [style.--hue]="b.hue"
                  [style.animation-duration.s]="b.seconds"
                  (pointerdown)="burst($event, b)" (animationend)="drop(b)"></button>
        }
        @for (s of bursts(); track s.id) {
          <span class="burst" [style.left.px]="s.x" [style.top.px]="s.y" aria-hidden="true"></span>
        }
      </div>

      <!-- Someone with a bubble wand, who lifts it and blows when asked. -->
      <svg class="sprite" [class.sprite--up]="pose() !== 'rest'" [class.sprite--blowing]="pose() === 'blowing'"
           viewBox="0 0 100 140" aria-hidden="true">
        <ellipse cx="50" cy="136" rx="24" ry="3.5" fill="rgba(30, 80, 20, 0.25)" />
        <rect x="39" y="98" width="9" height="32" rx="4" fill="#3d5a80" />
        <rect x="52" y="98" width="9" height="32" rx="4" fill="#3d5a80" />
        <path d="M35 136 a4 4 0 0 1 3 -8 h10 v8 z" fill="#e63946" />
        <path d="M51 136 v-8 h10 a5 4 0 0 1 4 8 z" fill="#e63946" />
        <!-- The other arm, resting. -->
        <path d="M39 68 q-6 14 -4 26" stroke="#c68642" stroke-width="7" stroke-linecap="round" fill="none" />
        <path d="M39 67 q-3 5 -4 9" stroke="#2a9d8f" stroke-width="9" stroke-linecap="round" fill="none" />
        <path d="M35 64 q15 -7 30 0 l3 38 q-18 5 -36 0 z" fill="#2a9d8f" />
        <path d="M33 84 q17 5 34 0" stroke="#e9c46a" stroke-width="4" fill="none" />
        <rect x="45" y="54" width="10" height="10" rx="3" fill="#b5763a" />
        <circle cx="50" cy="38" r="19" fill="#c68642" />
        <g fill="#2b2118">
          <circle cx="34" cy="31" r="7" /><circle cx="40" cy="23" r="8" /><circle cx="50" cy="19" r="8.5" />
          <circle cx="60" cy="22" r="7.5" /><circle cx="66" cy="29" r="5.5" /><circle cx="32" cy="40" r="5" />
        </g>
        <g class="sprite__eyes" fill="#1b1b1b">
          <ellipse cx="51" cy="38" rx="2" ry="2.6" /><ellipse cx="61" cy="38" rx="2" ry="2.6" />
        </g>
        <circle class="sprite__cheek" cx="64" cy="45" r="3.4" fill="#ff8fa3" opacity="0.65" />
        <circle class="sprite__cheek" cx="47" cy="45" r="3" fill="#ff8fa3" opacity="0.5" />
        <path class="sprite__smile" d="M54 46 q4 4 8 0" stroke="#5a2a1a" stroke-width="1.8" fill="none" stroke-linecap="round" />
        <ellipse class="sprite__o" cx="62" cy="47" rx="2.2" ry="2.6" fill="#5a2a1a" />
        <!-- The arm with the wand, which swings up from the shoulder. -->
        <g class="sprite__arm">
          <path d="M62 67 l2 21" stroke="#c68642" stroke-width="7" stroke-linecap="round" />
          <path d="M62 66 l1 8" stroke="#2a9d8f" stroke-width="9" stroke-linecap="round" />
          <line x1="64" y1="88" x2="71" y2="83" stroke="#8e5bd1" stroke-width="2.4" stroke-linecap="round" />
          <circle cx="74" cy="80" r="5" fill="rgba(210, 240, 255, 0.45)" stroke="#8e5bd1" stroke-width="2.2" />
          <circle cx="64" cy="88" r="4.2" fill="#c68642" />
        </g>
      </svg>

      <div class="bubbles__controls">
        <p class="room-words room-words--small">{{ popped() ? popped() + ' popped' : 'Blow some bubbles.' }}</p>
        <button type="button" class="room-button bubbles__blow" (click)="blow()" [disabled]="pose() !== 'rest'">Blow</button>
      </div>
    </app-room-frame>
  `,
  styles: `
    :host { display: contents; }
    app-room-frame {
      justify-content: flex-end;
      align-items: flex-end;
      background: linear-gradient(to bottom, #9fd8ff, #d8f0ff 60%, #b5e3a1 60%, #8fcf78);
      color: #1f4566;
    }
    .sky {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
      z-index: 2;
    }
    /* Blown from the wand's ring, wherever the raised wand puts it. */
    .bubble {
      position: absolute;
      left: 35cqi;
      bottom: calc(8cqh + 41.4cqi);
      width: var(--size);
      margin: 0 0 calc(var(--size) * -0.5) calc(var(--size) * -0.5);
      aspect-ratio: 1;
      padding: 0;
      border: 1px solid rgba(255, 255, 255, 0.85);
      border-radius: 50%;
      background:
        radial-gradient(circle at 30% 28%, rgba(255, 255, 255, 0.95) 0 8%, transparent 14%),
        radial-gradient(circle, transparent 55%, hsla(var(--hue), 90%, 75%, 0.45) 72%, hsla(calc(var(--hue) + 120), 90%, 75%, 0.55) 100%);
      cursor: pointer;
      pointer-events: auto;
      animation-name: float-up;
      animation-timing-function: ease-in;
      animation-fill-mode: forwards;
    }
    @keyframes float-up {
      0% { transform: translate(0, 0) scale(0.15); }
      12% { transform: translate(12cqi, -2cqh) scale(1); }
      40% { transform: translate(calc(22cqi + var(--drift) * 0.5), -28cqh) scale(1.04, 0.96); }
      100% { transform: translate(calc(26cqi + var(--drift)), -90cqh) scale(1); }
    }
    .burst {
      position: absolute;
      width: 12cqi;
      aspect-ratio: 1;
      margin: -6cqi 0 0 -6cqi;
      border-radius: 50%;
      border: 0.8cqi dotted rgba(255, 255, 255, 0.95);
      animation: burst 0.35s ease-out forwards;
    }
    @keyframes burst { to { transform: scale(1.8); opacity: 0; } }

    .sprite {
      position: absolute;
      left: 4cqi;
      bottom: 8cqh;
      width: 46cqi;
      overflow: visible;
      pointer-events: none;
    }
    .sprite__arm {
      transform-box: view-box;
      transform-origin: 62px 67px;
      transition: transform 420ms cubic-bezier(0.3, 0.7, 0.4, 1);
    }
    .sprite--up .sprite__arm { transform: rotate(-120deg); }
    .sprite__eyes { transform-box: fill-box; transform-origin: center; animation: blink 4.5s infinite; }
    @keyframes blink { 0%, 94%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.1); } }
    .sprite__cheek { transform-box: fill-box; transform-origin: center; transition: transform 200ms ease; }
    .sprite__o { display: none; }
    .sprite--blowing .sprite__o { display: inline; }
    .sprite--blowing .sprite__smile { display: none; }
    .sprite--blowing .sprite__cheek { transform: scale(1.5); }

    .bubbles__controls {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2cqi;
      width: 48%;
    }
    .bubbles__blow:disabled { opacity: 0.5; cursor: default; }
    @media (prefers-reduced-motion: reduce) {
      .sprite__arm { transition-duration: 0.01ms; }
      .sprite__eyes { animation: none; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BubblesRoomComponent {
  readonly bubbles = signal<Bubble[]>([]);
  readonly bursts = signal<Burst[]>([]);
  /** Arm down; arm up with the wand at the lips; or blowing through it. */
  readonly pose = signal<'rest' | 'up' | 'blowing'>('rest');
  readonly popped = signal(0);
  private nextId = 1;
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach(clearTimeout));
  }

  /**
   * Lift the wand, blow a breath of eight or so bubbles one after another,
   * then put the wand down again. A second press while blowing is ignored.
   */
  blow(): void {
    if (this.pose() !== 'rest') return;
    this.pose.set('up');
    const count = 7 + Math.floor(Math.random() * 4);
    this.later(() => this.pose.set('blowing'), RAISE_MS);
    for (let i = 0; i < count; i += 1) {
      this.later(() => {
        const bubble: Bubble = {
          id: this.nextId++,
          size: 8 + Math.random() * 12,
          drift: (Math.random() - 0.35) * 50,
          seconds: 5 + Math.random() * 4,
          hue: Math.floor(Math.random() * 360),
        };
        this.bubbles.update((all) => [...all, bubble]);
      }, RAISE_MS + i * BUBBLE_GAP_MS);
    }
    this.later(() => this.pose.set('rest'), RAISE_MS + count * BUBBLE_GAP_MS + 150);
  }

  burst(event: PointerEvent, bubble: Bubble): void {
    const sky = (event.currentTarget as HTMLElement).parentElement!.getBoundingClientRect();
    const id = this.nextId++;
    this.bursts.update((all) => [...all, { id, x: event.clientX - sky.left, y: event.clientY - sky.top }]);
    this.later(() => this.bursts.update((all) => all.filter((s) => s.id !== id)), 400);
    this.drop(bubble);
    this.popped.update((n) => n + 1);
    pop(1.4);
  }

  /** Popped, or floated away out of sight. */
  drop(bubble: Bubble): void {
    this.bubbles.update((all) => all.filter((b) => b !== bubble));
  }

  private later(work: () => void, ms: number): void {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      work();
    }, ms);
    this.timers.add(timer);
  }
}
