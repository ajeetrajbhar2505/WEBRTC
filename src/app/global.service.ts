import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  notificationSubject:Subject<any> = new Subject<any>()
  constructor(private http:HttpClient) {
  }

  getData<T>(endpoint: string): Observable<T> {
    const url = `${environment.baseUrl}/${endpoint}`;
    return this.http.get<T>(url);
  }

  postData<T>(endpoint: string, data: any): Observable<T> {
    const url = `${environment.baseUrl}/${endpoint}`;
    return this.http.post<T>(url, data);
  }
}
