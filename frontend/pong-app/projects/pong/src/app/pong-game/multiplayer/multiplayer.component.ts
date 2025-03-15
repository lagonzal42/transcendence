import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PaddleComponent as Paddle } from "../gameClasses/paddle/paddle.component"
import { BallComponent4p as Ball } from '../gameClasses/ball/ball4p.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-pong-game',
  standalone: true,
  imports: [],
  templateUrl: 'multiplayer.component.html',
  styleUrl: './multiplayer.component.css'
})
export class MultiplayerComponent implements OnInit, AfterViewInit{
  @ViewChild('pongCanvas', { static: false }) pongCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D | null;
  public isGameInitialized: boolean = false;
  canvasSize: number = 600;


  // Nombres de los jugadores
  public leftPlayerName: string = '';
  public rightPlayerName: string = '';
  public upPlayerName: string = '';
  public downPlayerName: string = '';

  // Paddle settings
  private paddleHeight: number = 120;
  private paddleWidth: number = 10;
  private leftPaddle?: Paddle;
  private rightPaddle?: Paddle;
  private upPaddle?: Paddle;
  private downPaddle?: Paddle;

  // Ball settings
  private ball1? : Ball;
  private ball2? : Ball;

  // Score
  public leftPlayerScore: number = -1;
  public rightPlayerScore: number = 0;
  public upPlayerScore: number = 0;
  public downPlayerScore: number = 0;
  private winningScore: number = 10;
  public gameEnded: boolean = false;

  // Paddle movement flags
  private leftPaddleUp: boolean = false;
  private leftPaddleDown: boolean = false;
  private rightPaddleUp: boolean = false;
  private rightPaddleDown: boolean = false;
  private upPaddleLeft: boolean = false;
  private upPaddleRight: boolean = false;
  private downPaddleLeft: boolean = false;
  private downPaddleRight: boolean = false;
  

  // Point status
  private pointStatus = {upGoal : false, downGoal : false, leftGoal : false, rightGoal : false};

  // Authentication status
  private playersAuthenticated: { player1: boolean; player2: boolean; player3: boolean; player4: boolean } = { player1: false, player2: false, player3: false, player4: false };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, 
    private router: Router, 
    private ngZone: NgZone,
    private http: HttpClient
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const players = navigation.extras.state['players'];
      if (players) {
        this.leftPlayerName = players.player1Name;
        this.rightPlayerName = players.player2Name;
        this.upPlayerName = players.player3Name;
        this.downPlayerName = players.player4Name;
        console.log("up: " + this.upPlayerName + " down: " + this.downPlayerName + " left: " + this.leftPlayerName + " right: " + this.rightPlayerName);
        
        // Store authentication status
        this.playersAuthenticated = {
          player1: players.isAuthenticated?.player1 || false,
          player2: players.isAuthenticated?.player2 || false,
          player3: players.isAuthenticated?.player3 || false,
          player4: players.isAuthenticated?.player4 || false
        };
      }
    }
  }

  ngOnInit(): void {
    console.log("PongGameComponent initialized with players:", this.leftPlayerName, this.rightPlayerName);
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
    	this.ngZone.runOutsideAngular(() => {
        	setTimeout(() => {
          		this.ctx = this.pongCanvas.nativeElement.getContext('2d');
				if (this.ctx) 
				{
					this.initializeGame();
					this.startGame();  // Asegúrate de que este método se está llamando
				} 
				else
					console.error("Failed to retrieve the canvas context.");
        	}, 0);
    	});
    }
  }  

  initializeGame(): void {
    this.gameEnded = false; // Resetea el estado del juego
    this.leftPaddle = new Paddle(10, this.pongCanvas.nativeElement.height / 2 - this.paddleHeight / 2, this.paddleWidth, this.paddleHeight);
    this.rightPaddle = new Paddle(this.pongCanvas.nativeElement.width - 10  - this.paddleWidth, this.pongCanvas.nativeElement.height / 2 - this.paddleHeight / 2, this.paddleWidth, this.paddleHeight);
    this.upPaddle = new Paddle(this.pongCanvas.nativeElement.width / 2 - this.paddleWidth / 2, 10, this.paddleWidth, this.paddleHeight);
    this.upPaddle.rotatePaddle();
    this.downPaddle = new Paddle(this.pongCanvas.nativeElement.width / 2 - this.paddleHeight / 2, this.pongCanvas.nativeElement.height - 10 - this.paddleWidth, this.paddleWidth, this.paddleHeight);
    this.downPaddle.rotatePaddle();
    this.ball1 = new Ball(this.pongCanvas.nativeElement.width / 2, this.pongCanvas.nativeElement.height / 2);
    this.ball2 = new Ball(this.pongCanvas.nativeElement.width / 2, this.pongCanvas.nativeElement.height / 2);
    this.ball1.setSpeed(5);
    this.ball2.setSpeed(5);

    console.log('canvasHeight ' + this.pongCanvas.nativeElement.height + ' canvasWidth: ' + this.pongCanvas.nativeElement.width)

  
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
      case 'q':
        this.leftPaddleUp = isKeyDown;
        break;
      case 'a':
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
      case 'v':
        this.upPaddleLeft = isKeyDown;
        break;
      case 'b':
        this.upPaddleRight = isKeyDown;
        break;
      case 'o':
        this.downPaddleLeft = isKeyDown;
        break;
      case 'p':
        this.downPaddleRight = isKeyDown;
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
    this.ctx.arc(this.ball1!.getX(), this.ball1!.getY(), this.ball1!.getRadius(), 0, Math.PI * 2);
    this.ctx.fillStyle = '#FFFFFF'; // Color de la pelota
    this.ctx.fill();
    this.ctx.closePath();

    this.ctx.beginPath();
    this.ctx.arc(this.ball2!.getX(), this.ball2!.getY(), this.ball2!.getRadius(), 0, Math.PI * 2);
    this.ctx.fillStyle = '#FFFFFF'; // Color de la pelota
    this.ctx.fill();
    this.ctx.closePath();

    // Draw the left paddle
    this.ctx.beginPath();
    this.ctx.rect(this.leftPaddle!.getX(), this.leftPaddle!.getY(), this.leftPaddle!.getWidth(), this.leftPaddle!.getHeight());
    this.ctx.fillStyle = '#FFFFFF'; // Color de la pala izquierda
    this.ctx.fill();
    this.ctx.closePath();

    // // Draw the right paddle
     this.ctx.beginPath();
    this.ctx.rect(this.rightPaddle!.getX(), this.rightPaddle!.getY(),  this.rightPaddle!.getWidth(), this.rightPaddle!.getHeight());
    this.ctx.fillStyle = '#FFFFFF'; // Color de la pala derecha
    this.ctx.fill();
    this.ctx.closePath();

    // // Draw the upper paddle
    this.ctx.beginPath();
    this.ctx.rect(this.upPaddle!.getX(), this.upPaddle!.getY(),  this.upPaddle!.getWidth(), this.upPaddle!.getHeight());
    this.ctx.fillStyle = '#FFFFFF'; // Color de la pala izquierda
    this.ctx.fill();
    this.ctx.closePath();

    // // Draw the bottom paddle
    this.ctx.beginPath();
    this.ctx.rect(this.downPaddle!.getX(), this.downPaddle!.getY(), this.downPaddle!.getWidth(), this.downPaddle!.getHeight());
    this.ctx.fillStyle = '#FFFFFF'; // Color de la pala derecha
    this.ctx.fill();
    this.ctx.closePath();

    // Ball movement
    this.ball1?.move();
    this.ball1?.calculateCollisions4p(this.leftPaddle!, this.rightPaddle!, this.upPaddle!, this.downPaddle!);
    this.ball2?.move();
    this.ball2?.calculateCollisions4p(this.leftPaddle!, this.rightPaddle!, this.upPaddle!, this.downPaddle!);


    // Score logic: when the ball passes the paddle on either side
    if (this.ball1!.checkGoal4p(this.pongCanvas.nativeElement.width))
    {
      this.updateScoreDisplay(this.ball1!);
      this.resetBall(1);
    }
    if (this.ball2!.checkGoal4p(this.pongCanvas.nativeElement.width))
    {
      this.updateScoreDisplay(this.ball2!);
      this.resetBall(2);
    }

    // Check if game has ended
    if (this.leftPlayerScore >= this.winningScore || this.rightPlayerScore >= this.winningScore
        || this.upPlayerScore >= this.winningScore || this.downPlayerScore >= this.winningScore) 
    {
      this.gameEnded = true;
      this.displayWinner();
      return; // Stop drawing further
    }

    if (this.leftPaddleUp && this.leftPaddle!.getY() > 20)
      this.leftPaddle!.moveUp();
    if (this.leftPaddleDown && this.leftPaddle!.getY() < (this.pongCanvas.nativeElement.height - this.paddleHeight - 20))
      this.leftPaddle?.moveDown();
    if (this.rightPaddleUp && this.rightPaddle!.getY() > 20)
      this.rightPaddle?.moveUp();
    if (this.rightPaddleDown && this.rightPaddle!.getY() < this.pongCanvas.nativeElement.height - this.paddleHeight - 20)
      this.rightPaddle?.moveDown();
    if (this.upPaddleLeft && this.upPaddle!.getX() > 0 + 10 + this.paddleWidth)
      this.upPaddle?.moveLeft();
    if (this.upPaddleRight && this.upPaddle!.getX() < this.pongCanvas.nativeElement.width - this.paddleHeight - 20)
      this.upPaddle?.moveRight();
    if (this.downPaddleLeft && this.downPaddle!.getX() > 0)
      this.downPaddle?.moveLeft();
    if (this.downPaddleRight && this.downPaddle!.getX() < this.pongCanvas.nativeElement.width - this.paddleHeight - 20)
      this.downPaddle?.moveRight();
    requestAnimationFrame(this.draw.bind(this));
  }

  resetBall(ballNum: number): void {
    switch (ballNum) {
      case 1:
        this.ball1 = new Ball(this.pongCanvas.nativeElement.width / 2, this.pongCanvas.nativeElement.height / 2);
        this.ball1.setSpeed(5);
        break;
      case 2:
        this.ball2 = new Ball(this.pongCanvas.nativeElement.width / 2, this.pongCanvas.nativeElement.height / 2);
        this.ball2.setSpeed(5);
        break;
    }
  }

  updateScoreDisplay(ball: Ball): void {
    console.log(ball.getLastTouch() + ' is the last touch');
    switch (ball.getLastTouch())
    {
      case 1:
        this.leftPlayerScore += 1;
        break;
      case 2:
        this.rightPlayerScore += 1;
        break;
      case 3:
        this.upPlayerScore += 1;
        break;
      case 4:
        this.downPlayerScore += 1;
        break;
    }
  }

  displayWinner(): void {
    if (!this.ctx) return;
    this.gameEnded = true;
    
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.pongCanvas.nativeElement.width, this.pongCanvas.nativeElement.height);
    
    // Draw a semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.pongCanvas.nativeElement.width, this.pongCanvas.nativeElement.height);
    
    // Set text properties
    this.ctx.font = '40px Arial';
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'center';
    
    // Determine the winner
    let winnerName = '';
    if (this.leftPlayerScore >= this.winningScore) {
      winnerName = this.leftPlayerName;
    } else if (this.rightPlayerScore >= this.winningScore) {
      winnerName = this.rightPlayerName;
    } else if (this.upPlayerScore >= this.winningScore) {
      winnerName = this.upPlayerName;
    } else if (this.downPlayerScore >= this.winningScore) {
      winnerName = this.downPlayerName;
    }
    
    // Draw winner text
    this.ctx.fillText(
      `${winnerName} wins!`, 
      this.pongCanvas.nativeElement.width / 2, 
      this.pongCanvas.nativeElement.height / 2 - 40
    );
    
    // Draw score text
    this.ctx.font = '24px Arial';
    this.ctx.fillText(
      `${this.leftPlayerName}: ${this.leftPlayerScore} | ${this.rightPlayerName}: ${this.rightPlayerScore}`,
      this.pongCanvas.nativeElement.width / 2,
      this.pongCanvas.nativeElement.height / 2 + 20
    );
    
    if (this.upPlayerName && this.downPlayerName) {
      this.ctx.fillText(
        `${this.upPlayerName}: ${this.upPlayerScore} | ${this.downPlayerName}: ${this.downPlayerScore}`,
        this.pongCanvas.nativeElement.width / 2,
        this.pongCanvas.nativeElement.height / 2 + 60
      );
    }
    
    // Draw restart instruction
    this.ctx.font = '20px Arial';
    this.ctx.fillText(
      'Press SPACE to restart',
      this.pongCanvas.nativeElement.width / 2,
      this.pongCanvas.nativeElement.height / 2 + 120
    );
  }
}
