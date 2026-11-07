import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { pickOne } from '../room-frame/room-load';

type Throw = 'rock' | 'paper' | 'scissors';
const THROWS: readonly Throw[] = ['rock', 'paper', 'scissors'];
const SHOWN: Record<Throw, string> = { rock: '✊', paper: '✋', scissors: '✌️' };
const BEATS: Record<Throw, Throw> = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

export function outcome(mine: Throw, theirs: Throw): 'win' | 'lose' | 'draw' {
  if (mine === theirs) return 'draw';
  return BEATS[mine] === theirs ? 'win' : 'lose';
}

/** Rock, paper, scissors against the house, keeping score. */
@Component({
  selector: 'app-rps-room',
  imports: [RoomFrameComponent],
  template: `
    <app-room-frame status="ready">
      <p class="rps__score">You {{ score().you }} · {{ score().house }} House</p>
      <div class="rps__hands" aria-live="polite">
        <span class="rps__hand">{{ last() ? shown[last()!.mine] : '❔' }}</span>
        <span class="rps__vs">vs</span>
        <span class="rps__hand rps__hand--house">{{ last() ? shown[last()!.theirs] : '❔' }}</span>
      </div>
      <p class="room-words">{{ verdict() }}</p>
      <div class="rps__choices">
        @for (t of throws; track t) {
          <button type="button" class="rps__choice" (click)="play(t)" [attr.aria-label]="'Throw ' + t">
            {{ shown[t] }}
          </button>
        }
      </div>
    </app-room-frame>
  `,
  styles: `
    :host { display: contents; }
    app-room-frame {
      background: radial-gradient(circle at 50% 35%, #fff1a8, #ffcf56 55%, #f4a12a);
      color: #4a2b00;
      font-weight: 600;
    }
    .rps__score { font-size: clamp(0.7rem, 5cqi, 0.95rem); letter-spacing: 0.06em; }
    .rps__hands { display: flex; align-items: center; gap: 4cqi; }
    .rps__hand { font-size: 18cqi; }
    .rps__hand--house { transform: scaleX(-1); }
    .rps__vs { font-size: clamp(0.7rem, 5cqi, 0.95rem); opacity: 0.7; }
    .rps__choices { display: flex; gap: 3cqi; }
    .rps__choice {
      width: 22cqi;
      aspect-ratio: 1;
      border: 0;
      border-radius: 50%;
      background: #ffffff;
      box-shadow: 0 1.2cqi 0 #c97c10;
      font-size: 11cqi;
      cursor: pointer;
    }
    .rps__choice:active { transform: translateY(1cqi); box-shadow: none; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RpsRoomComponent {
  readonly throws = THROWS;
  readonly shown = SHOWN;
  readonly last = signal<{ mine: Throw; theirs: Throw } | undefined>(undefined);
  readonly score = signal({ you: 0, house: 0 });
  readonly verdict = signal('Rock, paper or scissors?');

  play(mine: Throw): void {
    const theirs = pickOne(THROWS);
    this.last.set({ mine, theirs });
    const result = outcome(mine, theirs);
    if (result === 'win') this.score.update((s) => ({ ...s, you: s.you + 1 }));
    if (result === 'lose') this.score.update((s) => ({ ...s, house: s.house + 1 }));
    this.verdict.set(result === 'win' ? 'You win!' : result === 'lose' ? 'The house wins.' : 'A draw.');
  }
}
