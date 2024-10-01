import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-pong-game',
  standalone: true,
  templateUrl: './pong-game.component.html',
  styleUrls: ['./pong-game.component.css']
})
export class PongGameComponent implements OnInit, AfterViewInit {
  @ViewChild('pongCanvas', { static: false }) pongCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D | null;
  private isGameInitialized: boolean = false;

  // Paddle settings
  private paddleHeight: number = 75;
  private paddleWidth: number = 10;
  private leftPaddleY: number = 0;
  private rightPaddleY: number = 0;
  private paddleSpeed: number = 7;

  // Ball settings
  private ballRadius: number = 10;
  private x: number = 0;
  private y: number = 0;
  private dx: number = 2;
  private dy: number = -2;

  // Score
  private leftPlayerScore: number = 0;
  private rightPlayerScore: number = 0;
  private winningScore: number = 3;
  private gameEnded: boolean = false;

  // Paddle movement flags
  private leftPaddleUp: boolean = false;
  private leftPaddleDown: boolean = false;
  private rightPaddleUp: boolean = false;
  private rightPaddleDown: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.ctx = null;
  }

  ngOnInit(): void {
    console.log("PongGameComponent initialized.");
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.ctx = this.pongCanvas.nativeElement.getContext('2d');
        if (this.ctx) {
          console.log("Canvas successfully retrieved.", this.pongCanvas.nativeElement);
          this.initializeGame();
        } else {
          console.error("Failed to retrieve the canvas context.");
        }
      }, 0);
    }
  }

  initializeGame(): void {
    this.x = this.pongCanvas.nativeElement.width / 2;
    this.y = this.pongCanvas.nativeElement.height / 2;

    this.leftPaddleY = (this.pongCanvas.nativeElement.height - this.paddleHeight) / 2;
    this.rightPaddleY = (this.pongCanvas.nativeElement.height - this.paddleHeight) / 2;

    this.isGameInitialized = true;
    this.startGame();
  }

  startGame(): void {
    if (this.isGameInitialized && this.ctx) {
      window.addEventListener('keydown', this.keyHandler.bind(this));
      window.addEventListener('keyup', this.keyHandler.bind(this));
      requestAnimationFrame(this.draw.bind(this));
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
    this.ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#FFFFFF'; // Color de la pelota
    this.ctx.fill();
    this.ctx.closePath();

    // Draw the left paddle
    this.ctx.beginPath();
    this.ctx.rect(10, this.leftPaddleY, this.paddleWidth, this.paddleHeight);
    this.ctx.fillStyle = '#FFFFFF'; // Color de la pala izquierda
    this.ctx.fill();
    this.ctx.closePath();

    // Draw the right paddle
    this.ctx.beginPath();
    this.ctx.rect(this.pongCanvas.nativeElement.width - this.paddleWidth - 10, this.rightPaddleY, this.paddleWidth, this.paddleHeight);
    this.ctx.fillStyle = '#FFFFFF'; // Color de la pala derecha
    this.ctx.fill();
    this.ctx.closePath();

    // Ball movement
    this.x += this.dx;
    this.y += this.dy;

    // Collision detection (borders)
    if (this.y + this.dy > this.pongCanvas.nativeElement.height - this.ballRadius || this.y + this.dy < this.ballRadius) {
      this.dy = -this.dy;
    }

    // Collision with paddles
    if (this.x - this.ballRadius < 20 + this.paddleWidth && this.y > this.leftPaddleY && this.y < this.leftPaddleY + this.paddleHeight) {
      this.dx = -this.dx;
    } else if (this.x + this.ballRadius > this.pongCanvas.nativeElement.width - 20 - this.paddleWidth && this.y > this.rightPaddleY && this.y < this.rightPaddleY + this.paddleHeight) {
      this.dx = -this.dx;
    }

    // Score logic: when the ball passes the paddle on either side
    if (this.x - this.ballRadius < 0) {
      this.rightPlayerScore++;
      this.updateScoreDisplay(); // Update display immediately after scoring
      this.resetBall();
    } else if (this.x + this.ballRadius > this.pongCanvas.nativeElement.width) {
      this.leftPlayerScore++;
      this.updateScoreDisplay(); // Update display immediately after scoring
      this.resetBall();
    }

    // Check if game has ended
    if (this.leftPlayerScore >= this.winningScore || this.rightPlayerScore >= this.winningScore) {
      this.gameEnded = true;
      this.displayWinner();
      return; // Stop drawing further
    }

    // Paddle movement
    if (this.leftPaddleUp && this.leftPaddleY > 0) {
      this.leftPaddleY -= this.paddleSpeed;
    }
    if (this.leftPaddleDown && this.leftPaddleY < this.pongCanvas.nativeElement.height - this.paddleHeight) {
      this.leftPaddleY += this.paddleSpeed;
    }
    if (this.rightPaddleUp && this.rightPaddleY > 0) {
      this.rightPaddleY -= this.paddleSpeed;
    }
    if (this.rightPaddleDown && this.rightPaddleY < this.pongCanvas.nativeElement.height - this.paddleHeight) {
      this.rightPaddleY += this.paddleSpeed;
    }

    requestAnimationFrame(this.draw.bind(this));
  }

  resetBall(): void {
    this.x = this.pongCanvas.nativeElement.width / 2;
    this.y = this.pongCanvas.nativeElement.height / 2;
    this.dx = 2 * (Math.random() < 0.5 ? 1 : -1); // Randomize direction
    this.dy = 2 * (Math.random() < 0.5 ? 1 : -1); // Randomize direction
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

      if (this.leftPlayerScore >= this.winningScore) {
        this.ctx.fillText('Left Player Wins with ' + this.leftPlayerScore + ' points!', this.pongCanvas.nativeElement.width / 2 - 160, this.pongCanvas.nativeElement.height / 2);
      } else {
        this.ctx.fillText('Right Player Wins with ' + this.rightPlayerScore + ' points!', this.pongCanvas.nativeElement.width / 2 - 170, this.pongCanvas.nativeElement.height / 2);
      }
    }
  }
}
