import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PaddleComponent as Paddle } from "../gameClasses/paddle/paddle.component"
import { BallComponent4p as Ball } from '../gameClasses/ball/ball4p.component';

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
  canvasSize: number = 400;

  // Nombres de los jugadores
  public leftPlayerName: string = '';
  public rightPlayerName: string = '';

  // Paddle settings
  private paddleHeight: number = 75;
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
  private winningScore: number = 3;
  private gameEnded: boolean = false;

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

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router, private ngZone: NgZone) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const players = navigation.extras.state['players'];
      if (players) {
        this.leftPlayerName = players.leftPlayerName;
        this.rightPlayerName = players.rightPlayerName;
        
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
    this.leftPaddle = new Paddle(10, this.pongCanvas.nativeElement.height / 2 - this.paddleHeight / 2);;
    this.rightPaddle = new Paddle(this.pongCanvas.nativeElement.width - 10  - this.paddleWidth, this.pongCanvas.nativeElement.height / 2 - this.paddleHeight / 2);
    this.upPaddle = new Paddle(this.pongCanvas.nativeElement.width / 2 - this.paddleWidth / 2, 10);
    this.downPaddle = new Paddle(this.pongCanvas.nativeElement.width / 2 - this.paddleHeight / 2, this.pongCanvas.nativeElement.height - 10 - this.paddleWidth);
    this.ball1 = new Ball(this.pongCanvas.nativeElement.width / 2, this.pongCanvas.nativeElement.height / 2);
    this.ball2 = new Ball(this.pongCanvas.nativeElement.width / 2, this.pongCanvas.nativeElement.height / 2);
    this.ball1.setSpeed(5);
    this.ball2.setSpeed(5);

  
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
    this.ctx.rect(this.leftPaddle!.getX(), this.leftPaddle!.getY(), this.paddleWidth, this.paddleHeight);
    this.ctx.fillStyle = '#FFFFFF'; // Color de la pala izquierda
    this.ctx.fill();
    this.ctx.closePath();

    // // Draw the right paddle
     this.ctx.beginPath();
    this.ctx.rect(this.rightPaddle!.getX(), this.rightPaddle!.getY(), this.paddleWidth, this.paddleHeight);
    this.ctx.fillStyle = '#FFFFFF'; // Color de la pala derecha
    this.ctx.fill();
    this.ctx.closePath();

    // // Draw the upper paddle
    this.ctx.beginPath();
    this.ctx.rect(this.upPaddle!.getX(), this.upPaddle!.getY(), this.paddleHeight, this.paddleWidth);
    this.ctx.fillStyle = '#FFFFFF'; // Color de la pala izquierda
    this.ctx.fill();
    this.ctx.closePath();

    // // Draw the bottom paddle
    this.ctx.beginPath();
    this.ctx.rect(this.downPaddle!.getX(), this.downPaddle!.getY(), this.paddleHeight, this.paddleWidth);
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
      //this.displayWinner();
      return; // Stop drawing further
    }

    if (this.leftPaddleUp && this.leftPaddle!.getY() > 0 + 10 + this.paddleWidth)
      this.leftPaddle!.moveUp();
    if (this.leftPaddleDown && this.leftPaddle!.getY() < this.pongCanvas.nativeElement.height - this.leftPaddle!.getHeight())
      this.leftPaddle?.moveDown();
    if (this.rightPaddleUp && this.rightPaddle!.getY() > 0)
      this.rightPaddle?.moveUp();
    if (this.rightPaddleDown && this.rightPaddle!.getY() < this.pongCanvas.nativeElement.height - this.rightPaddle!.getHeight())
      this.rightPaddle?.moveDown();
    if (this.upPaddleLeft && this.upPaddle!.getX() > 0 + 10 + this.paddleWidth)
      this.upPaddle?.moveLeft();
    if (this.upPaddleRight && this.upPaddle!.getX() < this.pongCanvas.nativeElement.width - this.paddleHeight)
      this.upPaddle?.moveRight();
    if (this.downPaddleLeft && this.downPaddle!.getX() > 0)
      this.downPaddle?.moveLeft();
    if (this.downPaddleRight && this.downPaddle!.getX() < this.pongCanvas.nativeElement.width - this.paddleHeight)
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
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.pongCanvas.nativeElement.width, this.pongCanvas.nativeElement.height);
      this.ctx.font = '30px Arial';
      this.ctx.fillStyle = '#FFFFFF';

      let winningPlayers: string[] = [];
      if (this.leftPlayerScore >= this.winningScore) {
        winningPlayers.push(this.leftPlayerName);
      }
      if (this.rightPlayerScore >= this.winningScore) {
        winningPlayers.push(this.rightPlayerName);
      }
      // if (this.upPlayerScore >= this.winningScore) {
      //   winningPlayers.push(this.upPlayerName);
      // }
      // if (this.downPlayerScore >= this.winningScore) {
      //   winningPlayers.push(this.downPlayerName);
      // }

      const winnerMessage = `${winningPlayers.join(" and ")} wins!`;

      const textWidth = this.ctx.measureText(winnerMessage).width;
      const xPosition = (this.pongCanvas.nativeElement.width - textWidth) / 2;
      const yPosition = this.pongCanvas.nativeElement.height / 2;

      this.ctx.fillText(winnerMessage, xPosition, yPosition);
    }
  }
}
