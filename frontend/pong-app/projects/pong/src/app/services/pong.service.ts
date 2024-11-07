import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface GameState {
  player1_y: number;
  player2_y: number;
  ball_x: number;
  ball_y: number;
  score1: number;
  score2: number;
  game_over: boolean;
  winner: string;
}

@Injectable({
  providedIn: 'root'
})
export class PongService {
  private socket: WebSocket | null = null;
  private gameStateSubject = new BehaviorSubject<GameState | null>(null);
  private isBrowser: boolean;
  
  gameState$ = this.gameStateSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  connectToGame(gameId: string): void {
    if (!this.isBrowser) return;

    try {
        this.socket = new WebSocket(`ws://localhost:8000/ws/pong/${gameId}/`);
        
        this.socket.onopen = () => {
            console.log('Connected to game server');
        };

        this.socket.onmessage = (event) => {
            try {
                const gameState = JSON.parse(event.data);
                this.gameStateSubject.next(gameState);
            } catch (error) {
                console.error('Error parsing game state:', error);
            }
        };

        this.socket.onclose = (event) => {
            console.log('WebSocket closed:', event.code, event.reason);
            this.gameStateSubject.next(null);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    } catch (error) {
        console.error('Error creating WebSocket:', error);
    }
  }

  sendPlayerMove(direction: 'up' | 'down'): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'paddle_move',
        direction: direction
      }));
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}