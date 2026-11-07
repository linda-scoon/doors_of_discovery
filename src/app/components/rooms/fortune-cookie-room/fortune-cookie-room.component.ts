import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { pickOne, shuffled } from '../room-frame/room-load';
import { pop } from '../room-frame/tones';

/** Kind, hopeful fortunes. Nothing gloomy comes out of a cookie. */
export const FORTUNES = [
  'A small kindness today will come back to you twice.',
  'Someone is thinking warmly of you right now.',
  'The next door you open will be a good one.',
  'You are braver than you feel today.',
  'An old friend will be glad you got in touch.',
  'Good news is on its way. Keep an eye out.',
  'Your laugh will brighten someone\'s day.',
  'The thing you are worried about will turn out fine.',
  'A new skill is closer than you think. Start today.',
  'You will find something you thought was lost.',
  'Rest well tonight. Tomorrow has plans for you.',
  'A walk outside will clear your head.',
  'Say yes to the next invitation.',
  'Your patience is about to pay off.',
  'Something you planted long ago is starting to grow.',
  'You will make someone smile without knowing it.',
  'Trust the little voice that says "try".',
  'A cup of something warm will solve more than you think.',
  'Today is a good day to start a story.',
  'You are exactly where you need to be.',
  'The answer will come when you stop chasing it.',
  'Be curious. It suits you.',
  'Good company is coming your way.',
  'A happy surprise is hiding in an ordinary day.',
  'You have more friends than you know.',
];

/**
 * A fortune cookie on a plate. Tap it to crack it open and pull out the
 * fortune, with some lucky numbers.
 */
@Component({
  selector: 'app-fortune-cookie-room',
  imports: [RoomFrameComponent],
  template: `
    <app-room-frame status="ready">
      <button type="button" class="cookie" [class.cookie--open]="fortune()" (click)="crack()"
              [attr.aria-label]="fortune() ? 'The cookie is open' : 'Crack the fortune cookie'">
        <span class="cookie__half cookie__half--left"></span>
        <span class="cookie__half cookie__half--right"></span>
      </button>
      @if (fortune(); as f) {
        <p class="slip" aria-live="polite">{{ f }}</p>
        <p class="room-credit">Lucky numbers {{ numbers.join(' · ') }}</p>
      } @else {
        <p class="room-words room-words--small">Tap the cookie to crack it open.</p>
      }
    </app-room-frame>
  `,
  styles: `
    :host { display: contents; }
    app-room-frame {
      background:
        radial-gradient(ellipse 38% 7% at 50% 46%, #ffffff 0 60%, #e8e2d6 61% 72%, transparent 73%),
        radial-gradient(ellipse at 50% 30%, #c0392b, #7b1e1e 75%);
      color: #fff3e0;
    }
    .cookie {
      position: relative;
      width: 56cqi;
      height: 30cqi;
      border: 0;
      background: none;
      cursor: pointer;
    }
    .cookie__half {
      position: absolute;
      top: 0;
      width: 52%;
      height: 100%;
      background: radial-gradient(circle at 40% 30%, #f6c66b, #d99a3b 70%, #b87a26);
      box-shadow: 0 1.5cqi 3cqi rgba(0, 0, 0, 0.35);
      transition: transform 500ms cubic-bezier(0.3, 1.4, 0.5, 1);
    }
    .cookie__half--left { left: 0; border-radius: 60% 10% 30% 70% / 70% 20% 60% 50%; }
    .cookie__half--right { right: 0; border-radius: 10% 60% 70% 30% / 20% 70% 50% 60%; }
    .cookie--open .cookie__half--left { transform: translateX(-8cqi) rotate(-25deg); }
    .cookie--open .cookie__half--right { transform: translateX(8cqi) rotate(25deg); }
    .slip {
      width: 100%;
      padding: 3cqi 4cqi;
      background: #fffdf6;
      color: #8b1a1a;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: clamp(0.75rem, 5.4cqi, 1.05rem);
      font-style: italic;
      box-shadow: 0 1cqi 3cqi rgba(0, 0, 0, 0.35);
      animation: unfurl 0.6s ease-out;
    }
    @keyframes unfurl { from { transform: scaleX(0.1); opacity: 0; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FortuneCookieRoomComponent {
  readonly fortune = signal<string | undefined>(undefined);
  /** Four different numbers, smallest first. */
  readonly numbers = shuffled(Array.from({ length: 49 }, (_, i) => i + 1))
    .slice(0, 4)
    .sort((a, b) => a - b);

  crack(): void {
    if (this.fortune()) return;
    pop(0.7);
    this.fortune.set(pickOne(FORTUNES));
  }
}
