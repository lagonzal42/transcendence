const gameBoard = document.querySelector("#gameBoard");
const ctx = gameBoard.getContext("2d");
const scoreText = document.querySelector("#scoreText");
const resetButton = document.querySelector("#resetButton");
const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;
const boardBackground = "forestgreen";
const paddle1Color = "darkBlue";
const paddle2Color = "red";
const ballColor = "yellow";
const borderColor = "black";
const ballRadius = 12.5;
const paddleSpeed = 5;
const paddleWidth = 25;
const paddleHeight = 100;
const downArrow = 40;
const upArrow = 38;
const keyW = 87;
const keyS = 83;
let intervalID;
let ballSpeed = 1;
let ballTouches = 0;
let ballX = gameWidth / 2;
let ballY = gameHeight / 2;
let ballXDirection = 0;
let ballYDirection = 0;
let player1Score = 0;
let player2Score = 0;
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
	x: gameWidth - paddleWidth,
	y: gameHeight - paddleHeight
};

var keyState = 
{
	down: {upArrow: false, downArrow: false, keyW: false, keyS: false}, //True if key is down
	toggle: {upArrow: false, downArrow: false, keyW: false, keyS: false}, //toogles on key up
	changed: {upArrow: false, downArrow: false, keyW: false, keyS: false} //True if key state changes. Does not set back false or you will lose a change
};

window.addEventListener("keydown", keyHandler);
window.addEventListener("keyup", keyHandler);
resetButton.addEventListener("click", resetGame);

gameStart();
//drawPaddles();

function gameStart()
{
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
		drawBall(ballX, ballY);
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
	ctx.fillStyle = boardBackground;
	ctx.fillRect(0, 0, gameWidth, gameHeight);
	ctx.fillStyle = "white";
	ctx.fillRect(0, 50, gameWidth, 10);
	ctx.fillRect(0 , gameHeight - 60 , gameWidth, 10);
	ctx.fillRect(125, 50, 10, gameHeight - 100);
	ctx.fillRect(gameWidth - 125, 50, 10, gameHeight - 100);
	ctx.fillRect(125, gameWidth / 2, gameWidth / 2, 10);
};
function drawPaddles(){
	ctx.strokeStyle = borderColor;
	
	ctx.fillStyle = paddle1Color;
	ctx.fillRect(paddle1.x, paddle1.y, paddle1.witdth, paddle1.height);
	ctx.strokeRect(paddle1.x, paddle1.y, paddle1.witdth, paddle1.height);

	ctx.fillStyle = paddle2Color;
	console.log(paddle2.x)
	ctx.fillRect(paddle2.x, paddle2.y, paddle2.witdth, paddle2.height);
	ctx.strokeRect(paddle2.x, paddle2.y, paddle2.witdth, paddle2.height);
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
	ballX = gameWidth / 2;
	ballY = gameHeight / 2;
	ballTouches = 0;
};

function drawBall(ballX, ballY)
{

	ctx.fillStyle = ballColor;
	ctx.strokeStyle = borderColor;
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.fill();
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
	else if (ballY >= gameHeight - ballRadius)
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
		updateScore();
		createBall();
	}
	else if (ballX + ballRadius >= gameWidth && ballXDirection == 1)
	{
		player1Score += 1;
		updateScore();
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
		if (paddle1.y + paddleHeight < gameHeight)
			paddle1.y += paddleSpeed;
	}
	if (keyState.down.upArrow)
	{
		if (paddle2.y > 0)
			paddle2.y -= paddleSpeed;
	}
	if (keyState.down.downArrow)
	{
		if (paddle2.y + paddleHeight < gameHeight)
					paddle2.y += paddleSpeed;	
	}	

};
function updateScore()
{
	scoreText.textContent = `${player1Score} : ${player2Score}`;
};
function resetGame()
{
	ballSpeed = 1;
	ballTouches = 1;
	gameStart();
};
