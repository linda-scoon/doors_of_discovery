import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { roomLoad } from '../room-frame/room-load';

/** The parts of a page from Wikipedia's random-page query that the room uses. */
interface WikiPage {
  title: string;
  extract?: string;
  canonicalurl: string;
  thumbnail?: { source: string };
  /**
   * On a "may refer to" page this has a disambiguation key, whose value is
   * an empty string -- so it is the key that counts, not the value.
   */
  pageprops?: { disambiguation?: string };
}

/** Shorter than this, an extract is a stub that says almost nothing. */
const ENOUGH_TO_READ = 60;

/**
 * A random Wikipedia article: its title, a picture if it has one, and the
 * first few sentences. Of the five the server fetches, the first that is a
 * real article with something to read. Wikipedia's text is CC BY-SA, which asks for credit
 * and a link to the article.
 */
@Component({
  selector: 'app-wikipedia-room',
  imports: [RoomFrameComponent],
  templateUrl: './wikipedia-room.component.html',
  styleUrls: ['./wikipedia-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WikipediaRoomComponent {
  private readonly http = inject(HttpClient);

  readonly page = roomLoad(() =>
    this.http.get<{ query: { pages: Record<string, WikiPage> } }>('/api/wikipedia').pipe(
      map((response) => {
        const page = Object.values(response?.query?.pages ?? {}).find(
          (p) =>
            p.title &&
            p.pageprops?.disambiguation === undefined &&
            (p.extract?.length ?? 0) >= ENOUGH_TO_READ
        );
        if (!page) throw new Error('No readable article in the response');
        return page;
      })
    )
  );
}
