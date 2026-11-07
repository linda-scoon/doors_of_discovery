import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { roomLoad } from '../room-frame/room-load';

interface IssPosition {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
}

/**
 * Where the International Space Station is at the moment the door opens.
 * Always much the same news, so it is one of the rare rooms.
 */
@Component({
  selector: 'app-iss-room',
  imports: [RoomFrameComponent],
  templateUrl: './iss-room.component.html',
  styleUrls: ['./iss-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssRoomComponent {
  private readonly http = inject(HttpClient);

  readonly station = roomLoad(() =>
    this.http.get<IssPosition>('/api/iss').pipe(
      map((p) => {
        if (typeof p?.latitude !== 'number' || typeof p.longitude !== 'number') {
          throw new Error('No position in the response');
        }
        return {
          where: `${degrees(p.latitude, 'N', 'S')}, ${degrees(p.longitude, 'E', 'W')}`,
          altitude: Math.round(p.altitude),
          speed: Math.round(p.velocity).toLocaleString(),
          // Where to put the dot on the little map, as percentages.
          x: ((p.longitude + 180) / 360) * 100,
          y: ((90 - p.latitude) / 180) * 100,
        };
      })
    )
  );
}

function degrees(value: number, positive: string, negative: string): string {
  return `${Math.abs(value).toFixed(1)}°${value >= 0 ? positive : negative}`;
}
