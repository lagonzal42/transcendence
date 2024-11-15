import { Component } from '@angular/core';
import { PaddleComponent as Paddle } from '../paddle/paddle.component';

@Component({
  selector: 'app-ball',
  standalone: true,
  imports: [],
  templateUrl: './ball.component.html',
  styleUrl: './ball.component.css'
})

export class BallComponent {
    
    private xPosition: number;
    private yPosition: number;
    private ballRadius: number;
    private dx: number;
    private dy: number;
    private touches: number;
    private speed: number;
    
    constructor(xPos: number, yPos: number)
    {
      this.xPosition = xPos;
      this.yPosition = yPos;
      this.ballRadius = 10;
      this.dx = this.getRandomNumber(-1, 1);
      this.dy = this.getRandomNumber(-1, 1);
      this.touches = 0;
      this.speed = 5;
    }

    getRandomNumber(min: number, max: number)
    {
      return Math.random() * (max - min) + min;
    }
    
    move()
    {
      this.xPosition += this.dx * this.speed;
      this.yPosition += this.dy * this.speed;
    }

    refreshPosition(xPos: number, yPos: number, dx: number, dy: number)
    {
      this.xPosition = xPos;
      this.yPosition = yPos;
      this.dx = dx;
      this.dy = dy;
    }
    
    calculateCollisions(canvasHeight: number, Paddle1: Paddle, Paddle2: Paddle)
    {
      if(this.yPosition >= canvasHeight - this.ballRadius || this.yPosition <= this.ballRadius) // colisiones arriba y abajo
        this.dy = -this.dy;
      
      this.calculatePaddleCollisions(Paddle1, Paddle2);
    }

    calculatePaddleCollisions(Paddle1: Paddle, Paddle2: Paddle)
    {
      if (this.dx < 0 && this.xPosition <= Paddle1.getWidth() + Paddle1.getX() + this.ballRadius
        && this.yPosition >= Paddle1.getY() && this.yPosition <= Paddle1.getY() + Paddle1.getHeight())
      {
            this.calculateReboundAngle(Paddle1);
            this.touches += 1;
      }
      else if (this.dx > 0 && this.xPosition >= Paddle2.getX() - this.ballRadius
        && this.yPosition >= Paddle2.getY() && this.yPosition <= Paddle2.getY() + Paddle2.getHeight())
      {
            this.calculateReboundAngle(Paddle2);
            this.touches += 1;
      }
      if (this.touches == 3)
      {
        this.speed += 1;
        this.touches = 0;
      }
    }

    calculateReboundAngle(Paddle: Paddle)
    {
      let relativeIntersectY = (Paddle.getY() + Paddle.getHeight() / 2) - this.yPosition;
      let normalizedRelativeIntersectionY = relativeIntersectY / (Paddle.getHeight() / 2);
      let bounceAngle = normalizedRelativeIntersectionY * Math.PI / 4;
      let factor = Paddle.getX() == 0 ? -1 : 1;
      this.dx = - Math.cos(bounceAngle) * factor;
      this.dy = 5 * Math.sin(bounceAngle);
    }

    getX()
    {
      return this.xPosition;
    }
    
    getY()
    {
      return this.yPosition;
    }
    
    draw(ctx: CanvasRenderingContext2D)
    {
      ctx.beginPath();
      ctx.arc(this.xPosition, this.yPosition, this.ballRadius, 0, Math.PI*2);
      ctx.fillStyle = "#000000";
      ctx.fill();
      ctx.closePath();
    }
}
