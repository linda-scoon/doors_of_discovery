import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { pickOne } from '../room-frame/room-load';

/** Our own answers -- mostly kind, a few cheeky, never cruel. */
const ANSWERS = [
  'Yes, definitely.', 'It is certain.', 'Without a doubt.', 'Signs point to yes.',
  'Most likely.', 'The stars say yes.', 'Go for it.', 'You already know the answer.',
  'Ask again after a cup of tea.', 'Too foggy to tell. Try again.', 'Not yet.',
  'Maybe. Maybe not.', 'Better not tell you now.', 'Sleep on it.',
  'Unlikely, but stranger things have happened.', 'My sources say no.',
  'The answer is in your heart.', 'Only if you smile first.', 'Yes, but be kind about it.',
  'Ask someone you trust.',
];

/**
 * The answer ball: ask it a question in your head, shake it, and an answer
 * floats up in the window. Our own ball, and our own answers.
 */
@Component({
  selector: 'app-answer-ball-room',
  imports: [RoomFrameComponent],
  template: `
    <app-room-frame status="ready">
      <p class="room-words room-words--small ball-room__ask">Think of a question, then shake the ball.</p>
      <button type="button" class="ball" [class.ball--shaking]="shaking()" (click)="shake()"
              aria-label="Shake the answer ball">
        <span class="ball__window">
          @if (answer(); as a) {
            <span class="ball__answer" aria-live="polite">{{ a }}</span>
          } @else {
            <span class="ball__mark">?</span>
          }
        </span>
      </button>
      <p class="room-credit">Tap the ball to shake it</p>
    </app-room-frame>
  `,
  styles: `
    :host { display: contents; }
    app-room-frame {
      background: radial-gradient(ellipse at 50% 30%, #2f2a52, #120f24 70%);
      color: #ece8ff;
    }
    .ball {
      position: relative;
      width: 76cqi;
      aspect-ratio: 1;
      border: 0;
      border-radius: 50%;
      background: radial-gradient(circle at 32% 28%, #5a5a66 0 6%, #1b1b22 32%, #050507 75%);
      box-shadow: 0 3cqi 8cqi rgba(0, 0, 0, 0.7), inset -3cqi -4cqi 8cqi rgba(0, 0, 0, 0.6);
      cursor: pointer;
    }
    .ball--shaking { animation: shake 0.6s ease-in-out; }
    @keyframes shake {
      20% { transform: translate(-4cqi, -2cqi) rotate(-10deg); }
      40% { transform: translate(4cqi, 2cqi) rotate(8deg); }
      60% { transform: translate(-3cqi, 1cqi) rotate(-6deg); }
      80% { transform: translate(2cqi, -1cqi) rotate(3deg); }
    }
    .ball__window {
      position: absolute;
      inset: 20%;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: radial-gradient(circle, #233a5c, #0b1426);
      box-shadow: inset 0 0 4cqi rgba(0, 0, 0, 0.8), 0 0 0 1cqi rgba(255, 255, 255, 0.06);
    }
    .ball__mark { font-size: 16cqi; font-weight: 800; color: #4d6a99; }
    /* The answer floats up out of the dark, glowing. */
    .ball__answer {
      display: grid;
      place-items: center;
      width: 88%;
      aspect-ratio: 1;
      padding: 3cqi;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(120, 230, 220, 0.28), transparent 70%);
      color: #c9fff6;
      text-shadow: 0 0 2cqi rgba(120, 255, 235, 0.8);
      font-size: clamp(0.7rem, 5.4cqi, 1rem);
      font-weight: 700;
      line-height: 1.15;
      text-align: center;
      animation: surface 0.9s ease-out;
    }
    @keyframes surface { from { opacity: 0; transform: scale(0.6); filter: blur(2px); } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnswerBallRoomComponent {
  readonly answer = signal<string | undefined>(undefined);
  readonly shaking = signal(false);

  shake(): void {
    if (this.shaking()) return;
    this.answer.set(undefined);
    this.shaking.set(true);
    setTimeout(() => {
      this.shaking.set(false);
      this.answer.set(pickOne(ANSWERS));
    }, 600);
  }
}
