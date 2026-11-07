import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { VideosService } from './videos.service';

@Component({
  selector: 'app-video-room',
  templateUrl: './video-room.component.html',
  styleUrls: ['./video-room.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class VideoRoomComponent implements OnInit {
  videoURL: string = '';
  videoTitle: string = '';

  constructor(private videoStream: VideosService) {}

  ngOnInit(): void {
    this.showTrailerForARandomPopularMovie();
  }

  /**
   * Picks one of the current popular movies at random and shows its trailer,
   * so the room has something different behind the door each visit.
   */
  private showTrailerForARandomPopularMovie(): void {
    this.videoStream.getPopularMovies().subscribe((popular) => {
      const movies = popular.results ?? [];
      if (movies.length === 0) return;

      const movie = movies[Math.floor(Math.random() * movies.length)];

      this.videoStream.getTrailers(movie.id).subscribe((videos) => {
        const trailerKey = this.findYouTubeTrailerKey(videos.results ?? []);
        if (!trailerKey) return;

        this.videoTitle = movie.title;
        // SafePipe only trusts hosts it recognises, and youtube.com is one of
        // them, so this URL is what makes the iframe render.
        this.videoURL = `https://www.youtube.com/embed/${trailerKey}`;
      });
    });
  }

  /**
   * TMDB returns clips, featurettes and teasers alongside trailers, and not
   * all of them are on YouTube. Prefer a real trailer, but fall back to any
   * YouTube video rather than showing the room empty.
   */
  private findYouTubeTrailerKey(
    videos: { key: string; site: string; type: string }[]
  ): string | undefined {
    const onYouTube = videos.filter((video) => video.site === 'YouTube');
    const trailer = onYouTube.find((video) => video.type === 'Trailer');
    return (trailer ?? onYouTube[0])?.key;
  }

}
