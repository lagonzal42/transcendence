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
        <div *ngFor="let message of messages$ | async" 
             class="message-wrapper"
             [ngClass]="{'own-message': message.username === username}">
          <div class="message-bubble">
            <div class="message-sender" *ngIf="message.username !== username">
              {{ message.username }}
            </div>
            <div class="message-content">
              {{ message.message }}
            </div>
          </div>
        </div>
      </div>
      <div class="input-container">
        <input [(ngModel)]="newMessage" 
               (keyup.enter)="sendMessage()"
               placeholder="iMessage">
        <button (click)="sendMessage()">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 600px;
      width: 100%;
      max-width: 400px;
      border-radius: 12px;
      background-color: #f5f5f5;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .message-wrapper {
      display: flex;
      justify-content: flex-start;
      margin: 4px 0;
    }

    .own-message {
      justify-content: flex-end;
    }

    .message-bubble {
      max-width: 70%;
      padding: 8px 12px;
      border-radius: 20px;
      background-color: #e9e9eb;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .own-message .message-bubble {
      background-color: #0b93f6;
      color: white;
    }

    .message-sender {
      font-size: 0.8em;
      color: #666;
      margin-bottom: 2px;
    }

    .message-content {
      word-wrap: break-word;
    }

    .input-container {
      display: flex;
      padding: 12px;
      gap: 8px;
      background-color: #fff;
      border-top: 1px solid #e0e0e0;
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
    }

    input {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 20px;
      background-color: #f0f0f0;
      font-size: 1em;
      outline: none;
    }

    input:focus {
      background-color: #e8e8e8;
    }

    button {
      background-color: transparent;
      border: none;
      color: #0b93f6;
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }

    button:hover {
      transform: scale(1.1);
    }

    button svg {
      width: 24px;
      height: 24px;
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  messages$: Observable<ChatMessage[]>;
  newMessage: string = '';
  private roomName: string = '';
  public username: string = '';

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