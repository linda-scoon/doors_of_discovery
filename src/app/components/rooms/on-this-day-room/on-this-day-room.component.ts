import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { pickOne, roomLoad } from '../room-frame/room-load';

interface HistoricalEvent {
  year: number;
  text: string;
  pages?: { content_urls?: { desktop?: { page?: string } } }[];
}

/**
 * Something that happened on this day of the year, from Wikipedia's "On
 * this day". It is the visitor's day, so the date is sent from here.
 */
@Component({
  selector: 'app-on-this-day-room',
  imports: [RoomFrameComponent],
  templateUrl: './on-this-day-room.component.html',
  styleUrls: ['./on-this-day-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnThisDayRoomComponent {
  private readonly http = inject(HttpClient);

  readonly today = new Date();

  readonly event = roomLoad(() => {
    const month = String(this.today.getMonth() + 1).padStart(2, '0');
    const day = String(this.today.getDate()).padStart(2, '0');

    return this.http.get<{ events: HistoricalEvent[] }>(`/api/onthisday/${month}/${day}`).pipe(
      map((response) => {
        const event = pickOne(response?.events?.filter((e) => e.text));
        return {
          year: event.year,
          text: event.text,
          link: event.pages?.[0]?.content_urls?.desktop?.page,
        };
      })
    );
  });

  readonly date = this.today.toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
}
