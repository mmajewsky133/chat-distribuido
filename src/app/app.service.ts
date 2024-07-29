import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { CHAT_KEYGEN_CHARS } from './core/constants/chat.constants';
import { ChatObjectI } from './core/models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private socket: Socket) { }

  public getAvailableMessages(username: string): Promise<ChatObjectI[]> {
    let connectionHash: string = this.generateHash();
    let handshake = {
      connectionHash,
      username
    }
    this.socket.emit('join', handshake);
    return this.socket.fromOneTimeEvent(connectionHash)
  }

  public sendMessage(message: ChatObjectI ): void {
    this.socket.emit('message', message);
  }

  public messageFlow(): Observable<any> {
    return this.socket.fromEvent('message');
  }

  private generateHash(): string {
    let hash: string = "";
    for (let i = 0; i < 32; i++) {
      hash += CHAT_KEYGEN_CHARS.charAt(Math.floor(Math.random()*CHAT_KEYGEN_CHARS.length));
    }
    return hash;
  }
}
