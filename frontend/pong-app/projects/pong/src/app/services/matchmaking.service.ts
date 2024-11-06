import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MatchmakingService {
  private matchmakingSocket$: WebSocketSubject<any> | null = null;
  private matchFoundSubject = new BehaviorSubject<string | null>(null);
  private readonly API_URL = 'http://localhost:8000/api';
  private readonly WS_URL = 'ws://localhost:8000/ws';
  
  matchFound$ = this.matchFoundSubject.asObservable();

  constructor(private http: HttpClient) {}

  joinQueue(): Observable<any> {
    // Connect to matchmaking WebSocket
    this.matchmakingSocket$ = webSocket(
      `${this.WS_URL}/matchmaking/`
    );

    this.matchmakingSocket$.subscribe(
      (message) => {
        if (message.type === 'match_found') {
          this.matchFoundSubject.next(message.game_id);
        }
      }
    );

    // Also call the REST endpoint
    return this.http.post(
      `${this.API_URL}/matchmaking/join_queue/`, 
      {}
    );
  }

  leaveQueue(): Observable<any> {
    if (this.matchmakingSocket$) {
      this.matchmakingSocket$.complete();
      this.matchmakingSocket$ = null;
    }
    
    return this.http.post(
      `${this.API_URL}/matchmaking/leave_queue/`, 
      {}
    );
  }

  checkActiveGame(): Observable<any> {
    return this.http.get(
      `${this.API_URL}/matchmaking/active_game/`
    );
  }
}