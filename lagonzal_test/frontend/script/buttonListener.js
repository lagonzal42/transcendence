import * as localGame from './localGame.js'

window.onload = function()
{
	document.getElementById('play-local').addEventListener('click', playLocalGame);
}


function playLocalGame()
{
	console.log("Clicked local game");
	document.getElementById('button-area').style.display = 'none';
	
	const canvas = document.createElement('canvas');
	canvas.id = 'gameBoard';

	canvas.width = 500;
	canvas.height = 500;

	const mainContainer = document.getElementById('main-container');
	mainContainer.appendChild(canvas);


	localGame.gameStart();
}