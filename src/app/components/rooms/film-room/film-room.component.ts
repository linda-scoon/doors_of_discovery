import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { pickOne, roomLoad } from '../room-frame/room-load';
import { SafePipe } from '../../../pipes/safe.pipe';

interface ArchiveFilm {
  identifier: string;
  title?: string;
  year?: number | string;
}

/** How many pages of films the server will hand out; see server/apis.js. */
const PAGES = 200;

/**
 * An old film from the Internet Archive's Prelinger collection -- adverts,
 * public information films, home movies -- playing on a little screen.
 */
@Component({
  selector: 'app-film-room',
  imports: [RoomFrameComponent, SafePipe],
  templateUrl: './film-room.component.html',
  styleUrls: ['./film-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilmRoomComponent {
  private readonly http = inject(HttpClient);

  readonly film = roomLoad(() => {
    const page = 1 + Math.floor(Math.random() * PAGES);

    return this.http
      .get<{ response: { docs: ArchiveFilm[] } }>('/api/films', { params: { page } })
      .pipe(
        map((response) => {
          const film = pickOne(response?.response?.docs?.filter((f) => f.identifier));
          const id = encodeURIComponent(film.identifier);
          return {
            title: film.title || 'An old film',
            year: film.year,
            embed: `https://archive.org/embed/${id}`,
            link: `https://archive.org/details/${id}`,
          };
        })
      );
  });
}
