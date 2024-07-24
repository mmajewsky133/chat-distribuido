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

  messagesList: any[] = [
    {
      who: 'me',
      what: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque posuere nisl suscipit velit pulvinar vestibulum.'
    },
    {
      who: 'not me',
      what: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque posuere nisl suscipit velit pulvinar vestibulum.'
    },
    {
      who: 'me',
      what: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque posuere nisl suscipit velit pulvinar vestibulum.'
    },
    {
      who: 'me',
      what: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque posuere nisl suscipit velit pulvinar vestibulum.'
    },
    {
      who: 'not me',
      what: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque posuere nisl suscipit velit pulvinar vestibulum.'
    },
    {
      who: 'not me',
      what: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque posuere nisl suscipit velit pulvinar vestibulum.'
    },
    {
      who: 'not me',
      what: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque posuere nisl suscipit velit pulvinar vestibulum.'
    },

  ];

  constructor(
    private chatService: ChatService
  ) { }

  ngOnInit(): void {
    this.chatService.getMessages().subscribe((message) => {
      this.messagesList.push(message);
    });
  }

  sendMessage(): void {
    if (this.chatMessage.value) {
      let message = {
        who: this.usernameForm.value || 'Anonymous',
        what: this.chatMessage.value,
      }
      this.chatService.sendMessage(message);
      this.chatMessage.setValue('');
    }
  }

  getMessageCssClassDef(message: any): string {
    let messageMode: string

    this.messagesList.forEach((value, index) => {
      if (value === message) {
        const prevValue = (index > 0) ? this.messagesList[index-1] : null
        const nextValue = (index+1 > this.messagesList.length) ? this.messagesList[index+1] : null

        if (prevValue && nextValue) {

        }
      }
    })

    return (message.who === this.usernameForm.value) ? 'me-message' : 'notme-message'
  }
}
