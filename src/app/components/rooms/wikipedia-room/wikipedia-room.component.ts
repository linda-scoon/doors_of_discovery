import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { roomLoad, shuffled } from '../room-frame/room-load';

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
 * One of Wikipedia's featured articles -- its best-written pages -- laid out
 * like a page from the encyclopedias people used to buy in shops: yellowed
 * paper, a big picture plate, a drop capital, the volume at the top and a
 * page number at the foot. Wikipedia's text is CC BY-SA, which asks for credit
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

  /** Set if the picture will not load, so an empty plate is not left behind. */
  readonly pictureMissing = signal(false);

  readonly page = roomLoad(() =>
    this.http.get<{ query: { pages: Record<string, WikiPage> } }>(`/api/wikipedia/${randomPrefix()}`).pipe(
      map((response) => {
        const readable = shuffled(Object.values(response?.query?.pages ?? {})).filter(
          (p) =>
            p.title &&
            p.pageprops?.disambiguation === undefined &&
            (p.extract?.length ?? 0) >= ENOUGH_TO_READ
        );
        // The pictures were half the joy of an encyclopedia, so one with a
        // picture is preferred when there is one.
        const page = readable.find((p) => p.thumbnail) ?? readable[0];
        if (!page) throw new Error('No readable article in the response');
        this.pictureMissing.set(false);

        const initial = page.title.charAt(0).toUpperCase();
        return {
          ...page,
          volume: /[A-Z]/.test(initial) ? initial : '#',
          folio: 1 + Math.floor(Math.random() * 960),
        };
      })
    )
  );
}

/**
 * Where to start in the alphabetical list of featured articles: two capital
 * letters, the first stopping short of Z so there are always five to come.
 */
function randomPrefix(): string {
  const letter = (count: number) => String.fromCharCode(65 + Math.floor(Math.random() * count));
  return letter(25) + letter(26);
}
