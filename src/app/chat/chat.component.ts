import { Component } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatListModule} from '@angular/material/list';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import { ChatService } from './chat.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
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

  usernameForm = new FormControl('');
  chatMessage = new FormControl('');

  messagesList: any[] = [];

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
}
