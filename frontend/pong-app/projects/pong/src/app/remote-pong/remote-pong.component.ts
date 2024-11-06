import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { PongService } from '../services/pong.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-remote-pong',
  standalone: true,
  template: `
    <div class="game-container">
      <div class="score-board">
        <span class="player-score">{{player1Score}}</span>
        <span class="separator">-</span>
        <span class="player-score">{{player2Score}}</span>
      </div>
      <canvas #pongCanvas width="700" height="500"></canvas>
      <div class="game-status" *ngIf="!isGameStarted">
        Waiting for opponent...
      </div>
      <div class="winner-message" *ngIf="gameEnded">
        {{winnerMessage}}
      </div>
    </div>
  `,
  styles: [`
    .game-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
    }

    canvas {
      background-color: #000;
      border-radius: 8px;
    }

    .score-board {
      font-size: 2em;
      margin-bottom: 20px;
      font-family: 'Arial', sans-serif;
    }

    .player-score {
      padding: 0 20px;
    }

    .separator {
      color: #666;
    }

    .game-status {
      margin-top: 20px;
      font-size: 1.2em;
      color: #666;
    }

    .winner-message {
      margin-top: 20px;
      font-size: 1.5em;
      color: #4CAF50;
    }
  `]
})
export class RemotePongComponent implements AfterViewInit, OnDestroy {
  @ViewChild('pongCanvas') pongCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private gameStateSubscription?: Subscription;
  
  player1Score: number = 0;
  player2Score: number = 0;
  isGameStarted: boolean = false;
  gameEnded: boolean = false;
  winnerMessage: string = '';

  constructor(
    private pongService: PongService,
    private route: ActivatedRoute
  ) {}

  ngAfterViewInit() {
    this.ctx = this.pongCanvas.nativeElement.getContext('2d')!;
    
    // Get game ID from route params
    this.route.params.subscribe(params => {
      const gameId = params['gameId'];
      this.initializeGame(gameId);
    });

    // Listen for keyboard events
    window.addEventListener('keydown', this.handleKeyPress.bind(this));
  }

  ngOnDestroy() {
    this.gameStateSubscription?.unsubscribe();
    this.pongService.disconnect();
    window.removeEventListener('keydown', this.handleKeyPress.bind(this));
  }

  private initializeGame(gameId: string) {
    this.pongService.connectToGame(gameId);
    
    this.gameStateSubscription = this.pongService.gameState$.subscribe(
      gameState => {
        if (gameState) {
          this.updateGameState(gameState);
        }
      }
    );
  }

  private updateGameState(gameState: any) {
    this.isGameStarted = true;
    this.player1Score = gameState.score1;
    this.player2Score = gameState.score2;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.pongCanvas.nativeElement.width, this.pongCanvas.nativeElement.height);
    
    // Draw paddles
    this.ctx.fillStyle = '#FFF';
    this.ctx.fillRect(10, gameState.player1_y, 10, 75);
    this.ctx.fillRect(this.pongCanvas.nativeElement.width - 20, gameState.player2_y, 10, 75);
    
    // Draw ball
    this.ctx.beginPath();
    this.ctx.arc(gameState.ball_x, gameState.ball_y, 10, 0, Math.PI * 2);
    this.ctx.fillStyle = '#FFF';
    this.ctx.fill();
    this.ctx.closePath();

    // Check for game end
    if (gameState.game_over) {
      this.gameEnded = true;
      this.winnerMessage = gameState.winner + ' wins!';
    }
  }

  private handleKeyPress(event: KeyboardEvent) {
    if (!this.isGameStarted || this.gameEnded) return;

    switch (event.key) {
      case 'ArrowUp':
        this.pongService.sendPlayerMove('up');
        break;
      case 'ArrowDown':
        this.pongService.sendPlayerMove('down');
        break;
    }
  }
}