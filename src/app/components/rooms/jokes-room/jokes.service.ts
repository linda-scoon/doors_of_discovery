import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JokesService {
  constructor(private http: HttpClient) {}

  loadData(): Observable<any> {
    // The key for this API lives on the server; see server/apis.js.
    return this.http.get<any>('/api/jokes');
  }
}
