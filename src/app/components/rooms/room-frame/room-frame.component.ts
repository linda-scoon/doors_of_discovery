import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { BricksComponent } from '../../bricks/bricks.component';
import { RoomStatus } from './room-load';

/**
 * What every room sits in.
 *
 * It fills the doorway and centres whatever the room shows, scrolling inside
 * the doorway if it is too long rather than spilling past the frame. While
 * the room is still fetching it shows a few dim footsteps of dots. If the
 * fetch failed the doorway is bricked up: the door opens onto wall, which
 * looks like part of the place rather than an error, and never like a room
 * that is empty on purpose. Opening the door again tries again, since the
 * room is built afresh each time.
 */
@Component({
  selector: 'app-room-frame',
  templateUrl: './room-frame.component.html',
  styleUrls: ['./room-frame.component.css'],
  imports: [BricksComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomFrameComponent {
  readonly status = input.required<RoomStatus>();
}
