import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { roomLoad } from '../room-frame/room-load';

interface UselessFact {
  text: string;
}

/** A useless fact, a different one every time the door opens. */
@Component({
  selector: 'app-fact-room',
  imports: [RoomFrameComponent],
  templateUrl: './fact-room.component.html',
  styleUrls: ['./fact-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FactRoomComponent {
  private readonly http = inject(HttpClient);

  readonly fact = roomLoad(() =>
    this.http.get<UselessFact>('/api/facts').pipe(
      map((response) => {
        const text = response?.text?.trim();
        if (!text) throw new Error('No fact in the response');
        return text;
      })
    )
  );
}
