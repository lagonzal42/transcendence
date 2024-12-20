import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Match {
  id: number;
  player1_username: string;
  player2_username: string;
  player1_score: number;
  player2_score: number;
  winner_username: string;
  match_date: string;
  match_type: string;
}

@Component({
  selector: 'app-match-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-history.component.html',
  styleUrl: './match-history.component.css'
})
export class MatchHistoryComponent {
  matches: Match[] = [];
  currentUsername: string = '';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const username = params['username'];
      this.currentUsername = username;
      if (username) {
        this.loadMatchHistory(username);
      }
    });
  }

  loadMatchHistory(username: string) {
    this.http.get<Match[]>(`http://localhost:8000/accounts/users/${username}/matches/`)
      .subscribe({
        next: (matches) => {
          this.matches = matches;
        },
        error: (error) => {
          console.error('Error loading match history:', error);
        }
      });
  }
}
