import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { pickOne, roomLoad } from '../room-frame/room-load';

/** The fields asked for in server/apis.js. */
interface Artwork {
  id: number;
  title: string;
  artist_title: string | null;
  date_display: string | null;
  image_id: string | null;
}

interface Painting {
  title: string;
  artist: string;
  date: string;
  image: string;
  link: string;
}

/** How many pages of paintings the server will hand out; see server/apis.js. */
const PAGES = 50;

/**
 * A painting hung in the doorway, from the Art Institute of Chicago's
 * public-domain collection: a random page of twenty, and one from that.
 */
@Component({
  selector: 'app-painting-room',
  imports: [RoomFrameComponent],
  templateUrl: './painting-room.component.html',
  styleUrls: ['./painting-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaintingRoomComponent {
  private readonly http = inject(HttpClient);

  readonly painting = roomLoad(() => {
    const page = 1 + Math.floor(Math.random() * PAGES);

    return this.http
      .get<{ data: Artwork[] }>('/api/paintings', { params: { page } })
      .pipe(
        map((response): Painting => {
          const artwork = pickOne(response?.data?.filter((a) => a.image_id));
          return {
            title: artwork.title,
            artist: artwork.artist_title ?? 'Unknown artist',
            date: artwork.date_display ?? '',
            // Through our own server, which the museum's bot check lets
            // through; see server/images.js.
            image: `/api/images/paintings/${artwork.image_id}`,
            link: `https://www.artic.edu/artworks/${artwork.id}`,
          };
        })
      );
  });
}
