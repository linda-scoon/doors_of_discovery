import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { RoomFrameComponent } from '../room-frame/room-frame.component';

/** Clockwise from the top. Three wins in eight. */
const SEGMENTS = ['WIN', 'LOSE', 'LOSE', 'WIN', 'LOSE', 'LOSE', 'WIN', 'LOSE'] as const;
const SEGMENT_ANGLE = 360 / SEGMENTS.length;

/** A wheel of fortune. Spin it and see. Nothing is won but the satisfaction. */
@Component({
  selector: 'app-wheel-room',
  imports: [RoomFrameComponent],
  templateUrl: './wheel-room.component.html',
  styleUrls: ['./wheel-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WheelRoomComponent {
  readonly segments = SEGMENTS.map((label, i) => ({ label, angle: (i + 0.5) * SEGMENT_ANGLE }));

  /** How far the wheel has turned, in degrees. Only ever grows. */
  readonly rotation = signal(0);
  readonly spinning = signal(false);
  readonly result = signal<'WIN' | 'LOSE' | undefined>(undefined);

  private landing: (typeof SEGMENTS)[number] = 'LOSE';

  spin(): void {
    if (this.spinning()) return;

    const target = Math.floor(Math.random() * SEGMENTS.length);
    this.landing = SEGMENTS[target];

    // Round to the next whole turn, add four more, then turn back far enough
    // to bring the target's middle under the pointer -- give or take a
    // little, so it does not always stop dead centre.
    const wholeTurns = Math.ceil(this.rotation() / 360) + 4;
    const wobble = (Math.random() - 0.5) * SEGMENT_ANGLE * 0.7;
    this.rotation.set(wholeTurns * 360 - (target + 0.5) * SEGMENT_ANGLE + wobble);

    this.result.set(undefined);
    this.spinning.set(true);
  }

  /** The wheel has stopped. */
  stopped(): void {
    if (!this.spinning()) return;
    this.spinning.set(false);
    this.result.set(this.landing);
  }
}
