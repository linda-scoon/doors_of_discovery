import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { pickOne, roomLoad } from '../room-frame/room-load';

/** The parts of a Deezer track the room uses. */
interface DeezerTrack {
  title: string;
  preview: string;
  artist: { name: string };
  album: { cover_medium: string; title: string };
}

/**
 * Thirty seconds of one of Deezer's hundred most-played tracks.
 */
@Component({
  selector: 'app-music-room',
  imports: [RoomFrameComponent],
  templateUrl: './music-room.component.html',
  styleUrls: ['./music-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicRoomComponent {
  private readonly http = inject(HttpClient);

  /**
   * Whether this room's door is open. The audio element only exists while it
   * is, so the music stops the moment the door starts to close rather than
   * playing on from behind it. Supplied by RoomSlotComponent because the
   * registry marks this room needsDoorState.
   */
  readonly open = input(false);

  readonly track = roomLoad(() =>
    this.http
      .get<{ data: DeezerTrack[] }>('/api/music')
      .pipe(map((response) => pickOne(response?.data?.filter((t) => t.preview))))
  );
}
