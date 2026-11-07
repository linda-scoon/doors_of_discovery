import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { RoomStatus } from './room-load';

/**
 * What every room sits in.
 *
 * It fills the doorway and centres whatever the room shows, scrolling inside
 * the doorway if it is too long rather than spilling past the frame. While
 * the room is still fetching it shows a few dim footsteps of dots, and if
 * the fetch failed it says nobody is answering and offers to knock again --
 * so a failure never looks like a room that is empty on purpose.
 */
@Component({
  selector: 'app-room-frame',
  templateUrl: './room-frame.component.html',
  styleUrls: ['./room-frame.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomFrameComponent {
  readonly status = input.required<RoomStatus>();
  readonly retry = output<void>();
}
