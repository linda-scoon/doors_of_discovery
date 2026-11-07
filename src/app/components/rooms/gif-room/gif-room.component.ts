import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { pickOne, roomLoad } from '../room-frame/room-load';

/** The parts of a Giphy gif the room uses. */
interface GiphyGif {
  title: string;
  images: { downsized?: { url: string } };
  /** Whoever uploaded it, when it was not anonymous. */
  username?: string;
  user?: { display_name?: string; profile_url?: string };
}

/** Giphy's trending list is fetched fifty at a time; see server/apis.js. */
const PAGE_SIZE = 50;
const PAGES = 10;

/**
 * A gif from what is trending on Giphy, G-rated only, credited to whoever
 * made it when Giphy says. Giphy's terms ask for "Powered by GIPHY" wherever
 * its gifs are shown, so it is under each one.
 */
@Component({
  selector: 'app-gif-room',
  imports: [RoomFrameComponent],
  templateUrl: './gif-room.component.html',
  styleUrls: ['./gif-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GifRoomComponent {
  private readonly http = inject(HttpClient);

  readonly gif = roomLoad(() => {
    const offset = PAGE_SIZE * Math.floor(Math.random() * PAGES);

    return this.http.get<{ data: GiphyGif[] }>('/api/gifs', { params: { offset } }).pipe(
      map((response) => {
        const gif = pickOne(response?.data?.filter((g) => g.images?.downsized?.url));
        return {
          url: gif.images.downsized!.url,
          title: gif.title || 'A gif',
          by: gif.user?.display_name || (gif.username ? `@${gif.username}` : undefined),
          byUrl: gif.user?.profile_url,
        };
      })
    );
  });
}
