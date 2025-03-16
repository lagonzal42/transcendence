import { last } from 'rxjs';
import { PaddleComponent as Paddle } from '../paddle/paddle.component';
import { BallComponent } from './ball.component';

export class BallComponent4p extends BallComponent
{

    constructor(xPos: number, yPos: number)
    {
        super(xPos, yPos);
        this.speed = 5;
        let ranNum = this.getRandomNumber(0, 2 * Math.PI);
        let ranNum2 = this.getRandomNumber(0, 2 * Math.PI);
        let ranNumD= this.getRandomNumber(0, 1);
        this.dx = Math.cos(ranNumD? ranNum : ranNum2);
        this.dy = Math.sin(ranNumD? ranNum : ranNum2);
    }

    calculateCollisions4p(PaddleLeft: Paddle, PaddleRight: Paddle, PaddleUp: Paddle, PaddleDown: Paddle): void
    {
        
        this.calculatePaddleCollisions(PaddleLeft, PaddleRight);

        if (this.yPosition <= PaddleUp.getY() + PaddleUp.getHeight() + 10)
        {
            if (this.xPosition >= PaddleUp.getX() && this.xPosition <= PaddleUp.getX() + PaddleUp.getWidth())
            {
                if (this.dy < 0)
                {
                    this.calculateReboundAngleHorizontal(PaddleUp, 1);
                    this.touches += 1;
                    console.log('last Touch to 3');
                    this.lastTouch = 3;
                    console.log(this.lastTouch)
                }
            }
        }
        if (this.yPosition >=  PaddleDown.getY() - PaddleDown.getHeight())
        {
            
            if (this.xPosition >= PaddleDown.getX() && this.xPosition <= PaddleDown.getX() + PaddleDown.getWidth())
            {
                if (this.dy > 0)
                {
                    this.calculateReboundAngleHorizontal(PaddleDown, -1);
                    this.touches += 1;
                    console.log('last Touch to 4');
                    this.lastTouch = 4;
                    console.log(this.lastTouch)
                }
            }
        }
        if (this.touches == 3)
        {
            this.speed += 1;
            this.touches = 0;
        }
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
        let relativeIntersectX = this.xPosition - (Paddle.getX() + Paddle.getWidth() / 2);
        let normalizedIntersection = relativeIntersectX / (Paddle.getWidth() / 2);
        let bounceAngle = normalizedIntersection * Math.PI / 4;
        
        this.dx = Math.sin(bounceAngle);
        this.dy = Math.cos(bounceAngle) * factor;
    }

    getLastTouch(): number
    {
        return this.lastTouch;
    }
}