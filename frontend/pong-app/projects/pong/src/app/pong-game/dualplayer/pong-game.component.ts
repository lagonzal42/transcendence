import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PaddleComponent as Paddle } from "../gameClasses/paddle/paddle.component"
import { BallComponent as Ball } from '../gameClasses/ball/ball.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pong-game',
  standalone: true,
  templateUrl: './pong-game.component.html',
  styleUrls: ['./pong-game.component.css']
})
export class PongGameComponent implements OnInit, AfterViewInit {
  @ViewChild('pongCanvas', { static: false }) pongCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D | null;
  public isGameInitialized: boolean = false;
  private players: any;

  // Nombres de los jugadores
  public leftPlayerName: string = '';
  public rightPlayerName: string = '';

  // Paddle settings
  private paddleHeight: number = 75;
  private paddleWidth: number = 10;
  private leftPaddle?: Paddle;
  private rightPaddle?: Paddle;

  // Ball settings
  private ball? : Ball;

  // Score
  public leftPlayerScore: number = -1;
  public rightPlayerScore: number = 0;
  private winningScore: number = 3;
  private gameEnded: boolean = false;

  // Paddle movement flags
  private leftPaddleUp: boolean = false;
  private leftPaddleDown: boolean = false;
  private rightPaddleUp: boolean = false;
  private rightPaddleDown: boolean = false;


  isTournamentMatch: boolean = false;
  onMatchComplete: ((winner: string) => void) | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router, private http: HttpClient) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const players = navigation.extras.state['players'];
      if (players) {
        this.leftPlayerName = players.leftPlayerName;
        this.rightPlayerName = players.rightPlayerName;
        this.players = players;
      }
    }
  }

  ngOnInit(): void {
    console.log("PongGameComponent initialized with players:", this.leftPlayerName, this.rightPlayerName);
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.ctx = this.pongCanvas.nativeElement.getContext('2d');
        if (this.ctx) {
          this.initializeGame();
          this.startGame();  // Asegúrate de que este método se está llamando
        } else {
          console.error("Failed to retrieve the canvas context.");
        }
      }, 0);
    }
  }  

  initializeGame(): void {
    this.gameEnded = false; // Resetea el estado del juego
    this.leftPaddle = new Paddle(10, this.pongCanvas.nativeElement.height / 2 - this.paddleHeight / 2, this.paddleWidth, this.paddleHeight);;
    this.rightPaddle = new Paddle(this.pongCanvas.nativeElement.width - 10  - this.paddleWidth, this.pongCanvas.nativeElement.height / 2 - this.paddleHeight / 2, this.paddleWidth, this.paddleHeight);
    this.ball = new Ball(this.pongCanvas.nativeElement.width, this.pongCanvas.nativeElement.height);
  
    this.isGameInitialized = true; // Marcar el juego como inicializado
  }

  startGame(): void {
    if (this.isGameInitialized && this.ctx) {
      window.addEventListener('keydown', this.keyHandler.bind(this));
      window.addEventListener('keyup', this.keyHandler.bind(this));
      requestAnimationFrame(this.draw.bind(this)); // Asegúrate de que se llama a draw
    }
  }  

  keyHandler(event: KeyboardEvent): void {
    const isKeyDown = event.type === 'keydown';  // Detect if the event is keydown or keyup
    switch (event.key) {
      case 'w':
        this.leftPaddleUp = isKeyDown;
        break;
      case 's':
        this.leftPaddleDown = isKeyDown;
        break;
      case 'ArrowUp':
        event.preventDefault();  // Prevent default scroll behavior
        this.rightPaddleUp = isKeyDown;
        break;
      case 'ArrowDown':
        event.preventDefault();  // Prevent default scroll behavior
        this.rightPaddleDown = isKeyDown;
        break;
    }
  }

  draw(): void {
    if (!this.ctx || !this.pongCanvas || this.gameEnded) {
      return;
    }

    // Clear the canvas
    this.ctx.clearRect(0, 0, this.pongCanvas.nativeElement.width, this.pongCanvas.nativeElement.height);

    // Draw the ball
    this.ctx.beginPath();
    this.ctx.arc(this.ball!.getX(), this.ball!.getY(), this.ball!.getRadius(), 0, Math.PI * 2);
    this.ctx.fillStyle = '#FFFFFF'; // Color de la pelota
    this.ctx.fill();
    this.ctx.closePath();

    // Draw the left paddle
    this.ctx.beginPath();
    this.ctx.rect(this.leftPaddle!.getX(), this.leftPaddle!.getY(), this.paddleWidth, this.paddleHeight);
    this.ctx.fillStyle = '#FFFFFF'; // Color de la pala izquierda
    this.ctx.fill();
    this.ctx.closePath();

    // Draw the right paddle
    this.ctx.beginPath();
    this.ctx.rect(this.rightPaddle!.getX(), this.rightPaddle!.getY(), this.paddleWidth, this.paddleHeight);
    this.ctx.fillStyle = '#FFFFFF'; // Color de la pala derecha
    this.ctx.fill();
    this.ctx.closePath();

    // Ball movement
    this.ball?.move();
    this.ball?.calculateCollisions(this.pongCanvas.nativeElement.height, this.leftPaddle!, this.rightPaddle!);


    // Score logic: when the ball passes the paddle on either side
    switch (this.ball!.checkGoal(this.pongCanvas.nativeElement.width))
    {
      case 1:
        this.rightPlayerScore++;
        this.updateScoreDisplay(); // Update display immediately after scoring
        this.resetBall();
        break;
      case 2:
        this.leftPlayerScore++;
        this.updateScoreDisplay(); // Update display immediately after scoring
        this.resetBall();
        break;
    }

    // Check if game has ended
    if (this.leftPlayerScore >= this.winningScore || this.rightPlayerScore >= this.winningScore) {
      this.gameEnded = true;
      this.displayWinner();
      return; // Stop drawing further
    }

    // Paddle movement
    if (this.leftPaddleUp && this.leftPaddle!.getY() > 0) {
      this.leftPaddle!.moveUp();
    }
    if (this.leftPaddleDown && this.leftPaddle!.getY() < this.pongCanvas.nativeElement.height - this.leftPaddle!.getHeight()) {
      this.leftPaddle?.moveDown();
    }
    if (this.rightPaddleUp && this.rightPaddle!.getY() > 0) {
      this.rightPaddle?.moveUp();
    }
    if (this.rightPaddleDown && this.rightPaddle!.getY() < this.pongCanvas.nativeElement.height - this.rightPaddle!.getHeight()) {
      this.rightPaddle?.moveDown();
    }

    requestAnimationFrame(this.draw.bind(this));
  }

  resetBall(): void {
    this.ball = new Ball(this.pongCanvas.nativeElement.width / 2, this.pongCanvas.nativeElement.height / 2);
  }

  updateScoreDisplay(): void {
    const leftScoreElement = document.getElementById('leftScore');
    const rightScoreElement = document.getElementById('rightScore');

    if (leftScoreElement) {
      leftScoreElement.innerText = `${this.leftPlayerScore}`;
    }
    if (rightScoreElement) {
      rightScoreElement.innerText = `${this.rightPlayerScore}`;
    }
  }

  displayWinner(): void {
    if (this.ctx) {
        this.ctx.clearRect(0, 0, this.pongCanvas.nativeElement.width, this.pongCanvas.nativeElement.height);
        this.ctx.font = '30px Arial';
        this.ctx.fillStyle = '#FFFFFF';

        const winnerName = this.leftPlayerScore >= this.winningScore ? this.leftPlayerName : this.rightPlayerName;
        const winnerMessage = `${winnerName} wins!`;

        const textWidth = this.ctx.measureText(winnerMessage).width;
        const xPosition = (this.pongCanvas.nativeElement.width - textWidth) / 2;
        const yPosition = this.pongCanvas.nativeElement.height / 2;

        this.ctx.fillText(winnerMessage, xPosition, yPosition);

        // Get authentication status from the players object passed through navigation
        const isAuthenticated = this.players?.isAuthenticated || {
            player1: false,
            player2: false
        };

        this.http.post('http://localhost:8000/accounts/matches/', {
            player1_username: this.leftPlayerName,
            player2_username: this.rightPlayerName,
            player1_score: this.leftPlayerScore,
            player2_score: this.rightPlayerScore,
            winner_username: winnerName,
            match_type: this.isTournamentMatch ? 'tournament' : 'local',
            isAuthenticated: isAuthenticated
        }).subscribe({
            next: (response) => console.log('Match processed successfully:', response),
            error: (error) => console.error('Error processing match:', error)
        });

        if (this.isTournamentMatch) {
            setTimeout(() => {
                const navigationExtras: NavigationExtras = {
                    state: {
                        winner: winnerName,
                        leftScore: this.leftPlayerScore,
                        rightScore: this.rightPlayerScore
                    }
                };
                this.router.navigate(['/tournament'], navigationExtras);
            }, 2000);
        }
    }
  }
}