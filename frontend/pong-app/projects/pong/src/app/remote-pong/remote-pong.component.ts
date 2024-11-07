import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { PongService } from '../services/pong.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-remote-pong',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './remote-pong.component.html',
  styleUrls: ['./remote-pong.component.css']
})
export class RemotePongComponent implements AfterViewInit, OnDestroy {
  @ViewChild('pongCanvas') pongCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private gameStateSubscription?: Subscription;
  private keyboardListener?: (event: KeyboardEvent) => void;
  private isBrowser: boolean;
  
  player1Score: number = 0;
  player2Score: number = 0;
  isGameStarted: boolean = false;
  gameEnded: boolean = false;
  winnerMessage: string = '';

  constructor(
    private pongService: PongService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.ctx = this.pongCanvas.nativeElement.getContext('2d')!;
      
      // Get game ID from route params
      this.route.params.subscribe(params => {
        const gameId = params['gameId'];
        this.initializeGame(gameId);
      });

      // Listen for keyboard events
      this.keyboardListener = this.handleKeyPress.bind(this);
      window.addEventListener('keydown', this.keyboardListener);
    }
  }

  ngOnDestroy() {
    this.gameStateSubscription?.unsubscribe();
    this.pongService.disconnect();
    
    if (this.isBrowser && this.keyboardListener) {
      window.removeEventListener('keydown', this.keyboardListener);
    }
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