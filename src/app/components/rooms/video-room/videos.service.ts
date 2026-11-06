import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class VideosService {
  private API_KEY: string = 'k_8axj0f65';

  constructor(private http: HttpClient) {}

  getPopularMovies() {
    return this.http.get<any>(
      `https://imdb-api.com/en/API/MostPopularMovies/${this.API_KEY}`
    );
  }

  getTrailer(movieId: string): Observable<any> {
    // return a trailer of the random movie
    return this.http.get<any>(
      `https://imdb-api.com/en/API/Trailer/${this.API_KEY}/${movieId}`
    );
  }
}
