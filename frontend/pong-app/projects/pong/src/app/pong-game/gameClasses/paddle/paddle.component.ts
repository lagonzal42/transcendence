import { Component } from '@angular/core';

@Component({
	selector: 'app-paddle',
	standalone: true,
	imports: [],
	templateUrl: './paddle.component.html',
	styleUrl: './paddle.component.css'
})
export class PaddleComponent {
	
	private xPosition: 		number;
	private yPosition:		number;
	private paddleHeight: number;
	private paddleWidth:  number;
	private paddleSpeed:  number;

	
	constructor(xPos: number, yPos: number)
	{
		this.xPosition = xPos;
		this.yPosition = yPos;
		this.paddleHeight = 75;
		this.paddleWidth = 10;
		this.paddleSpeed = 7;
	}

	moveUp()
	{
		if (this.yPosition > 0)
		this.yPosition -= this.paddleSpeed;
	}

	moveDown()
	{
		if (this.yPosition < 500 - this.paddleHeight)
			this.yPosition += this.paddleSpeed;
	}

	refreshPosition(xPos: number, yPos: number)
	{
		this.xPosition = xPos;
		this.yPosition = yPos;
	}

	getX()
	{
		return this.xPosition;
	}

	getY()
	{
		return this.yPosition;
	}
	
	getWidth()
	{
		return this.paddleWidth;
	}

	getHeight()
	{
		return this.paddleHeight;
	}

	draw(ctx: CanvasRenderingContext2D)
	{
		ctx.fillStyle = "#000000";
		ctx.fillRect(this.xPosition, this.yPosition, this.paddleWidth, this.paddleHeight);
	}
}
