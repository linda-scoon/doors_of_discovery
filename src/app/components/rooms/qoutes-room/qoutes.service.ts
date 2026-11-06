import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class QoutesService {
  constructor(private http: HttpClient) {}

  loadData(): Observable<any> {
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Host': 'quotelibapi.p.rapidapi.com',
      'X-RapidAPI-Key': environment.factsApiKey,
    },
  };
    return this.http.get<any>(
      'https://quotelibapi.p.rapidapi.com/quote?en',
      options
    );
  }
}
