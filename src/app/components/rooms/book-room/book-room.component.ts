import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { pickOne, roomLoad } from '../room-frame/room-load';
import subjects from '../../../../../shared/book-subjects.json';

/** The parts of an Open Library work the room uses. */
interface OpenLibraryWork {
  key: string;
  title: string;
  authors?: { name: string }[];
  cover_id?: number | null;
  first_publish_year?: number | null;
}

/** A story from Silver Footfalls, as the server reads it off the site. */
interface OwnStory {
  title: string;
  description?: string;
  url: string;
  cover?: string;
}

export type Recommendation =
  | {
      kind: 'book';
      title: string;
      author: string;
      year?: number | null;
      cover?: string;
      about: string;
      link: string;
    }
  | {
      kind: 'own';
      title: string;
      blurb?: string;
      cover?: string;
      link: string;
    };

/** How often the pick is one of the site owner's own stories instead. */
export const OWN_STORY_CHANCE = 0.25;

/** Open Library's lists are fetched fifty at a time; see server/apis.js. */
const PAGES = 5;

/**
 * A bookshop: one book recommended from a random subject, from Open
 * Library. Now and then it is one of the site owner's stories from Silver
 * Footfalls instead: its cover with the title over it, marked 18+, a short
 * synopsis and a link to the site.
 */
@Component({
  selector: 'app-book-room',
  imports: [RoomFrameComponent],
  templateUrl: './book-room.component.html',
  styleUrls: ['./book-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookRoomComponent {
  private readonly http = inject(HttpClient);

  readonly pick = roomLoad(() =>
    // If the owner's stories cannot be read, recommend a book instead.
    Math.random() < OWN_STORY_CHANCE
      ? this.ownStory().pipe(catchError(() => this.book()))
      : this.book()
  );

  private book(): Observable<Recommendation> {
    const subject = pickOne(subjects);
    const offset = 50 * Math.floor(Math.random() * PAGES);

    return this.http
      .get<{ works: OpenLibraryWork[] }>(`/api/books/${subject.slug}`, { params: { offset } })
      .pipe(
        map((response): Recommendation => {
          // A book with a cover, when there is one: you judge it by its cover.
          const works = response?.works?.filter((w) => w.title) ?? [];
          const work = pickOne(works.some((w) => w.cover_id) ? works.filter((w) => w.cover_id) : works);
          return {
            kind: 'book',
            title: work.title,
            author: work.authors?.map((a) => a.name).join(', ') || 'Unknown author',
            year: work.first_publish_year,
            cover: work.cover_id ? `https://covers.openlibrary.org/b/id/${work.cover_id}-M.jpg` : undefined,
            about: subject.label,
            link: `https://openlibrary.org${work.key}`,
          };
        })
      );
  }

  private ownStory(): Observable<Recommendation> {
    return this.http.get<{ stories: OwnStory[] }>('/api/silverfoot').pipe(
      map((response): Recommendation => {
        const story = pickOne(response?.stories);
        return {
          kind: 'own',
          title: story.title,
          blurb: story.description,
          cover: story.cover,
          link: story.url,
        };
      })
    );
  }
}
