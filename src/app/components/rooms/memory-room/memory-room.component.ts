import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { shuffled } from '../room-frame/room-load';
import { chime } from '../room-frame/tones';

const FACES = ['🦊', '🐢', '🦉', '🐙', '🦋', '🐝', '🐳', '🦔', '🐸', '🦁'];

interface Card {
  face: string;
  up: boolean;
  matched: boolean;
}

function deal(): Card[] {
  const six = shuffled(FACES).slice(0, 6);
  return shuffled([...six, ...six]).map((face) => ({ face, up: false, matched: false }));
}

/** Pairs: turn two cards over at a time and find the six matching pairs. */
@Component({
  selector: 'app-memory-room',
  imports: [RoomFrameComponent],
  template: `
    <app-room-frame status="ready">
      <p class="room-words room-words--small" aria-live="polite">
        {{ done() ? 'All found in ' + moves() + ' goes!' : 'Find the pairs. Goes: ' + moves() }}
      </p>
      <div class="cards">
        @for (card of cards(); track $index; let i = $index) {
          <button type="button" class="card" [class.card--up]="card.up || card.matched"
                  [class.card--matched]="card.matched" (click)="turn(i)"
                  [attr.aria-label]="card.up || card.matched ? card.face : 'Card ' + (i + 1)">
            <span class="card__face">{{ card.face }}</span>
          </button>
        }
      </div>
      @if (done()) {
        <button type="button" class="room-button" (click)="again()">Play again</button>
      }
    </app-room-frame>
  `,
  styles: `
    :host { display: contents; }
    app-room-frame {
      background: linear-gradient(160deg, #d9f7ee, #bfe8f5);
      color: #1f4d5a;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2.2cqi;
      width: 92%;
    }
    .card {
      aspect-ratio: 3 / 4;
      border: 0;
      border-radius: 2cqi;
      background: repeating-linear-gradient(45deg, #2a9d8f 0 2cqi, #248a7e 2cqi 4cqi);
      box-shadow: 0 1cqi 2cqi rgba(31, 77, 90, 0.3);
      cursor: pointer;
      transition: transform 250ms ease, background 250ms ease;
    }
    .card__face { font-size: 11cqi; opacity: 0; transition: opacity 150ms ease 100ms; }
    .card--up { background: #ffffff; transform: rotateY(180deg) scaleX(-1); }
    .card--up .card__face { opacity: 1; }
    .card--matched { background: #fff6cf; box-shadow: 0 0 0 0.8cqi #f4c430 inset; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemoryRoomComponent {
  readonly cards = signal<Card[]>(deal());
  readonly moves = signal(0);
  readonly done = computed(() => this.cards().every((c) => c.matched));
  private busy = false;

  turn(index: number): void {
    const card = this.cards()[index];
    if (this.busy || card.up || card.matched) return;

    this.set(index, { up: true });
    const up = this.cards()
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => c.up && !c.matched);
    if (up.length < 2) return;

    this.moves.update((n) => n + 1);
    const [a, b] = up;
    if (a.c.face === b.c.face) {
      this.set(a.i, { matched: true, up: false });
      this.set(b.i, { matched: true, up: false });
      chime();
    } else {
      this.busy = true;
      setTimeout(() => {
        this.set(a.i, { up: false });
        this.set(b.i, { up: false });
        this.busy = false;
      }, 800);
    }
  }

  again(): void {
    this.cards.set(deal());
    this.moves.set(0);
  }

  private set(index: number, change: Partial<Card>): void {
    this.cards.update((cards) => cards.map((c, i) => (i === index ? { ...c, ...change } : c)));
  }
}
