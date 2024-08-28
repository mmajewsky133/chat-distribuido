import { Component, ElementRef, ViewChild } from '@angular/core';
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
import { log } from 'node:console';

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
  @ViewChild('scroll') private chatScroll: ElementRef;

  currentUsername: string = typeof window !== 'undefined' ? localStorage.getItem('username') || '' : '';
  chatMessage = new FormControl('');

  messagesList: ChatObjectI[] = [];

  constructor(
    private chatService: AppService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (!this.currentUsername) this.router.navigate(['/']);

    this.chatService.getAvailableMessages(this.currentUsername).then((response) => {
      if (response.error) {
        this.router.navigate(['/']);
      }
      this.messagesList = response.messages;
      this.chatService.messageFlow().subscribe((message) => {
        console.log('New message received', message);
        this.messagesList.push(message);
      });
    });
  }

  ngAfterViewChecked(){
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.chatScroll.nativeElement.scrollTop = this.chatScroll.nativeElement.scrollHeight;
    } catch(err) {
      console.error('Scrolling error:', err);
    }
  }

  sendMessage(): void {
    if (this.chatMessage.value && this.chatMessage.value.trim() !== '') {
      let message: ChatObjectI = {
        who: {
          userId: '0', //Should be 0 if not known
          username: this.currentUsername
        },
        when: new Date(),
        what: {
          type: CHAT_TYPES.MESSAGE,
          content: this.chatMessage.value.trim()
        }
      }
      this.chatService.sendMessage(message);
      this.chatMessage.setValue('');
    }
  }

  getMessageCssClassDef(message: ChatObjectI): string {
    if (message.what.type === CHAT_TYPES.MESSAGE) {
      return (message.who.username === this.currentUsername) ? 'me-message' : 'notme-message'
    } else {
      return 'info-message'
    }
  }

  getMessageDateCssClassDef(message: ChatObjectI): string {
    if (message.what.type === CHAT_TYPES.MESSAGE) {
      return (message.who.username === this.currentUsername) ? 'me-date' : 'notme-date'
    } else {
      return ''
    }
  }

  getMessageUsernameVisibility(message: ChatObjectI): boolean {
    let visibility = false;
    if (message.what.type === CHAT_TYPES.MESSAGE) {
      if (message.who.username === this.currentUsername) {
        return false;
      }
      this.messagesList.filter((message) => message.what.type === CHAT_TYPES.MESSAGE).forEach((value, index) => {
        if (value === message) {
          const prevValue = (index > 0) ? this.messagesList[index-1] : null
          if (prevValue) {
            visibility = (prevValue.who.username !== message.who.username) || (prevValue.what.type === CHAT_TYPES.NOTIF)
          } else visibility = true
        }
      });
    }
    return visibility
  }

  getMessageDateVisibility(message: ChatObjectI): boolean {
    let visibility = false;
    if (message.what.type === CHAT_TYPES.MESSAGE) {
      this.messagesList.filter((message) => message.what.type === CHAT_TYPES.MESSAGE).forEach((value, index) => {
        if (value === message) {
          const nextValue = (index+1 <= this.messagesList.length) ? this.messagesList[index+1]: null
          if (nextValue) {
            visibility = (nextValue.who.username !== message.who.username) || (nextValue.what.type === CHAT_TYPES.NOTIF)
          } else visibility = true
        }
      });
    }
    return visibility
  }

  logout(): void {
    typeof window !== 'undefined' ? localStorage.removeItem('username') : '';	
    window.location.reload();
  }
}
