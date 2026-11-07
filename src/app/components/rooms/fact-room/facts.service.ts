import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FactsService {
  constructor(private http: HttpClient) {}

  loadData(): Observable<any> {
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Host': 'random-facts2.p.rapidapi.com',
        'X-RapidAPI-Key': environment.rapidApiKey,
      },
    };
    return this.http.get<any>(
      'https://random-facts2.p.rapidapi.com/getfact',
      options
    );
  }
}
