import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

export interface ChatMessage {
  message: string;
  username: string;
  timestamp?: string;
}

export interface ChatUser {
  id: number;
  username: string;
  isBlocked: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: WebSocket | null = null;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  private isBrowser: boolean;
  private API_URL: string;

  constructor(@Inject(PLATFORM_ID) platformId: Object, private http: HttpClient) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.API_URL = 'http://localhost:8000';
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

  blockUser(userId: number): Observable<any> {
    return this.http.post(`${this.API_URL}/accounts/block/${userId}/`, {});
  }

  unblockUser(userId: number): Observable<any> {
    return this.http.post(`${this.API_URL}/accounts/unblock/${userId}/`, {});
  }

  getBlockedUsers(): Observable<ChatUser[]> {
    return this.http.get<ChatUser[]>(`${this.API_URL}/accounts/blocked-users/`);
  }

  getUserProfile(username: string): Observable<any> {
    return this.http.get(`${this.API_URL}/accounts/users/${username}/`);
  }
} 