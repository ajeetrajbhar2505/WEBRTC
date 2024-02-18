import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class SignalingService {
  socket: any;
  constructor() {
    this.socket = io(environment.baseUrl, {
      transports: ['websocket'],
    });
  }

  getMessages(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('message', (data) => {
        observer.next(data);
      });
  })
}

  sendMessage(payload): void {
    this.socket.emit('send-message', payload);
  }

}
