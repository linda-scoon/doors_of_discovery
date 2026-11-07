import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { roomLoad } from '../room-frame/room-load';
import { BricksComponent } from '../../bricks/bricks.component';

/** The parts of a Radio Browser station the room uses. */
interface Station {
  name: string;
  url_resolved: string;
  country: string;
  homepage?: string;
  favicon?: string;
}

/**
 * A live radio station from somewhere in the world. Plenty of stations are
 * listed as up and are not, so the room is given ten and tries each in turn
 * until one plays; if none does, the doorway is bricked up.
 */
@Component({
  selector: 'app-radio-room',
  imports: [RoomFrameComponent, BricksComponent],
  templateUrl: './radio-room.component.html',
  styleUrls: ['./radio-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioRoomComponent {
  private readonly http = inject(HttpClient);

  /** Whether the door is open; see MusicRoomComponent for why it matters. */
  readonly open = input(false);

  readonly stations = roomLoad(() =>
    this.http.get<Station[]>('/api/radio').pipe(
      map((stations) => {
        const playable = (stations ?? []).filter((s) => s.url_resolved?.startsWith('https://'));
        if (!playable.length) throw new Error('No station that can play here');
        return playable;
      })
    )
  );

  /** Which of the ten is on. */
  private readonly tuned = signal(0);

  readonly station = computed(() => this.stations.value()?.[this.tuned()]);

  /** That one would not play: try the next. */
  nextStation(): void {
    this.tuned.update((index) => index + 1);
  }
}
