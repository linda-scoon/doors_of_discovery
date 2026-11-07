import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { pickOne, roomLoad } from '../room-frame/room-load';

interface Animal {
  /** Who lives here: "a fox". */
  who: string;
  /** More about them, when the API says: a dog's breed. */
  detail?: string;
  image: string;
  credit: string;
  creditUrl: string;
}

/**
 * Somebody lives here: a dog, a cat, a fox or a duck, each from its own free
 * API, credited to it.
 */
@Component({
  selector: 'app-animal-room',
  imports: [RoomFrameComponent],
  templateUrl: './animal-room.component.html',
  styleUrls: ['./animal-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimalRoomComponent {
  private readonly http = inject(HttpClient);

  private readonly animals: ReadonlyArray<() => Observable<Animal>> = [
    () =>
      this.http.get<{ message: string }>('/api/animals/dog').pipe(
        map((r) => ({
          who: 'a dog',
          detail: dogBreed(r.message),
          image: required(r.message),
          credit: 'Dog CEO',
          creditUrl: 'https://dog.ceo/',
        }))
      ),
    () =>
      this.http.get<{ url: string }>('/api/animals/cat').pipe(
        map((r) => ({
          who: 'a cat',
          image: required(r.url),
          credit: 'Cat as a Service',
          creditUrl: 'https://cataas.com/',
        }))
      ),
    () =>
      this.http.get<{ image: string }>('/api/animals/fox').pipe(
        map((r) => ({
          who: 'a fox',
          image: required(r.image),
          credit: 'RandomFox',
          creditUrl: 'https://randomfox.ca/',
        }))
      ),
    () =>
      this.http.get<{ url: string }>('/api/animals/duck').pipe(
        map((r) => ({
          who: 'a duck',
          // It answers with http links, which a page on https will not load.
          image: required(r.url).replace(/^http:/, 'https:'),
          credit: 'random-d.uk',
          creditUrl: 'https://random-d.uk/',
        }))
      ),
  ];

  readonly animal = roomLoad(() => pickOne(this.animals)());
}

function required(url: string | undefined): string {
  if (!url) throw new Error('No picture in the response');
  return url;
}

/**
 * The breed, from where the picture is filed: ".../breeds/shiba/..." is a
 * Shiba, and ".../breeds/hound-afghan/..." an Afghan Hound. Said beside "a
 * dog" rather than instead of it, because some come out as "Swiss Mountain"
 * and need the word "dog" after them.
 */
function dogBreed(url: string | undefined): string | undefined {
  const breed = url?.match(/\/breeds\/([^/]+)\//)?.[1];
  if (!breed) return undefined;
  return breed
    .split('-')
    .reverse()
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
