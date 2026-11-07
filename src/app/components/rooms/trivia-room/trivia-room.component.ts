import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { pickOne, roomLoad, shuffled } from '../room-frame/room-load';

/** One question as Open Trivia DB sends it, every field URL-encoded. */
interface OpenTriviaQuestion {
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface Question {
  category: string;
  question: string;
  answer: string;
  /** All four, in a random order. */
  choices: string[];
}

/** A quiz question. Tap an answer to find out. */
@Component({
  selector: 'app-trivia-room',
  imports: [RoomFrameComponent],
  templateUrl: './trivia-room.component.html',
  styleUrls: ['./trivia-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriviaRoomComponent {
  private readonly http = inject(HttpClient);

  readonly question = roomLoad(() =>
    this.http.get<{ results: OpenTriviaQuestion[] }>('/api/trivia').pipe(
      map((response): Question => {
        const q = pickOne(response?.results);
        const answer = decodeURIComponent(q.correct_answer);
        return {
          category: decodeURIComponent(q.category),
          question: decodeURIComponent(q.question),
          answer,
          choices: shuffled([answer, ...q.incorrect_answers.map(decodeURIComponent)]),
        };
      })
    )
  );

  /** The answer tapped, once one has been. */
  readonly chosen = signal<string | undefined>(undefined);

  choose(choice: string): void {
    if (!this.chosen()) this.chosen.set(choice);
  }
}
