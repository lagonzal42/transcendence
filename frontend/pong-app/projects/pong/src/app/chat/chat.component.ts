import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../services/chat.service';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

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
  private roomName: string = '';
  private username: string = '';

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.messages$ = this.chatService.messages$;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.roomName = params['roomId'];
    });

    this.http.get<User>(`${this.authService.API_URL}/accounts/me/`).subscribe({
      next: (user) => {
        this.username = user.username;
        if (this.username && this.roomName) {
          this.chatService.connectToChat(this.roomName, this.username);
        }
      },
      error: (error) => {
        console.error('Error getting user:', error);
      }
    });
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