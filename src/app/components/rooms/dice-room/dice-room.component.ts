import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject, signal, viewChild } from '@angular/core';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { rattle } from '../room-frame/tones';

/** Where the pips go on each face, as cells of a 3×3 grid read left to right. */
const PIPS: Record<number, readonly number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function pipsFor(face: number): readonly boolean[] {
  return Array.from({ length: 9 }, (_, cell) => PIPS[face].includes(cell));
}

interface Die {
  /** Centre, as a percentage across and down the table. */
  x: number;
  y: number;
  face: number;
  turn: number;
  held: boolean;
  rolling: boolean;
}

const ROLL_MS = 700;
/** How close, as a share of the table's width, the pointer must pass to scoop up a die. */
const REACH = 9;
/**
 * Dice closer than this, as a share of the table's width, are pushed apart
 * where they land. A die is about a fifth of the table across.
 */
const ROOM = 22;
/** How far from the cushions a die's centre can land, in percent. */
const EDGE_X = 11;
const EDGE_Y = 10;

const randomFace = () => 1 + Math.floor(Math.random() * 6);
const clamp = (n: number, low: number, high: number) => Math.min(high, Math.max(low, n));
const clampX = (x: number) => clamp(x, EDGE_X, 100 - EDGE_X);
const clampY = (y: number) => clamp(y, EDGE_Y, 100 - EDGE_Y);

/**
 * Five dice on a felt table. Press and hold one to pick it up, sweep over
 * the others to gather them into your hand, and let go mid-swing to throw.
 */
@Component({
  selector: 'app-dice-room',
  imports: [RoomFrameComponent],
  template: `
    <app-room-frame status="ready">
      <p class="room-words room-words--small" aria-live="polite">{{ caption() }}</p>
      <div #table class="table"
           (pointerdown)="grab($event)" (pointermove)="sweep($event)"
           (pointerup)="release($event)" (pointercancel)="release($event)">
        @for (die of dice(); track $index; let i = $index) {
          <span class="die" [attr.data-die]="i"
                [class.die--held]="die.held" [class.die--rolling]="die.rolling"
                [style.left.%]="die.x" [style.top.%]="die.y"
                [style.--turn]="die.turn + 'deg'"
                role="img" [attr.aria-label]="'A die showing ' + die.face">
            @for (pip of pips(die.face); track $index) {
              <span class="die__cell"><span class="die__pip" [class.die__pip--on]="pip"></span></span>
            }
          </span>
        }
      </div>
      <button type="button" class="room-button" (click)="rollAll()">Roll them all</button>
    </app-room-frame>
  `,
  styles: `
    :host { display: contents; }
    app-room-frame {
      background: radial-gradient(ellipse at 50% 30%, #3e2a1c, #1d130c);
      color: #f3e6c8;
      gap: 3cqi;
    }
    .table {
      position: relative;
      width: 100%;
      flex: 1;
      min-height: 55cqi;
      border: 2.4cqi solid #6b4226;
      border-radius: 5cqi;
      background:
        radial-gradient(ellipse at 50% 45%, rgba(255, 255, 255, 0.08), transparent 70%),
        repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.04) 0 2px, transparent 2px 4px),
        #1f6f43;
      box-shadow: inset 0 0 6cqi rgba(0, 0, 0, 0.55), 0 2cqi 4cqi rgba(0, 0, 0, 0.5);
      touch-action: none;
      user-select: none;
      cursor: grab;
      overflow: hidden;
    }
    .die {
      position: absolute;
      width: 15cqi;
      aspect-ratio: 1;
      display: grid;
      grid-template: repeat(3, 1fr) / repeat(3, 1fr);
      padding: 1.6cqi;
      border-radius: 2.6cqi;
      background: linear-gradient(145deg, #ffffff, #e9e4da);
      box-shadow: inset -0.6cqi -0.6cqi 1cqi rgba(0, 0, 0, 0.18), 0 1cqi 1.6cqi rgba(0, 0, 0, 0.45);
      transform: translate(-50%, -50%) rotate(var(--turn));
      cursor: grab;
    }
    .die--held {
      transform: translate(-50%, -50%) rotate(var(--turn)) scale(1.15);
      box-shadow: inset -0.6cqi -0.6cqi 1cqi rgba(0, 0, 0, 0.18), 0 3.5cqi 3cqi rgba(0, 0, 0, 0.45);
      z-index: 2;
      cursor: grabbing;
    }
    .die--rolling {
      transition: left 700ms cubic-bezier(0.15, 0.7, 0.3, 1), top 700ms cubic-bezier(0.15, 0.7, 0.3, 1);
      animation: tumble 700ms cubic-bezier(0.15, 0.7, 0.3, 1);
    }
    @keyframes tumble {
      from { transform: translate(-50%, -50%) rotate(calc(var(--turn) - 540deg)) scale(1.1); }
    }
    .die__cell { display: grid; place-items: center; }
    .die__pip { width: 70%; aspect-ratio: 1; border-radius: 50%; }
    .die__pip--on { background: radial-gradient(circle at 35% 35%, #444, #111); }
    @media (prefers-reduced-motion: reduce) {
      .die--rolling { animation: none; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiceRoomComponent {
  private readonly table = viewChild.required<ElementRef<HTMLElement>>('table');
  private readonly timers: ReturnType<typeof setTimeout>[] = [];

  readonly dice = signal<Die[]>(
    [14, 32, 50, 68, 86].map((x, i) => ({
      x,
      y: i % 2 ? 40 : 60,
      face: randomFace(),
      turn: Math.round(Math.random() * 40 - 20),
      held: false,
      rolling: false,
    }))
  );
  readonly thrown = signal<number[] | null>(null);
  private readonly rolling = signal(false);

  readonly caption = computed(() => {
    if (this.rolling()) return 'Rattle…';
    const thrown = this.thrown();
    if (!thrown) return 'Press and hold a die, sweep over the others to gather them, then throw.';
    const total = thrown.reduce((sum, n) => sum + n, 0);
    return thrown.length === 1 ? `You threw a ${total}.` : `You threw ${thrown.join(' + ')} = ${total}.`;
  });

  /** The pointer's recent path, for how hard the dice were thrown. */
  private trail: { t: number; x: number; y: number }[] = [];

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach(clearTimeout));
  }

  pips(face: number): readonly boolean[] {
    return pipsFor(face);
  }

  grab(event: PointerEvent): void {
    const target = (event.target as HTMLElement).closest('[data-die]');
    if (!target || this.rolling()) return;
    this.table().nativeElement.setPointerCapture?.(event.pointerId);
    const index = Number(target.getAttribute('data-die'));
    this.trail = [];
    this.update((die, i) => (i === index ? { ...die, held: true } : die));
    this.sweep(event);
  }

  sweep(event: PointerEvent): void {
    if (!this.dice().some((d) => d.held)) return;
    const { x, y, aspect } = this.where(event);
    this.trail.push({ t: event.timeStamp, x, y });
    if (this.trail.length > 8) this.trail.shift();

    let held = 0;
    this.update((die) => {
      const near = Math.hypot(die.x - x, (die.y - y) / aspect) < REACH;
      if (!die.held && !near) return die;
      // Held dice bunch up in the hand, a little apart so all can be seen.
      const offset = held++;
      return { ...die, held: true, x: clampX(x + (offset % 3) * 5 - 5), y: clampY(y + Math.floor(offset / 3) * 8 - 4) };
    });
  }

  release(event: PointerEvent): void {
    if (!this.dice().some((d) => d.held)) return;
    const recent = this.trail.filter((p) => event.timeStamp - p.t < 120);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const ms = first && last ? Math.max(16, last.t - first.t) : 16;
    const vx = first && last ? (last.x - first.x) / ms : 0;
    const vy = first && last ? (last.y - first.y) / ms : 0;
    this.throw((die) => die.held, vx, vy);
  }

  /** For the keyboard, or anyone who would rather not chase dice about. */
  rollAll(): void {
    if (this.rolling()) return;
    this.update((die) => ({ ...die, held: true, x: 50, y: 85 }));
    this.throw(() => true, (Math.random() - 0.5) * 0.1, -0.15);
  }

  private throw(which: (die: Die) => boolean, vx: number, vy: number): void {
    const thrown: number[] = [];
    const speed = Math.min(1, Math.hypot(vx, vy) * 4);
    const aspect = this.where().aspect;

    // Where each one lands: carried on by the throw, scattered a little,
    // bounced off the cushions, then nudged off any die it would sit on.
    const landed = this.dice().map((die) => {
      if (!which(die)) return die;
      const face = randomFace();
      thrown.push(face);
      let x = die.x + vx * 260 + (Math.random() - 0.5) * (12 + speed * 25);
      let y = die.y + vy * 260 + (Math.random() - 0.5) * (12 + speed * 25);
      if (x < EDGE_X) x = 2 * EDGE_X - x;
      if (x > 100 - EDGE_X) x = 2 * (100 - EDGE_X) - x;
      if (y < EDGE_Y) y = 2 * EDGE_Y - y;
      if (y > 100 - EDGE_Y) y = 2 * (100 - EDGE_Y) - y;
      return { ...die, x: clampX(x), y: clampY(y), face, turn: Math.round(Math.random() * 60 - 30), held: false, rolling: true };
    });
    // Distances are measured in shares of the table's width both ways, so a
    // tall table does not let dice sit on one another top to bottom.
    for (let pass = 0; pass < 40; pass += 1) {
      landed.forEach((a, i) => {
        landed.forEach((b, j) => {
          if (i >= j || !(a.rolling || b.rolling)) return;
          const dx = b.x - a.x || 0.1;
          const dy = (b.y - a.y) / aspect;
          const gap = Math.hypot(dx, dy);
          if (gap >= ROOM) return;
          const push = (ROOM - gap) / gap;
          const mover = b.rolling ? b : a;
          const sign = mover === b ? 1 : -1;
          mover.x = clampX(mover.x + sign * dx * push);
          mover.y = clampY(mover.y + sign * dy * push * aspect);
        });
      });
    }

    const finalFaces = landed.map((d) => d.face);
    this.rolling.set(true);
    this.dice.set(landed.map((d) => (d.rolling ? { ...d, face: randomFace() } : d)));
    rattle(5 + thrown.length);

    // The faces flicker as the dice tumble, then settle on what was thrown.
    for (let t = 80; t < ROLL_MS; t += 80) {
      this.timers.push(setTimeout(() => this.update((d) => (d.rolling ? { ...d, face: randomFace() } : d)), t));
    }
    this.timers.push(
      setTimeout(() => {
        this.update((d, i) => (d.rolling ? { ...d, face: finalFaces[i], rolling: false } : d));
        this.rolling.set(false);
        this.thrown.set(thrown);
      }, ROLL_MS)
    );
  }

  /** The pointer as a percentage of the table, and the table's shape. */
  private where(event?: PointerEvent): { x: number; y: number; aspect: number } {
    const box = this.table().nativeElement.getBoundingClientRect();
    if (!box.width || !box.height) return { x: 50, y: 50, aspect: 1 };
    return {
      x: event ? ((event.clientX - box.left) / box.width) * 100 : 50,
      y: event ? ((event.clientY - box.top) / box.height) * 100 : 50,
      aspect: box.width / box.height,
    };
  }

  private update(change: (die: Die, index: number) => Die): void {
    this.dice.update((dice) => dice.map(change));
  }
}
