import { last } from 'rxjs';
import { PaddleComponent as Paddle } from '../paddle/paddle.component';
import { BallComponent } from './ball.component';

export class BallComponent4p extends BallComponent
{
    private lastTouch: number = 0;

    calculateCollisions4p(PaddleLeft: Paddle, PaddleRight: Paddle, PaddleUp: Paddle, PaddleDown: Paddle): void
    {
        
        let touch = this.calculatePaddleCollisions(PaddleLeft, PaddleRight);

        if (this.yPosition <= PaddleUp.getY() + PaddleUp.getWidth())
        {
            if (this.xPosition >= PaddleUp.getX() && this.xPosition <= PaddleUp.getX() + PaddleUp.getHeight())
            {
                if (this.dy < 0)
                {
                    this.calculateReboundAngleHorizontal(PaddleUp, 1);
                    this.touches += 1;
                    touch = 3;
                }
            }
        }
        if (this.yPosition >=  PaddleDown.getY() - PaddleDown.getWidth())
        {
            
            if (this.xPosition >= PaddleDown.getX() && this.xPosition <= PaddleDown.getX() + PaddleDown.getHeight())
            {
                console.log("coollision with low paddle")
                if (this.dy > 0)
                {
                    this.calculateReboundAngleHorizontal(PaddleDown, -1);
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

    checkGoal4p(canvasWidth: number): boolean
    {
        if (this.xPosition + this.ballRadius >= canvasWidth || this.xPosition - this.ballRadius <= 0)
            return true;
        else if (this.yPosition + this.ballRadius >= canvasWidth || this.yPosition - this.ballRadius <= 0)
            return true;
        return false;
    }

    private calculateReboundAngleHorizontal(Paddle: Paddle, factor: number): void {
        // For horizontal paddles, we use x-position for the intersection
        let relativeIntersectX = this.xPosition - (Paddle.getX() + Paddle.getHeight() / 2);
        let normalizedIntersection = relativeIntersectX / (Paddle.getHeight() / 2);
        let bounceAngle = normalizedIntersection * Math.PI / 4;
        
        // Swap x and y components for horizontal paddles
        this.dx = Math.sin(bounceAngle);
        this.dy = Math.cos(bounceAngle) * factor;
    }

    getLastTouch(): number
    {
        return this.lastTouch;
    }
}