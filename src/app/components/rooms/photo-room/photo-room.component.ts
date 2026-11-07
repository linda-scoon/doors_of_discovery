import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { pickOne, roomLoad } from '../room-frame/room-load';

/** The parts of a Pexels photo the room uses. */
interface PexelsPhoto {
  url: string;
  alt?: string;
  photographer: string;
  photographer_url: string;
  src: { portrait: string };
}

/** How many pages of photos the server will hand out; see server/apis.js. */
const PAGES = 100;

/**
 * A photograph from Pexels' curated collection, pinned up like a print.
 * Pexels asks for the photographer and Pexels to be credited with every
 * photo, with links to both.
 */
@Component({
  selector: 'app-photo-room',
  imports: [RoomFrameComponent],
  templateUrl: './photo-room.component.html',
  styleUrls: ['./photo-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoRoomComponent {
  private readonly http = inject(HttpClient);

  readonly photo = roomLoad(() => {
    const page = 1 + Math.floor(Math.random() * PAGES);

    return this.http.get<{ photos: PexelsPhoto[] }>('/api/photos', { params: { page } }).pipe(
      map((response) => {
        const photo = pickOne(response?.photos?.filter((p) => p.src?.portrait && p.photographer));
        return {
          // Cropped to portrait by Pexels: the shape of a doorway.
          image: photo.src.portrait,
          alt: photo.alt || `A photograph by ${photo.photographer}`,
          photographer: photo.photographer,
          photographerUrl: photo.photographer_url,
          link: photo.url,
        };
      })
    );
  });
}
