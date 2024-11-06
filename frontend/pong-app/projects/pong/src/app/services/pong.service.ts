import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PongService {
  private socket$: WebSocketSubject<any>;
  private gameStateSubject = new BehaviorSubject<any>(null);
  gameState$ = this.gameStateSubject.asObservable();

  constructor() {}

  connectToGame(gameId: string) {
    this.socket$ = webSocket(`ws://localhost:8000/ws/pong/${gameId}/`);
    
    this.socket$.subscribe(
      (gameState) => this.gameStateSubject.next(gameState),
      (error) => console.error('WebSocket error:', error),
      () => console.log('WebSocket connection closed')
    );
  }

  sendPlayerMove(direction: 'up' | 'down') {
    this.socket$.next({
      type: 'player_move',
      direction: direction
    });
  }

  disconnect() {
    if (this.socket$) {
      this.socket$.complete();
    }
  }
}