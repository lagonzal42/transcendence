import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../auth/auth.service';

interface UserStatus {
  user_id: number;
  status: 'online' | 'offline';
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: any = null;
  private userStatusSubject = new Subject<UserStatus>();
  userStatus$ = this.userStatusSubject.asObservable();
  private isBrowser: boolean;
  private onlineUsers: Set<number> = new Set();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      const token = this.authService.getAccessToken();
      if (token) {
        this.connectWebSocket();
      }
    }
  }

  private connectWebSocket() {
    if (!this.isBrowser) return;
    
    const token = this.authService.getAccessToken();
    if (!token) return;

    this.socket = new (window as any).WebSocket(`ws://localhost:8000/ws/status/?token=${token}`);
    
    this.socket.onopen = () => {
      this.socket.send(JSON.stringify({
        token: token
      }));
      console.log('Status WebSocket connected');
    };
    
    this.socket.onmessage = (event: any) => {
      const data = JSON.parse(event.data);
      console.log('Received WebSocket message:', data);
      
      if (data.type === 'initial_status') {
        // Handle initial status update
        this.onlineUsers.clear();
        data.online_users.forEach((userId: number) => {
          this.onlineUsers.add(userId);
          this.userStatusSubject.next({
            user_id: userId,
            status: 'online'
          });
        });
      } else if (data.type === 'user_status') {
        if (data.status === 'online') {
          this.onlineUsers.add(data.user_id);
        } else {
          this.onlineUsers.delete(data.user_id);
        }
        this.userStatusSubject.next({
          user_id: data.user_id,
          status: data.status
        });
      }
    };

    this.socket.onclose = () => {
      console.log('Status WebSocket closed');
      if (this.authService.getAccessToken()) {
        console.log('Attempting to reconnect...');
        setTimeout(() => this.connectWebSocket(), 5000);
      }
    };

    this.socket.onerror = (error: any) => {
      console.error('Status WebSocket error:', error);
    };
  }

  isUserOnline(userId: number): boolean {
    return this.onlineUsers.has(userId);
  }
}