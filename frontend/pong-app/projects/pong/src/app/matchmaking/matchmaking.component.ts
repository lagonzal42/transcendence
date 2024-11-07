import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatchmakingService } from '../services/matchmaking.service';
import { interval, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-matchmaking',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="matchmaking-container">
      <h2>Finding opponent...</h2>
      <div class="spinner"></div>
      <button (click)="cancelMatchmaking()" class="cancel-btn">Cancel</button>
      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .matchmaking-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
    }
    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 2rem 0;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .cancel-btn {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background-color: #e74c3c;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .error-message {
      color: #e74c3c;
      margin-top: 1rem;
    }
  `]
})
export class MatchmakingComponent implements OnInit, OnDestroy {
  private checkInterval?: Subscription;
  error: string = '';

  constructor(
    private matchmakingService: MatchmakingService,
    private router: Router
  ) {}

  ngOnInit() {
    this.startMatchmaking();
  }

  startMatchmaking() {
    this.matchmakingService.joinQueue().subscribe({
      next: (response) => {
        if (response.status === 'matched') {
          this.router.navigate(['/remote-pong', response.game_id]);
        } else {
          this.pollForMatch();
        }
      },
      error: (err) => {
        console.error('Error joining queue:', err);
        this.error = 'Failed to join matchmaking queue';
      }
    });
  }

  pollForMatch() {
    this.checkInterval = interval(2000).subscribe(() => {
      this.matchmakingService.checkMatch().subscribe({
        next: (response) => {
          if (response.status === 'matched') {
            this.router.navigate(['/remote-pong', response.game_id]);
          }
        },
        error: (err) => {
          console.error('Error checking match:', err);
          this.error = 'Failed to check match status';
          this.checkInterval?.unsubscribe();
        }
      });
    });
  }

  cancelMatchmaking() {
    if (this.checkInterval) {
      this.checkInterval.unsubscribe();
    }
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    if (this.checkInterval) {
      this.checkInterval.unsubscribe();
    }
  }
}