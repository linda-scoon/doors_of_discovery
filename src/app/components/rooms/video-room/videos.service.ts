import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/** The fields of TMDB's popular-movies response that this room uses. */
export interface PopularMovies {
  results: { id: number; title: string }[];
}

/** The fields of TMDB's movie-videos response that this room uses. */
export interface MovieVideos {
  results: { key: string; site: string; type: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class VideosService {
  constructor(private http: HttpClient) {}

  // The TMDB key lives on the server; see server/apis.js. These URLs are our
  // own origin, so nothing here needs a credential.

  getPopularMovies(): Observable<PopularMovies> {
    return this.http.get<PopularMovies>('/api/videos/popular');
  }

  getTrailers(movieId: number): Observable<MovieVideos> {
    return this.http.get<MovieVideos>(`/api/videos/trailer/${movieId}`);
  }
}
