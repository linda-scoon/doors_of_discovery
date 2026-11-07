import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { pickOne, roomLoad } from '../room-frame/room-load';
import { ENGLISH_WORDS, WORDS_FROM_ELSEWHERE } from './words';

interface DictionaryEntry {
  word: string;
  phonetic?: string;
  meanings: { partOfSpeech: string; definitions: { definition: string; example?: string }[] }[];
  sourceUrls?: string[];
}

interface Word {
  word: string;
  /** "noun", or the language it comes from. */
  label: string;
  phonetic?: string;
  meaning: string;
  example?: string;
  credit: string;
  link?: string;
}

/**
 * A word, opened like a dictionary: an English word worth knowing, with
 * its meaning from the Free Dictionary API -- or now and then a word from
 * another language that English has no single word for.
 */
@Component({
  selector: 'app-word-room',
  imports: [RoomFrameComponent],
  template: `
    <app-room-frame [status]="word.status()">
      @if (word.value(); as w) {
        <p class="word-room__heading">A word to keep</p>
        <p class="word-room__word">{{ w.word }}</p>
        <p class="word-room__label">{{ w.label }}{{ w.phonetic ? ' · ' + w.phonetic : '' }}</p>
        <p class="room-words room-words--small">{{ w.meaning }}</p>
        @if (w.example) {
          <p class="room-words room-words--small word-room__example">“{{ w.example }}”</p>
        }
        <p class="room-credit">
          @if (w.link) {
            <a [href]="w.link" target="_blank" rel="noopener">{{ w.credit }}</a>
          } @else {
            {{ w.credit }}
          }
        </p>
      }
    </app-room-frame>
  `,
  styles: `
    :host { display: contents; }
    app-room-frame {
      background:
        linear-gradient(to right, transparent 49.6%, rgba(90, 60, 20, 0.18) 50%, transparent 50.4%),
        radial-gradient(ellipse at 50% 40%, #fffaf0, #f1e6cf);
      color: #2a2118;
      font-family: Georgia, 'Times New Roman', serif;
    }
    .word-room__heading { font-size: clamp(0.55rem, 3.6cqi, 0.7rem); letter-spacing: 0.16em; text-transform: uppercase; color: #8b1a1a; }
    .word-room__word { font-size: clamp(1.3rem, 12cqi, 2.2rem); font-weight: 700; line-height: 1; }
    .word-room__label { font-size: clamp(0.65rem, 4.4cqi, 0.85rem); font-style: italic; color: #6b5536; }
    .word-room__example { font-style: italic; opacity: 0.8; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WordRoomComponent {
  private readonly http = inject(HttpClient);

  readonly word = roomLoad(() => (Math.random() < 0.4 ? this.fromElsewhere() : this.english()));

  private english(): Observable<Word> {
    const word = pickOne(ENGLISH_WORDS);
    return this.http.get<DictionaryEntry[]>(`/api/dictionary/${word}`).pipe(
      map((entries) => {
        const entry = entries?.[0];
        const meaning = entry?.meanings?.find((m) => m.definitions?.length);
        if (!entry || !meaning) throw new Error('No definition');
        const definition = meaning.definitions.find((d) => d.example) ?? meaning.definitions[0];
        return {
          word: entry.word,
          label: meaning.partOfSpeech,
          phonetic: entry.phonetic,
          meaning: definition.definition,
          example: definition.example,
          credit: 'Wiktionary, via the Free Dictionary API',
          link: entry.sourceUrls?.[0],
        };
      })
    );
  }

  private fromElsewhere(): Observable<Word> {
    const w = pickOne(WORDS_FROM_ELSEWHERE);
    return of({ word: w.word, label: w.language, meaning: w.meaning, credit: 'A word from elsewhere' });
  }
}
