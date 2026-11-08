import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { shuffled } from '../room-frame/room-load';
import { chime } from '../room-frame/tones';
import { COUNTRIES } from './countries';

type Country = (typeof COUNTRIES)[number];

interface Question {
  answer: Country;
  choices: Country[];
}

function ask(): Question {
  const [answer, ...others] = shuffled(COUNTRIES);
  return { answer, choices: shuffled([answer, ...others.slice(0, 3)]) };
}

/** Whose flag is it? Four countries to choose from, as many rounds as you like. */
@Component({
  selector: 'app-flags-room',
  imports: [RoomFrameComponent],
  template: `
    <app-room-frame status="ready">
      <p class="flags__score">Flags known: {{ right() }} of {{ asked() }}</p>
      <img class="flags__flag" [src]="flagOf(question().answer)" alt="A country's flag" />
      <div class="flags__choices">
        @for (choice of question().choices; track choice.code) {
          <button type="button" class="flags__choice"
                  [class.flags__choice--right]="picked() && choice === question().answer"
                  [class.flags__choice--wrong]="picked() === choice && choice !== question().answer"
                  [disabled]="picked() !== null"
                  (click)="pick(choice)">
            {{ choice.name }}
          </button>
        }
      </div>
      <p class="room-words room-words--small" aria-live="polite">{{ verdict() }}</p>
      @if (picked()) {
        <button type="button" class="room-button" (click)="next()">Next flag</button>
      }
      <p class="room-credit">Flags from <a href="https://flagpedia.net" target="_blank" rel="noopener">Flagpedia</a></p>
    </app-room-frame>
  `,
  styles: `
    :host { display: contents; }
    app-room-frame {
      background:
        repeating-linear-gradient(0deg, transparent 0 7cqi, rgba(40, 70, 110, 0.07) 7cqi 7.4cqi),
        repeating-linear-gradient(90deg, transparent 0 7cqi, rgba(40, 70, 110, 0.07) 7cqi 7.4cqi),
        #eef4fb;
      color: #1d3557;
    }
    .flags__score { font-size: clamp(0.6rem, 4.2cqi, 0.8rem); letter-spacing: 0.08em; text-transform: uppercase; }
    .flags__flag {
      width: 62cqi;
      max-height: 32cqh;
      object-fit: contain;
      border-radius: 1cqi;
      box-shadow: 0 1.5cqi 4cqi rgba(29, 53, 87, 0.3);
    }
    .flags__choices { display: grid; grid-template-columns: 1fr 1fr; gap: 2cqi; width: 92%; }
    .flags__choice {
      font: inherit;
      font-size: clamp(0.62rem, 4.6cqi, 0.85rem);
      padding: 0.5em 0.3em;
      border: 2px solid #a8c0dc;
      border-radius: 2cqi;
      background: #fff;
      color: inherit;
      cursor: pointer;
    }
    .flags__choice:disabled { cursor: default; opacity: 0.7; }
    .flags__choice--right { border-color: #2b9348; background: #d8f3dc; opacity: 1 !important; }
    .flags__choice--wrong { border-color: #c1121f; background: #ffd6d6; opacity: 1 !important; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlagsRoomComponent {
  readonly question = signal(ask());
  readonly picked = signal<Country | null>(null);
  readonly right = signal(0);
  readonly asked = signal(0);

  readonly verdict = computed(() => {
    const picked = this.picked();
    if (!picked) return 'Whose flag is this?';
    return picked === this.question().answer ? 'Right!' : `That one is ${this.question().answer.name}.`;
  });

  flagOf(country: Country): string {
    return `https://flagcdn.com/w320/${country.code}.png`;
  }

  pick(choice: Country): void {
    if (this.picked()) return;
    this.picked.set(choice);
    this.asked.update((n) => n + 1);
    if (choice === this.question().answer) {
      this.right.update((n) => n + 1);
      chime();
    }
  }

  next(): void {
    this.question.set(ask());
    this.picked.set(null);
  }
}
