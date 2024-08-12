const boardBackground = "forestgreen";
const paddle1Color = "darkBlue";
const paddle2Color = "red";
const ballColor = "yellow";
const borderColor = "black";
const ballRadius = 12.5;
const paddleSpeed = 5;
const paddleWidth = 25;
const paddleHeight = 100;


let intervalID;
let ballSpeed = 1;
let ballTouches = 0;
let ballX;
let ballY;
let ballXDirection = 0;
let ballYDirection = 0;
let player1Score = 0;
let player2Score = 0;

let canvasVars = {};

let paddle1 = 
{
	witdth: paddleWidth,
	height: paddleHeight, 
	x: 0,
	y: 0
};

let paddle2 = 
{
	witdth: paddleWidth,
	height: paddleHeight,


};

var keyState = 
{
	down: {upArrow: false, downArrow: false, keyW: false, keyS: false}, //True if key is down
	toggle: {upArrow: false, downArrow: false, keyW: false, keyS: false}, //toogles on key up
	changed: {upArrow: false, downArrow: false, keyW: false, keyS: false} //True if key state changes. Does not set back false or you will lose a change
};

window.addEventListener("keydown", keyHandler);
window.addEventListener("keyup", keyHandler);
// resetButton.addEventListener("click", resetGame);

export function gameStart(canvas)
{
	canvasVars.gameBoard = document.querySelector("#gameBoard");
	canvasVars.ctx = canvasVars.gameBoard.getContext("2d");
	canvasVars.gameWidth = canvasVars.gameBoard.width;
	canvasVars.gameHeight = canvasVars.gameBoard.height;
	ballX = canvasVars.gameWidth / 2;
	ballY = canvasVars.gameHeight / 2;
	paddle2.x = canvasVars.gameWidth - paddleWidth;
	paddle2.y = canvasVars.gameHeight - paddleHeight;
	createBall();
	nextTick();
};

function nextTick()
{
	//this makes that everytime it gets a timeout it will execute the functions in that scope.
	// This way we can "simulate frames" and refresh the screen using that
	intervalID = setTimeout(() =>
	{
		paintBackground();
		drawPaddles();
		drawBall();
		movePaddles();
		moveBall();
		checkCollision();
		// if (user1Score == goalScore || user2Score == goalScore)
		//     endGame();
		// else
			nextTick();
	}, 10)
};
function paintBackground()
{
	canvasVars.ctx.fillStyle = boardBackground;
	canvasVars.ctx.fillRect(0, 0, canvasVars.gameWidth, canvasVars.gameHeight);
	canvasVars.ctx.fillStyle = "white";
	canvasVars.ctx.fillRect(0, 50, canvasVars.gameWidth, 10);
	canvasVars.ctx.fillRect(0 , canvasVars.gameHeight - 60 , canvasVars.gameWidth, 10);
	canvasVars.ctx.fillRect(125, 50, 10, canvasVars.gameHeight - 100);
	canvasVars.ctx.fillRect(canvasVars.gameWidth - 125, 50, 10, canvasVars.gameHeight - 100);
	canvasVars.ctx.fillRect(125, canvasVars.gameWidth / 2, canvasVars.gameWidth / 2, 10);
};
function drawPaddles(){
	canvasVars.ctx.strokeStyle = borderColor;
	
	canvasVars.ctx.fillStyle = paddle1Color;
	canvasVars.ctx.fillRect(paddle1.x, paddle1.y, paddle1.witdth, paddle1.height);
	canvasVars.ctx.strokeRect(paddle1.x, paddle1.y, paddle1.witdth, paddle1.height);

	canvasVars.ctx.fillStyle = paddle2Color;
	canvasVars.ctx.fillRect(paddle2.x, paddle2.y, paddle2.witdth, paddle2.height);
	canvasVars.ctx.strokeRect(paddle2.x, paddle2.y, paddle2.witdth, paddle2.height);
};
function createBall()
{
	ballSpeed = 1;
	if (Math.round(Math.random()) == 0)
		ballXDirection = 1;
	else
		ballXDirection = -1;
	if (Math.round(Math.random()) == 0)
		ballYDirection = 1;
	else
		ballYDirection = -1;
	ballX = canvasVars.gameWidth / 2;
	ballY = canvasVars.gameHeight / 2;
	ballTouches = 0;
};

function drawBall()
{

	canvasVars.ctx.fillStyle = ballColor;
	canvasVars.ctx.strokeStyle = borderColor;
	canvasVars.ctx.lineWidth = 2;
	canvasVars.ctx.beginPath();
	canvasVars.ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
	canvasVars.ctx.stroke();
	canvasVars.ctx.fill();
};

function moveBall()
{
	ballX += ballSpeed * ballXDirection;
	ballY += ballSpeed * ballYDirection;
};

function checkCollision()
{
	if (ballY <= 0 + ballRadius)
		ballYDirection *= -1;
	else if (ballY >= canvasVars.gameHeight - ballRadius)
		ballYDirection *= -1;
	
	if (ballX <= paddle1.x + paddleWidth + ballRadius
		&& ballY >= paddle1.y && ballY <= paddle1.y + paddleHeight) //hit in the left paddle
	{
		if (ballXDirection == -1)
		{
			ballXDirection *= -1;
			ballTouches += 1;
		}
	}
	else if (ballX >= paddle2.x - paddleWidth + ballRadius
		&& ballY >= paddle2.y && ballY <= paddle2.y + paddleHeight) //hit in the right paddle
	{
		if (ballXDirection == 1)
		{
			ballXDirection *= -1;
			ballTouches += 1;
		}
	}
	else if (ballX - ballRadius <= 0 && ballXDirection == -1)
	{
		player2Score += 1;
		// updateScore();
		createBall();
	}
	else if (ballX + ballRadius >= canvasVars.gameWidth && ballXDirection == 1)
	{
		player1Score += 1;
		// updateScore();
		createBall();
	}
	if (ballTouches > 2)
	{
		ballSpeed += 1;
		ballTouches = 0;
	}
};

function keyHandler(event)
{
	console.log(event.code)
	switch (event.code)
	{
		case "KeyW":
			console.log("hello from KeyW handling");
			console.log(event.type)
			if (event.type == "keydown")
			{
				console.log("keydown event type")
				if (keyState.down.keyW)
				{
					keyState.changed.keyW = false;
					console.log("key w change off down on toogle off");
				}
				else
				{
					console.log("key w change on down on toogle off");
					keyState.down.keyW = true;
					keyState.changed.keyW = true;
					keyState.toggle.keyW = false;
				}
			}
			if (event.type == "keyup")
			{
				console.log("keyup event type");
				if (keyState.toggle.keyW)
				{
					keyState.changed.keyW = false;
					console.log("key w change off down off toogle on");
				}
				else
				{
					console.log("key w change on down off toogle on");
					keyState.down.keyW = false;
					keyState.changed.keyW = true;
					keyState.toggle.keyW = true;
				}
			}
			break;
		case "KeyS":
			if (event.type === "keydown")
			{
				if (keyState.down.keyS)
					keyState.changed.keyS = false;
				else
				{
					console.log("Hello from changing key s down state");
					keyState.down.keyS = true;
					keyState.changed.keyS = true;
					keyState.toggle.keyS = false;
				}
			}
			if (event.type === "keyup")
			{
				if (keyState.toggle.keyS)
					keyState.changed.keyS = false;
				else
				{
					keyState.down.keyS = false;
					keyState.changed.keyS = true;
					keyState.toggle.keyS = true;
				}
			}
			break;
		case "ArrowUp":
			if (event.type === "keydown")
			{
				if (keyState.down.upArrow)
					keyState.changed.upArrow = false;
				else
				{
					console.log("Hello from changing key s down state");
					keyState.down.upArrow = true;
					keyState.changed.upArrow = true;
					keyState.toggle.upArrow = false;
				}
			}
			if (event.type === "keyup")
			{
				if (keyState.toggle.upArrow)
					keyState.changed.upArrow = false;
				else
				{
					keyState.down.upArrow = false;
					keyState.changed.upArrow = true;
					keyState.toggle.upArrow = true;
				}
			}
			break;
		case "ArrowDown":
			if (event.type === "keydown")
			{
				if (keyState.down.downArrow)
					keyState.changed.downArrow = false;
				else
				{
					console.log("Hello from changing key s down state");
					keyState.down.downArrow = true;
					keyState.changed.downArrow = true;
					keyState.toggle.downArrow = false;
				}
			}
			if (event.type === "keyup")
			{
				if (keyState.toggle.downArrow)
					keyState.changed.downArrow = false;
				else
				{
					keyState.down.downArrow = false;
					keyState.changed.downArrow = true;
					keyState.toggle.downArrow = true;
				}
			}
			break;
	}
}

function movePaddles()
{
	//console.log("hello from move paddles");
	if (keyState.down.keyW)
	{
		if (paddle1.y > 0)
			paddle1.y -= paddleSpeed;
	}
	if (keyState.down.keyS)
	{
		if (paddle1.y + paddleHeight < canvasVars.gameHeight)
			paddle1.y += paddleSpeed;
	}
	if (keyState.down.upArrow)
	{
		if (paddle2.y > 0)
			paddle2.y -= paddleSpeed;
	}
	if (keyState.down.downArrow)
	{
		if (paddle2.y + paddleHeight < canvasVars.gameHeight)
					paddle2.y += paddleSpeed;	
	}	

};
// function updateScore()
// {
// 	scoreText.textContent = `${player1Score} : ${player2Score}`;
// };
// function resetGame()
// {
// 	ballSpeed = 1;
// 	ballTouches = 1;
// 	gameStart();
// };
