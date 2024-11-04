import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface ChatMessage {
  message: string;
  username: string;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: WebSocket | null = null;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  connectToChat(roomName: string, username: string): void {
    if (!this.isBrowser) return;
    
    this.socket = new WebSocket(`ws://localhost:8000/ws/chat/${roomName}/`);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next([...currentMessages, data]);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  sendMessage(message: string, username: string, roomName: string): void {
    if (this.isBrowser && this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        message: message,
        username: username,
        room: roomName
      }));
    }
  }

  disconnect(): void {
    if (this.isBrowser && this.socket) {
      this.socket.close();
    }
  }

  createChatRoom(currentUser: string, friendUsername: string): string {
    const users = [currentUser, friendUsername].sort();
    return `private_${users[0]}_${users[1]}`;
  }
} 