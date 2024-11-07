import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class MatchmakingService {
    private API_URL = 'http://localhost:8000/';
  
    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    private getHeaders(): HttpHeaders {
        const token = this.authService.getAccessToken();
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
        });
    }
  
    joinQueue(): Observable<any> {
        return this.http.post(
            `${this.API_URL}remote-pong/queue/join/`, 
            {},
            { headers: this.getHeaders() }
        );
    }
  
    checkMatch(): Observable<any> {
        return this.http.get(
            `${this.API_URL}remote-pong/queue/check/`,
            { headers: this.getHeaders() }
        );
    }
}