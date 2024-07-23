import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private socket: Socket) {}

  sendMessage(message: any): void {
    this.socket.emit('message', message);
  }

  getMessages(): Observable<any> {
    return this.socket.fromEvent('message');
  }
}
