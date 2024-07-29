import { Component } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatListModule} from '@angular/material/list';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CHAT_TYPES } from '../../core/constants/chat.constants';
import { ChatObjectI } from '../../core/models/chat.model';
import { AppService } from '../../app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, 
    MatListModule, 
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    ReactiveFormsModule
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {

  currentUsername: string = localStorage.getItem('username') || 'Anonymous';
  chatMessage = new FormControl('');

  messagesList: ChatObjectI[] = [];

  constructor(
    private chatService: AppService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (!localStorage.getItem('username')) this.router.navigate(['/']);

    this.chatService.getAvailableMessages(this.currentUsername).then((messages) => {
      this.messagesList = messages;
      this.chatService.messageFlow().subscribe((message) => {
        this.messagesList.push(message);
      });
    });
  }

  sendMessage(): void {
    if (this.chatMessage.value) {
      let message: ChatObjectI = {
        who: {
          userId: '0', //Should be 0 if not known
          username: this.currentUsername
        },
        when: new Date(),
        what: {
          type: CHAT_TYPES.MESSAGE,
          content: this.chatMessage.value
        }
      }
      this.chatService.sendMessage(message);
      this.chatMessage.setValue('');
    }
  }

  getMessageCssClassDef(message: ChatObjectI): string {
    if (message.what.type === CHAT_TYPES.MESSAGE) {
      this.messagesList.forEach((value, index) => {
        if (value === message) {
          const prevValue = (index > 0) ? this.messagesList[index-1] : null
          const nextValue = (index+1 > this.messagesList.length) ? this.messagesList[index+1] : null
  
          if (prevValue && nextValue) {
            //aplicar un css class pero quedara como un TODO
          }
        }
      })
  
      return (message.who.username === this.currentUsername) ? 'me-message' : 'notme-message'
    } else {
      return 'info-message'
    }
  }

  logout(): void {
    localStorage.removeItem('username');
    window.location.reload();
  }
}
