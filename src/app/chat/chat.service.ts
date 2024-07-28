import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { ChatObjectI } from '../models/chat.model';
import { createHash } from 'crypto';
import { CHAT_KEYGEN_CHARS } from '../constants/chat.constants';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private socket: Socket) { }

  getAvailableMessages(username: string): Promise<ChatObjectI[]> {
    let connectionHash: string = this.generateHash();
    let handshake = {
      connectionHash,
      username
    }
    this.socket.emit('join', handshake);
    return this.socket.fromOneTimeEvent(connectionHash)
  }

  sendMessage(message: ChatObjectI ): void {
    this.socket.emit('message', message);
  }

  messageFlow(): Observable<any> {
    return this.socket.fromEvent('message');
  }

  generateHash(): string {
    let hash: string = "";
    for (let i = 0; i < 32; i++) {
      hash += CHAT_KEYGEN_CHARS.charAt(Math.floor(Math.random()*CHAT_KEYGEN_CHARS.length));
    }
    return hash;
  }
}
