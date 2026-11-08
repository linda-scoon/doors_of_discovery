import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { bar } from '../room-frame/tones';

/** A major scale from middle C, longest bar first. */
const BARS = [
  { note: 'C', frequency: 523.25, colour: '#e63946' },
  { note: 'D', frequency: 587.33, colour: '#f3722c' },
  { note: 'E', frequency: 659.25, colour: '#f8961e' },
  { note: 'F', frequency: 698.46, colour: '#f9c74f' },
  { note: 'G', frequency: 783.99, colour: '#90be6d' },
  { note: 'A', frequency: 880.0, colour: '#43aa8b' },
  { note: 'B', frequency: 987.77, colour: '#577590' },
  { note: 'C', frequency: 1046.5, colour: '#7b5ea7' },
];

/** Tunes old enough to belong to everyone, as bar numbers from 1. */
const TUNES = [
  { name: 'Mary Had a Little Lamb', bars: '3 2 1 2 3 3 3 · 2 2 2 · 3 5 5' },
  { name: 'Twinkle, Twinkle, Little Star', bars: '1 1 5 5 6 6 5 · 4 4 3 3 2 2 1' },
  { name: 'Ode to Joy', bars: '3 3 4 5 5 4 3 2 · 1 1 2 3 3 2 2' },
  { name: 'Frère Jacques', bars: '1 2 3 1 · 1 2 3 1 · 3 4 5' },
];

/**
 * A xylophone. Tap the bars, or sweep across them, to play. A tune to try
 * is written underneath, by bar number.
 */
@Component({
  selector: 'app-xylophone-room',
  imports: [RoomFrameComponent],
  template: `
    <app-room-frame status="ready">
      <div class="xylophone" (pointerdown)="down = true" (pointerup)="down = false" (pointerleave)="down = false">
        @for (b of bars; track $index; let i = $index) {
          <button type="button" class="xylophone__bar" [class.xylophone__bar--struck]="struck() === i"
                  [style.background]="b.colour" [style.height.%]="100 - i * 6"
                  [attr.aria-label]="'Play ' + b.note"
                  (pointerdown)="strike(i)" (pointerenter)="down && strike(i)">
            <span>{{ i + 1 }}</span>
          </button>
        }
      </div>
      <p class="room-words room-words--small">Try {{ tune.name }}:</p>
      <p class="room-credit xylophone__tune">{{ tune.bars }}</p>
    </app-room-frame>
  `,
  styles: `
    :host { display: contents; }
    app-room-frame {
      background: radial-gradient(ellipse at 50% 30%, #fff8e7, #f6e3bd);
      color: #4a3420;
    }
    .xylophone {
      display: flex;
      align-items: center;
      gap: 1.6cqi;
      width: 100%;
      height: 58cqh;
      padding: 3cqi 2cqi;
      border-radius: 2cqi;
      background: linear-gradient(to bottom, transparent 18%, #6b4527 18% 22%, transparent 22% 78%, #6b4527 78% 82%, transparent 82%);
      touch-action: none;
    }
    .xylophone__bar {
      flex: 1;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding-bottom: 2cqi;
      border: 0;
      border-radius: 1.5cqi;
      box-shadow: inset 0 -1.5cqi 0 rgba(0, 0, 0, 0.18), 0 1cqi 2cqi rgba(74, 52, 32, 0.3);
      color: rgba(255, 255, 255, 0.9);
      font: inherit;
      font-size: clamp(0.6rem, 4cqi, 0.8rem);
      font-weight: 700;
      cursor: pointer;
    }
    .xylophone__bar--struck { animation: ring 0.3s ease-out; }
    @keyframes ring { 30% { transform: translateY(1cqi) scale(0.96); filter: brightness(1.25); } }
    .xylophone__tune { letter-spacing: 0.08em; opacity: 0.85; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class XylophoneRoomComponent {
  readonly bars = BARS;
  readonly tune = TUNES[Math.floor(Math.random() * TUNES.length)];
  readonly struck = signal<number | undefined>(undefined);
  down = false;

  strike(index: number): void {
    bar(BARS[index].frequency);
    this.struck.set(undefined);
    queueMicrotask(() => this.struck.set(index));
  }
}
