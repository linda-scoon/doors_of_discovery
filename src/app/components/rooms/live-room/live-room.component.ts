import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { roomLoad, shuffled } from '../room-frame/room-load';
import { SafePipe } from '../../../pipes/safe.pipe';

export interface LiveStream {
  id: string;
  title: string;
  channel: string;
  topic: string;
}

const VIDEO_ID = /^[\w-]{11}$/;

/**
 * A window onto somewhere live right now: the Earth from the space station,
 * a waterhole in Africa, a kelp forest, a bird feeder. The server says which
 * streams are on; the room picks one, and "Another" moves to the next,
 * trying a different kind of view first.
 */
@Component({
  selector: 'app-live-room',
  imports: [RoomFrameComponent, SafePipe],
  template: `
    <app-room-frame [status]="streams.status()">
      @if (current(); as s) {
        <p class="live__badge"><span class="live__dot"></span> Live</p>
        <div class="live__screen">
          <!-- Only while the door is open, so nothing plays behind a shut one. -->
          @if (open() && (embed() | safe); as trusted) {
            <iframe [src]="trusted" [title]="'Live: ' + s.title"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
          }
        </div>
        <p class="room-words room-words--small live__title">{{ s.title }}</p>
        @if (count() > 1) {
          <button type="button" class="room-button" (click)="another()">Another view</button>
        }
        <p class="room-credit">
          Live from {{ s.channel }} on <a [href]="'https://www.youtube.com/watch?v=' + s.id" target="_blank" rel="noopener">YouTube</a>
        </p>
      }
    </app-room-frame>
  `,
  styles: `
    :host { display: contents; }
    app-room-frame {
      background: radial-gradient(ellipse at 50% 30%, #1f2a33, #0b1015 75%);
      color: #e8f1f5;
      gap: 3.5cqi;
    }
    .live__badge {
      display: flex;
      align-items: center;
      gap: 1.5cqi;
      padding: 0.6cqi 2.6cqi;
      border-radius: 999px;
      background: #d62828;
      color: #fff;
      font-size: clamp(0.58rem, 3.8cqi, 0.75rem);
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .live__dot { width: 1.8cqi; aspect-ratio: 1; border-radius: 50%; background: #fff; animation: pulse 1.4s ease-in-out infinite; }
    @keyframes pulse { 50% { opacity: 0.25; } }
    .live__screen {
      width: 100%;
      aspect-ratio: 16 / 9;
      flex-shrink: 0;
      border: 1.4cqi solid #2b3640;
      border-radius: 2cqi;
      background: #000;
      box-shadow: 0 2cqi 5cqi rgba(0, 0, 0, 0.6);
      overflow: hidden;
    }
    .live__screen iframe { display: block; width: 100%; height: 100%; border: 0; }
    .live__title { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    @media (prefers-reduced-motion: reduce) { .live__dot { animation: none; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveRoomComponent {
  private readonly http = inject(HttpClient);

  /** Whether the door is open; the stream only plays while it is. */
  readonly open = input(false);

  /** The streams in the order they will be shown, a different kind each time where possible. */
  readonly streams = roomLoad(() =>
    this.http.get<{ streams: LiveStream[] }>('/api/live').pipe(
      map((body) => {
        const usable = (body?.streams ?? []).filter((s) => VIDEO_ID.test(s?.id ?? ''));
        if (!usable.length) throw new Error('Nothing live');
        return alternate(shuffled(usable));
      })
    )
  );

  private readonly place = signal(0);
  readonly count = computed(() => this.streams.value()?.length ?? 0);
  readonly current = computed(() => this.streams.value()?.[this.place() % Math.max(1, this.count())]);
  /** Muted to start with, as browsers only let a muted video play by itself. */
  readonly embed = computed(() => {
    const s = this.current();
    return s ? `https://www.youtube-nocookie.com/embed/${s.id}?autoplay=1&mute=1&playsinline=1&rel=0` : '';
  });

  another(): void {
    this.place.update((n) => n + 1);
  }
}

/** Reorders so that, as far as it can, no two of the same kind come together. */
export function alternate(streams: LiveStream[]): LiveStream[] {
  const left = [...streams];
  const ordered: LiveStream[] = [];
  while (left.length) {
    const last = ordered[ordered.length - 1]?.topic;
    const next = left.findIndex((s) => s.topic !== last);
    ordered.push(...left.splice(next === -1 ? 0 : next, 1));
  }
  return ordered;
}
