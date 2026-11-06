import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GifsService {
  constructor(private http: HttpClient) {}

  loadData(): Observable<any> {
    return this.http.get<any>(
      `https://api.giphy.com/v1/gifs/random?api_key=${environment.gifsApiKey}&tag=%3CREQUIRED%3E`
    );
  }
}
