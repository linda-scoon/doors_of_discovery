import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { pickOne, roomLoad } from '../room-frame/room-load';

/** One quote as ZenQuotes sends it: q is the quote, a the author. */
interface ZenQuote {
  q: string;
  a: string;
}

/**
 * A quote, picked from the fifty the server keeps. ZenQuotes asks to be
 * credited on its free tier, so it is, under the quote.
 */
@Component({
  selector: 'app-qoutes-room',
  imports: [RoomFrameComponent],
  templateUrl: './qoutes-room.component.html',
  styleUrls: ['./qoutes-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QoutesRoomComponent {
  private readonly http = inject(HttpClient);

  readonly quote = roomLoad(() =>
    this.http.get<ZenQuote[]>('/api/quotes').pipe(
      // ZenQuotes answers a busy client with a single "too many requests"
      // entry by the author "zenquotes.io", which is not a quote.
      map((quotes) => pickOne(quotes?.filter((q) => q.q && q.a && q.a !== 'zenquotes.io')))
    )
  );
}
