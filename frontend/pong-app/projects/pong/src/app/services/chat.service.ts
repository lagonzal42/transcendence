import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';

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
  private messageSubjects = new Map<string, BehaviorSubject<ChatMessage[]>>();
  private isBrowser: boolean;
  private API_URL: string;

  constructor(@Inject(PLATFORM_ID) platformId: Object, private http: HttpClient) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.API_URL = environment.backendURL;
  }

  getMessages(roomName: string): Observable<ChatMessage[]> {
    if (!this.messageSubjects.has(roomName)) {
      this.messageSubjects.set(roomName, new BehaviorSubject<ChatMessage[]>([]));
    }
    return this.messageSubjects.get(roomName)!.asObservable();
  }

  fetchPreviousMessages(roomName: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.API_URL}chat/messages/${roomName}/`);
  }

  connectToChat(roomName: string, username: string): void {
    if (!this.isBrowser) return;
    
    this.fetchPreviousMessages(roomName).subscribe({
      next: (messages) => {
        const subject = this.messageSubjects.get(roomName);
        if (subject) {
          subject.next(messages);
        }
      },
      error: (error) => console.error('Error fetching messages', error)
    });

    this.socket = new WebSocket(`${environment.webSocketURL}ws/chat/${roomName}/`);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const subject = this.messageSubjects.get(roomName);
      if (subject) {
        const currentMessages = subject.value;
        subject.next([...currentMessages, data]);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
      this.messageSubjects.delete(roomName);
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
    return this.http.post(`${this.API_URL}accounts/block/${userId}/`, {});
  }

  unblockUser(userId: number): Observable<any> {
    return this.http.post(`${this.API_URL}accounts/unblock/${userId}/`, {});
  }

  getBlockedUsers(): Observable<ChatUser[]> {
    return this.http.get<ChatUser[]>(`${this.API_URL}accounts/blocked-users/`);
  }

  getUserProfile(username: string): Observable<any> {
    return this.http.get(`${this.API_URL}accounts/users/${username}/`);
  }
}  