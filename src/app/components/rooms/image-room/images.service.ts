import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ImagesService {
  constructor(private http: HttpClient) {}
  loadData(): Observable<any> {
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Host': 'programming-memes-images.p.rapidapi.com',
        'X-RapidAPI-Key': environment.rapidApiKey,
      },
    };
    return this.http.get<any>(
      'https://programming-memes-images.p.rapidapi.com/v1/memes',
      options
    );
  }
}
