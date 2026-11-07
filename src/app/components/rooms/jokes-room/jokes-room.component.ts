import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { roomLoad } from '../room-frame/room-load';

/** JokeAPI sends either a one-liner or a setup with a punchline. */
type JokeApiJoke =
  | { type: 'single'; joke: string }
  | { type: 'twopart'; setup: string; delivery: string };

interface Joke {
  setup: string;
  /** Missing for a one-liner. */
  punchline?: string;
}

/**
 * A joke. A setup and punchline arrive one after the other, so the punchline
 * lands rather than being read at the same moment as the question.
 */
@Component({
  selector: 'app-jokes-room',
  imports: [RoomFrameComponent],
  templateUrl: './jokes-room.component.html',
  styleUrls: ['./jokes-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JokesRoomComponent {
  private readonly http = inject(HttpClient);

  readonly joke = roomLoad(() =>
    this.http.get<JokeApiJoke>('/api/jokes').pipe(
      map((response): Joke => {
        if (response?.type === 'single' && response.joke) {
          return { setup: response.joke };
        }
        if (response?.type === 'twopart' && response.setup && response.delivery) {
          return { setup: response.setup, punchline: response.delivery };
        }
        throw new Error('No joke in the response');
      })
    )
  );
}
