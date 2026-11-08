import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { pickOne } from '../room-frame/room-load';
import { chime } from '../room-frame/tones';
import { CHALLENGES } from './challenges';

type Span = keyof typeof CHALLENGES;

function next(): { span: Span; challenge: string } {
  const span: Span = Math.random() < 0.5 ? 'day' : 'hour';
  return { span, challenge: pickOne(CHALLENGES[span]) };
}

/**
 * A challenge for today, or for the hour: something small and healthy to
 * do. Say when it is done, or ask for another.
 */
@Component({
  selector: 'app-challenge-room',
  imports: [RoomFrameComponent],
  template: `
    <app-room-frame status="ready">
      <p class="challenge__heading">Your challenge for {{ current().span === 'day' ? 'today' : 'the hour' }}</p>
      <p class="challenge__task">{{ current().challenge }}</p>
      @if (done()) {
        <p class="room-words" aria-live="polite">Brilliant. Well done, you.</p>
      }
      <div class="challenge__actions">
        @if (!done()) {
          <button type="button" class="room-button challenge__done" (click)="finish()">I did it!</button>
        }
        <button type="button" class="room-button" (click)="another()">Another one</button>
      </div>
      <p class="room-credit">Only if it feels right for your body</p>
    </app-room-frame>
  `,
  styles: `
    :host { display: contents; }
    app-room-frame {
      background: linear-gradient(160deg, #e3fbe9, #c9f0f2);
      color: #1d4d3a;
    }
    .challenge__heading {
      font-size: clamp(0.55rem, 3.8cqi, 0.72rem);
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #2a9d8f;
    }
    .challenge__task {
      font-size: clamp(1rem, 8.5cqi, 1.55rem);
      font-weight: 700;
      line-height: 1.2;
    }
    .challenge__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 2cqi; }
    .challenge__done { background: #2a9d8f; border-color: #2a9d8f; color: #ffffff; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChallengeRoomComponent {
  readonly current = signal(next());
  readonly done = signal(false);

  finish(): void {
    this.done.set(true);
    chime();
  }

  another(): void {
    this.current.set(next());
    this.done.set(false);
  }
}
