import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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

  constructor() {}

  connectToChat(roomName: string, username: string): void {
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
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        message: message,
        username: username,
        room: roomName
      }));
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
  }

  createChatRoom(currentUser: string, friendUsername: string): string {
    // Create a consistent room name for two users
    const users = [currentUser, friendUsername].sort();
    return `private_${users[0]}_${users[1]}`;
  }
} 