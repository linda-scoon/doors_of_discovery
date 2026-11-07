import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MusicService {
  constructor(private http: HttpClient) {}

  loadData(): Observable<any> {
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Host': 'deezerdevs-deezer.p.rapidapi.com',
        'X-RapidAPI-Key': environment.rapidApiKey,
      },
    };

    return this.http.get<any>(
      'https://deezerdevs-deezer.p.rapidapi.com/playlist/1132739621',
      options
    );
  }
}
