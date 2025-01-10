export class PaddleComponent {
	
	private xPosition: 		number;
	private yPosition:		number;
	private paddleHeight: number;
	private paddleWidth:  number;
	private paddleSpeed:  number;

	
	constructor(xPos: number, yPos: number, paddleWidth : number, paddleHeight : number)
	{
		this.xPosition = xPos;
		this.yPosition = yPos;
		this.paddleHeight = paddleHeight;
		this.paddleWidth = paddleWidth;
		this.paddleSpeed = 7;
	}

	rotatePaddle(): void
	{
		let swap = this.paddleHeight;
		this.paddleHeight = this.paddleWidth;
		this.paddleWidth = swap;
	}

	moveUp()
	{
		this.yPosition -= this.paddleSpeed;
	}

	moveDown()
	{
			this.yPosition += this.paddleSpeed;
	}

	moveLeft()
	{
			this.xPosition -= this.paddleSpeed;
	}

	moveRight()
	{
		this.xPosition += this.paddleSpeed;
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
