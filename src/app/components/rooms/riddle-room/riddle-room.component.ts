import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { pickOne } from '../room-frame/room-load';

/** Old riddles, the kind passed round for generations. */
export const RIDDLES: ReadonlyArray<[string, string]> = [
  ['What has keys but cannot open locks?', 'A piano.'],
  ['What gets wetter the more it dries?', 'A towel.'],
  ['What has a neck but no head?', 'A bottle.'],
  ['What can travel around the world while staying in a corner?', 'A stamp.'],
  ['What has hands but cannot clap?', 'A clock.'],
  ['The more you take, the more you leave behind. What are they?', 'Footsteps.'],
  ['What has to be broken before you can use it?', 'An egg.'],
  ['What goes up but never comes down?', 'Your age.'],
  ['I am tall when I am young and short when I am old. What am I?', 'A candle.'],
  ['What has many teeth but cannot bite?', 'A comb.'],
  ['What can you catch but not throw?', 'A cold.'],
  ['What runs but never walks, has a mouth but never talks?', 'A river.'],
  ['What has one eye but cannot see?', 'A needle.'],
  ['What is full of holes but still holds water?', 'A sponge.'],
  ['What building has the most stories?', 'A library.'],
  ['What begins with T, ends with T, and has T in it?', 'A teapot.'],
  ['What has a head and a tail but no body?', 'A coin.'],
  ['What can fill a room but takes up no space?', 'Light.'],
  ['If you have me, you want to share me. If you share me, you no longer have me. What am I?', 'A secret.'],
  ['What comes down but never goes up?', 'Rain.'],
  ['What has legs but does not walk?', 'A table.'],
  ['What has words but never speaks?', 'A book.'],
  ['What invention lets you look right through a wall?', 'A window.'],
  ['What belongs to you, but other people use it more than you do?', 'Your name.'],
  ['What is always in front of you but cannot be seen?', 'The future.'],
  ['What kind of room has no doors or windows?', 'A mushroom.'],
  ['What has a thumb and four fingers but is not alive?', 'A glove.'],
  ['What goes through cities and fields but never moves?', 'A road.'],
  ['What can you break, even if you never pick it up or touch it?', 'A promise.'],
  ['What month of the year has twenty-eight days?', 'All of them.'],
];

/** A riddle on the wall, and its answer behind a button. */
@Component({
  selector: 'app-riddle-room',
  imports: [RoomFrameComponent],
  template: `
    <app-room-frame status="ready">
      <p class="riddle-room__heading">A riddle</p>
      <p class="riddle-room__question">{{ riddle[0] }}</p>
      @if (revealed()) {
        <p class="riddle-room__answer" aria-live="polite">{{ riddle[1] }}</p>
      } @else {
        <button type="button" class="room-button" (click)="revealed.set(true)">Tell me</button>
      }
    </app-room-frame>
  `,
  styles: `
    :host { display: contents; }
    app-room-frame {
      background:
        radial-gradient(ellipse at 50% 40%, transparent 50%, rgba(0, 0, 0, 0.35)),
        repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.03) 0 2px, transparent 2px 4px),
        #2e3b33;
      color: #f2efe4;
      font-family: 'Caveat', 'Segoe Print', cursive;
    }
    .riddle-room__heading { font-size: clamp(0.8rem, 6cqi, 1.1rem); opacity: 0.7; }
    .riddle-room__question { font-size: clamp(1.1rem, 9cqi, 1.7rem); line-height: 1.15; }
    .riddle-room__answer {
      font-size: clamp(1.1rem, 9cqi, 1.7rem);
      color: #ffe08a;
      animation: chalk 0.5s ease-out;
    }
    @keyframes chalk { from { opacity: 0; letter-spacing: 0.3em; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiddleRoomComponent {
  readonly riddle = pickOne(RIDDLES);
  readonly revealed = signal(false);
}
