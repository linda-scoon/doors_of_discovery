import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { pickOne, roomLoad } from '../room-frame/room-load';
import { SafePipe } from '../../../pipes/safe.pipe';
import { TheatreCurtainsComponent } from '../theatre-curtains/theatre-curtains.component';

/** The fields of TMDB's popular-movies response that this room uses. */
interface PopularMovies {
  results: { id: number; title: string }[];
}

/** The fields of TMDB's movie-videos response that this room uses. */
interface MovieVideos {
  results: { key: string; site: string; type: string }[];
}

/**
 * The trailer for one of this week's popular films. Two calls: the list of
 * films, which the server keeps for an hour, then that film's videos.
 */
@Component({
  selector: 'app-video-room',
  imports: [RoomFrameComponent, SafePipe, TheatreCurtainsComponent],
  templateUrl: './video-room.component.html',
  styleUrls: ['./video-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoRoomComponent {
  private readonly http = inject(HttpClient);

  /** Whether the door is open; the trailer only plays while it is. */
  readonly open = input(false);

  readonly trailer = roomLoad(() =>
    this.http.get<PopularMovies>('/api/videos/popular').pipe(
      map((popular) => pickOne(popular?.results)),
      switchMap((movie) =>
        this.http.get<MovieVideos>(`/api/videos/trailer/${movie.id}`).pipe(
          map((videos) => ({
            title: movie.title,
            // No-cookie YouTube, playing straight away: opening the door
            // was the press of play. Some phones still ask for a tap.
            url:
              `https://www.youtube-nocookie.com/embed/${youTubeTrailerKey(videos?.results)}` +
              '?autoplay=1&playsinline=1&rel=0',
          }))
        )
      )
    )
  );
}

/**
 * TMDB returns clips, featurettes and teasers alongside trailers, and not
 * all of them are on YouTube. Prefer a real trailer, but take any YouTube
 * video over none. Throws if there is nothing to show, so the room is
 * bricked up rather than left with an empty player.
 */
function youTubeTrailerKey(videos: MovieVideos['results'] | undefined): string {
  const onYouTube = (videos ?? []).filter((video) => video.site === 'YouTube');
  const trailer = onYouTube.find((video) => video.type === 'Trailer') ?? onYouTube[0];
  if (!trailer) throw new Error('No trailer on YouTube');
  return trailer.key;
}
