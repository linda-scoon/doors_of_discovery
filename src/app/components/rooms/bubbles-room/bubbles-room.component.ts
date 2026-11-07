import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { pop } from '../room-frame/tones';

interface Bubble {
  id: number;
  /** Where it starts, across the room, as a percentage. */
  x: number;
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
 * Bubbles: blow, and a stream of them float up from the wand, wobbling and
 * drifting; tap one to pop it in the air. Blow again for more.
 */
@Component({
  selector: 'app-bubbles-room',
  imports: [RoomFrameComponent],
  template: `
    <app-room-frame status="ready">
      <div class="sky" #sky>
        @for (b of bubbles(); track b.id) {
          <button type="button" class="bubble" aria-label="Pop this bubble"
                  [style.left.%]="b.x" [style.width.cqi]="b.size"
                  [style.--drift]="b.drift + 'cqi'" [style.--hue]="b.hue"
                  [style.animation-duration.s]="b.seconds"
                  (pointerdown)="burst($event, b)" (animationend)="drop(b)"></button>
        }
        @for (s of bursts(); track s.id) {
          <span class="burst" [style.left.px]="s.x" [style.top.px]="s.y" aria-hidden="true"></span>
        }
      </div>
      <p class="room-words room-words--small">{{ popped() ? popped() + ' popped' : 'Blow some bubbles.' }}</p>
      <button type="button" class="room-button bubbles__blow" (click)="blow()">Blow</button>
    </app-room-frame>
  `,
  styles: `
    :host { display: contents; }
    app-room-frame {
      justify-content: flex-end;
      background: linear-gradient(to bottom, #9fd8ff, #d8f0ff 60%, #b5e3a1 60%, #8fcf78);
      color: #1f4566;
    }
    .sky {
      position: absolute;
      inset: 0 0 26% 0;
      overflow: hidden;
    }
    .bubble {
      position: absolute;
      bottom: -12cqi;
      aspect-ratio: 1;
      padding: 0;
      border: 1px solid rgba(255, 255, 255, 0.85);
      border-radius: 50%;
      background:
        radial-gradient(circle at 30% 28%, rgba(255, 255, 255, 0.95) 0 8%, transparent 14%),
        radial-gradient(circle, transparent 55%, hsla(var(--hue), 90%, 75%, 0.45) 72%, hsla(calc(var(--hue) + 120), 90%, 75%, 0.55) 100%);
      cursor: pointer;
      animation-name: float-up;
      animation-timing-function: ease-in;
      animation-fill-mode: forwards;
    }
    @keyframes float-up {
      0% { transform: translate(0, 0) scale(0.4); }
      25% { transform: translate(calc(var(--drift) * 0.6), -30cqh) scale(1); }
      50% { transform: translate(calc(var(--drift) * -0.4), -60cqh) scale(1.04, 0.96); }
      100% { transform: translate(var(--drift), -125cqh) scale(1); }
    }
    .burst {
      position: absolute;
      width: 12cqi;
      aspect-ratio: 1;
      margin: -6cqi 0 0 -6cqi;
      border-radius: 50%;
      border: 0.8cqi dotted rgba(255, 255, 255, 0.95);
      pointer-events: none;
      animation: burst 0.35s ease-out forwards;
    }
    @keyframes burst { to { transform: scale(1.8); opacity: 0; } }
    .bubbles__blow { position: relative; z-index: 1; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BubblesRoomComponent {
  readonly bubbles = signal<Bubble[]>([]);
  readonly bursts = signal<Burst[]>([]);
  readonly popped = signal(0);
  private nextId = 1;
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach(clearTimeout));
  }

  /** A breath: eight or so bubbles, one after another. */
  blow(): void {
    const count = 7 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i += 1) {
      this.later(() => {
        const bubble: Bubble = {
          id: this.nextId++,
          x: 35 + Math.random() * 30,
          size: 10 + Math.random() * 14,
          drift: (Math.random() - 0.5) * 60,
          seconds: 5 + Math.random() * 4,
          hue: Math.floor(Math.random() * 360),
        };
        this.bubbles.update((all) => [...all, bubble]);
      }, i * 180);
    }
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
