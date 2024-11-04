import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../services/chat.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      <div class="messages-container">
        <div *ngFor="let message of messages$ | async" class="message">
          <strong>{{ message.username }}:</strong> {{ message.message }}
        </div>
      </div>
      <div class="input-container">
        <input [(ngModel)]="newMessage" 
               (keyup.enter)="sendMessage()"
               placeholder="Type a message...">
        <button (click)="sendMessage()">Send</button>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 400px;
      width: 300px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
    }
    .message {
      margin: 5px 0;
    }
    .input-container {
      display: flex;
      padding: 10px;
      border-top: 1px solid #ccc;
    }
    input {
      flex: 1;
      margin-right: 10px;
      padding: 5px;
    }
    button {
      padding: 5px 15px;
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  messages$: Observable<ChatMessage[]>;
  newMessage: string = '';
  private roomName: string;
  private username: string;

  constructor(private chatService: ChatService) {
    this.messages$ = this.chatService.messages$;
    // For testing purposes - these should come from your auth service
    this.username = 'testUser';
    this.roomName = 'testRoom';
  }

  ngOnInit() {
    this.chatService.connectToChat(this.roomName, this.username);
  }

  ngOnDestroy() {
    this.chatService.disconnect();
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.chatService.sendMessage(this.newMessage, this.username, this.roomName);
      this.newMessage = '';
    }
  }
} 