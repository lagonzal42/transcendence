import { last } from 'rxjs';
import { PaddleComponent as Paddle } from '../paddle/paddle.component';
import { BallComponent } from './ball.component';

export class BallComponent4p extends BallComponent
{
    private lastTouch: number = 0;

    calculateCollisions4p(PaddleLeft: Paddle, PaddleRight: Paddle, PaddleUp: Paddle, PaddleDown: Paddle): void
    {
        
        let touch = this.calculatePaddleCollisions(PaddleLeft, PaddleRight);

        if (this.yPosition <= PaddleUp.getHeight() + PaddleUp.getY() + this.ballRadius)
        {
            if (this.xPosition >= PaddleUp.getX() && this.xPosition <= PaddleUp.getX() + PaddleUp.getWidth())
            {
            if (this.dy < 0)
            {
                this.calculateReboundAngle2(PaddleUp, -1);
                this.touches += 1;
                touch = 3;
            }
            }
        }
        if (this.yPosition >=  PaddleDown.getY() + this.ballRadius)
        {
            if (this.xPosition >= PaddleDown.getX() && this.xPosition <= PaddleDown.getX() + PaddleDown.getWidth())
            {
            if (this.dy > 0)
            {
                this.calculateReboundAngle2(PaddleUp, -1);
                this.touches += 1;
                touch = 4;
            }
            }
        }
        if (this.touches == 3)
        {
            this.speed += 1;
            this.touches = 0;
        }
        this.lastTouch = touch;
    }

    calculateReboundAngle2(Paddle: Paddle, factor: number): void
    {
        let relativeIntersectX = (Paddle.getX() + Paddle.getWidth() / 2) - this.xPosition;
        let normalizedRelativeIntersectionX = relativeIntersectX / (Paddle.getWidth() / 2);
        let bounceAngle = normalizedRelativeIntersectionX * Math.PI / 4;
        this.dx = factor * Math.cos(bounceAngle);
        this.dy = -Math.sin(bounceAngle);
    }

    getLastTouch(): number
    {
        return this.lastTouch;
    }
}