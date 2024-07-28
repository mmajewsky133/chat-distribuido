import { Component } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatListModule} from '@angular/material/list';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import { ChatService } from './chat.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatObjectI, WhatI, WhoI } from '../models/chat.model';
import { CHAT_TYPES } from '../constants/chat.constants';

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

  usernameForm = new FormControl('me');
  chatMessage = new FormControl('');

  messagesList: ChatObjectI[] = [];

  constructor(
    private chatService: ChatService
  ) { }

  ngOnInit(): void {
    this.chatService.getAvailableMessages(this.usernameForm.value || 'Anonymous').then((messages) => {
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
          userId: '12345', //Should be 0 if not known
          username: this.usernameForm.value || 'Anonymous'
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
    this.messagesList.forEach((value, index) => {
      if (value === message) {
        const prevValue = (index > 0) ? this.messagesList[index-1] : null
        const nextValue = (index+1 > this.messagesList.length) ? this.messagesList[index+1] : null

        if (prevValue && nextValue) {

        }
      }
    })

    return (message.who.username === this.usernameForm.value) ? 'me-message' : 'notme-message'
  }
}
