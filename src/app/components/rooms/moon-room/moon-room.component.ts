import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { litPath, moonOn } from './moon';
import { readingFor } from './luck';

/** The moon's lit face is drawn at this radius, in SVG units. */
const R = 50;

/**
 * What the moon is doing tonight -- its phase and the sign it is passing
 * through -- drawn as it actually looks, with a reading for the day. Worked
 * out from the date, so it needs nothing from anywhere; the room itself
 * keeps to the moon's own language, with no numbers or ratings.
 */
@Component({
  selector: 'app-moon-room',
  imports: [RoomFrameComponent],
  templateUrl: './moon-room.component.html',
  styleUrls: ['./moon-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoonRoomComponent {
  readonly today = new Date();
  readonly moon = moonOn(this.today);
  readonly reading = readingFor(this.moon, this.today);
  readonly r = R;
  readonly lit = litPath(this.moon, R);
}
