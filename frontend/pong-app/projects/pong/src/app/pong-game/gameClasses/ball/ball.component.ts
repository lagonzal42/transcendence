import { PaddleComponent as Paddle } from '../paddle/paddle.component';

export class BallComponent {
    
    protected xPosition: number;
    protected yPosition: number;
    protected ballRadius: number;
    protected dx: number;
    protected dy: number;
    protected touches: number;
    protected speed: number;
    
    constructor(xPos: number, yPos: number)
    {
      this.xPosition = xPos;
      this.yPosition = yPos;
      this.ballRadius = 10;
      this.dx = this.getRandomNumber(-0.5, 0.5);
      this.dy = this.getRandomNumber(-0.5, 0.5);
      this.touches = 0;
      this.speed = 100;
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

    calculatePaddleCollisions(Paddle1: Paddle, Paddle2: Paddle) : number
    {
      let retVal: number = 0;
      if (this.xPosition <= Paddle1.getWidth() + Paddle1.getX() + this.ballRadius)
      {
        if (this.yPosition >= Paddle1.getY() && this.yPosition <= Paddle1.getY() + Paddle1.getHeight())
        {
          if (this.dx < 0)
          {
            this.calculateReboundAngle(Paddle1, -1);
            this.touches += 1;
            retVal = 1;
          }
        }
      }
      else if (this.xPosition >= Paddle2.getX() - this.ballRadius)
      {
        if (this.yPosition >= Paddle2.getY() && this.yPosition <= Paddle2.getY() + Paddle2.getHeight())
        {
          if (this.dx > 0)
          {
            this.calculateReboundAngle(Paddle2, 1);
            this.touches += 1;
            retVal = 2;
          }
        }
      }
      if (this.touches == 3)
      {
        this.speed += 1;
        this.touches = 0;
      }
      return retVal;
    }

    calculateReboundAngle(Paddle: Paddle, factor: number)
    {
      let relativeIntersectY = this.yPosition - (Paddle.getY() + Paddle.getHeight() / 2);
      let normalizedRelativeIntersectionY = relativeIntersectY / (Paddle.getHeight() / 2);
      let bounceAngle = normalizedRelativeIntersectionY * Math.PI / 4;
      this.dx = -Math.cos(bounceAngle) * factor;
      this.dy = Math.sin(bounceAngle);
    }

    checkGoal(canvasWidth: number)
    {
      if (this.xPosition + this.ballRadius >= canvasWidth)
        return 2;
      else if( this.xPosition - this.ballRadius <= 0)
        return 1;
      return 0;
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

    speedUp(): void
    {
      this.speed++;
    }

    getRadius(): number
    {
      return(this.ballRadius);
    }
}
