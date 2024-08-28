import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { catchError, firstValueFrom, Observable, retry, throwError } from 'rxjs';
import { CHAT_KEYGEN_CHARS } from './core/constants/chat.constants';
import { ChatObjectI } from './core/models/chat.model';
import { ChatHistoryResponseI, LoginCredentialsI, LoginRequestI, UserRegistrationI } from './core/models/connection.model';
import { sha256 } from 'js-sha256'; 
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(
    private socket: Socket,
    private http: HttpClient
  ) { }

  public getAvailableMessages(username: string): Promise<ChatHistoryResponseI> {
    let connectionHash: string = this.generateHash();
    let handshake = {
      connectionHash,
      username,
      jwt: typeof window !== 'undefined' ? localStorage.getItem('jwt') || '' : ''
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

  public login = async (credentials: LoginCredentialsI): Promise<string> => {
    return await firstValueFrom(
      this.http.post<any>('https://chat-distribuido-server.vercel.app/auth/login', credentials).pipe(
        retry(2),
        catchError((error: any) => 
          throwError(
            () => new Error(`Error: ${error.message}`)
          ),
        ),
      ),
    );
  }

  public signup = async (credentials: UserRegistrationI): Promise<string> => {
    return await firstValueFrom(
      this.http.post<any>('https://chat-distribuido-server.vercel.app/admin/users', credentials).pipe(
        retry(2),
        catchError((error: any) => 
          throwError(
            () => new Error(`Error: ${error.message}`)
          ),
        ),
      ),
    );
  }

  get salt(): string {
    let salt: string = "";
    for (let i = 0; i < 6; i++) {
      salt += CHAT_KEYGEN_CHARS.charAt(Math.floor(Math.random()*CHAT_KEYGEN_CHARS.length));
    }
    return salt;
  }

  public generateUserHash = (username: string, password: string, salt: string): string => {
    return sha256(password+':'+salt);
  }

  private generateHash = (): string => {
    let hash: string = "";
    for (let i = 0; i < 32; i++) {
      hash += CHAT_KEYGEN_CHARS.charAt(Math.floor(Math.random()*CHAT_KEYGEN_CHARS.length));
    }
    return hash;
  }
}
