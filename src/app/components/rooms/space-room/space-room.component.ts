import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { pickOne, roomLoad } from '../room-frame/room-load';
import topics from '../../../../../shared/space-topics.json';

/** The parts of a NASA image library result the room uses. */
interface NasaItem {
  data: { title: string; nasa_id: string; center?: string; photographer?: string; date_created?: string }[];
  links?: { href: string; render?: string }[];
}

/** A picture from space, from NASA's image library, credited as NASA asks. */
@Component({
  selector: 'app-space-room',
  imports: [RoomFrameComponent],
  template: `
    <app-room-frame [status]="picture.status()">
      @if (picture.value(); as p) {
        <img class="space-room__picture" [src]="p.image" [alt]="p.title" />
        <p class="room-words room-words--small">{{ p.title }}</p>
        <p class="room-credit">
          {{ p.credit }} ·
          <a [href]="p.link" target="_blank" rel="noopener">NASA Image Library</a>
        </p>
      }
    </app-room-frame>
  `,
  styles: `
    :host { display: contents; }
    app-room-frame {
      background:
        radial-gradient(1px 1px at 15% 20%, #fff, transparent),
        radial-gradient(1px 1px at 70% 12%, #fff, transparent),
        radial-gradient(1px 1px at 85% 70%, #fff, transparent),
        radial-gradient(ellipse at 50% 40%, #1b1440, #05030f 70%);
      color: #e8e6ff;
    }
    .space-room__picture {
      display: block;
      max-width: 100%;
      max-height: 58cqh;
      object-fit: contain;
      border-radius: 50% 50% 2cqi 2cqi / 12% 12% 2cqi 2cqi;
      box-shadow: 0 0 6cqi rgba(140, 120, 255, 0.35);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpaceRoomComponent {
  private readonly http = inject(HttpClient);

  readonly picture = roomLoad(() => {
    const topic = pickOne(topics);
    const page = 1 + Math.floor(Math.random() * 3);
    return this.http
      .get<{ collection: { items: NasaItem[] } }>(`/api/space/${encodeURIComponent(topic)}`, { params: { page } })
      .pipe(
        map((response) => {
          // Some pictures are titled only with a catalogue number; skip those.
          const item = pickOne(
            response?.collection?.items?.filter(
              (i) => i.links?.[0]?.href && /[a-z]{3}/.test(i.data?.[0]?.title ?? '')
            )
          );
          const data = item.data[0];
          return {
            title: data.title,
            image: item.links![0].href.replace(/^http:/, 'https:'),
            credit: data.photographer ? (/NASA/i.test(data.photographer) ? data.photographer : `${data.photographer}, NASA`) : data.center ? `NASA ${data.center}` : 'NASA',
            link: `https://images.nasa.gov/details/${encodeURIComponent(data.nasa_id)}`,
          };
        })
      );
  });
}
