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
    this.socket = new (window as any).WebSocket(`ws://localhost:8000/ws/status/?token=${token}`);
    
    this.socket.onopen = () => {
      console.log('Status WebSocket connected');
    };
    
    this.socket.onmessage = (event: any) => {
      const data = JSON.parse(event.data);
      if (data.type === 'user_status') {
        this.userStatusSubject.next({
          user_id: data.user_id,
          status: data.status
        });
      }
    };

    this.socket.onclose = () => {
      console.log('Status WebSocket closed. Reconnecting...');
      setTimeout(() => this.connectWebSocket(), 1000);
    };

    this.socket.onerror = (error: any) => {
      console.error('Status WebSocket error:', error);
    };
  }
}