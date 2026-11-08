import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { pickOne, roomLoad } from '../room-frame/room-load';
import books from '../../../../../shared/books.json';

interface Chapter {
  title: string;
  author: string;
  heading: string;
  paragraphs: string[];
  cut: boolean;
  link: string;
}

/**
 * A chapter from a classic, opened at random: a reading nook with one
 * chapter of a book that is out of copyright, from Project Gutenberg.
 */
@Component({
  selector: 'app-chapter-room',
  imports: [RoomFrameComponent],
  template: `
    <app-room-frame [status]="chapter.status()">
      @if (chapter.value(); as c) {
        <div class="chapter">
          <p class="chapter__book">{{ c.title }}</p>
          <p class="chapter__author">{{ c.author }}</p>
          @if (c.heading) {
            <p class="chapter__heading">{{ c.heading }}</p>
          }
          <div class="chapter__text" tabindex="0" aria-label="The chapter">
            @for (paragraph of c.paragraphs; track $index) {
              <p>{{ paragraph }}</p>
            }
            <p class="room-credit">
              <a [href]="c.link" target="_blank" rel="noopener">
                {{ c.cut ? 'Read on at Project Gutenberg' : 'The whole book, free, at Project Gutenberg' }}
              </a>
            </p>
          </div>
        </div>
      }
    </app-room-frame>
  `,
  styles: `
    :host { display: contents; }
    app-room-frame {
      background:
        linear-gradient(90deg, rgba(0, 0, 0, 0.08), transparent 6%, transparent 94%, rgba(0, 0, 0, 0.08)),
        #f6efdf;
      color: #2b2118;
      font-family: Georgia, 'Times New Roman', serif;
    }
    .chapter {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      height: 100%;
      min-height: 0;
    }
    .chapter__book { font-size: clamp(0.8rem, 6.5cqi, 1.2rem); font-weight: 700; font-style: italic; text-align: center; }
    .chapter__author { font-size: clamp(0.6rem, 4cqi, 0.78rem); letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.7; }
    .chapter__heading {
      margin-top: 1.5cqi;
      padding: 0.5cqi 3cqi;
      border-top: 1px solid #b59a6a;
      border-bottom: 1px solid #b59a6a;
      font-size: clamp(0.62rem, 4.2cqi, 0.82rem);
      font-variant: small-caps;
      text-align: center;
    }
    .chapter__text {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      margin-top: 2cqi;
      padding: 0 2cqi;
      font-size: clamp(0.68rem, 4.4cqi, 0.9rem);
      line-height: 1.6;
      letter-spacing: 0.01em;
      text-align: start;
      text-wrap: pretty;
      hyphens: auto;
      overscroll-behavior: contain;
    }
    .chapter__text p + p { text-indent: 1.4em; }
    .chapter__text p:first-child::first-letter {
      float: left;
      font-size: 3.1em;
      line-height: 0.8;
      padding: 0.08em 0.08em 0 0;
      color: #7b2d26;
    }
    .chapter__text .room-credit { margin-top: 1em; text-align: center; text-indent: 0; opacity: 0.8; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChapterRoomComponent {
  private readonly http = inject(HttpClient);

  readonly chapter = roomLoad(() =>
    this.http.get<Chapter>(`/api/chapter/${pickOne(books).id}`).pipe(
      map((c) => {
        if (!c?.paragraphs?.length) throw new Error('An empty chapter');
        return c;
      })
    )
  );
}
