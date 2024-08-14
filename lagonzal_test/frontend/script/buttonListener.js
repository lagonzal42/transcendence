import * as localGame from './localGame.js'

console.log(history.length);

window.onload = function()
{
	window.addEventListener("popstate", e => 
	{
		let location = e.state;
		
		if (location != null)
			console.log(location);
		else
			console.log("location state was null")
	});
	// document.getElementById('home-button').addEventListener('click', loadHomePage);
	document.getElementById('search-button').addEventListener('click', loadSearchPage);
	// document.getElementById('profile-button').addEventListener('click', loadProfilePage);
	document.getElementById('play-local').addEventListener('click', loadLocalGame);
	// document.getElementById('play-online').addEventListener('click', loadOnlineGame);
	// document.getElementById('play-tournament').addEventListener('click', loadTournament);
	// document.getElementById('play-tutorial').addEventListener('click', loadTutorial);
	document.getElementById('btn-login').addEventListener('click', loadLoginPage);
	// document.getElementById('btn-singin').addEventListener('click', loadSinginPage);
}


function loadSearchPage()
{
	const mainContainer = document.getElementById('main-container');
	mainContainer.innerHTML = "";

	const div = document.createElement('div');
	div.id = 'search-area';
	div.classList.add('search-area', 'col-12', 'mb-3');

	const form = document.createElement('form');
	form.classList.add('form-inline', 'col-12', 'my-lg-0');


// 	<form class="form-inline my-2 my-lg-0">
// 	<input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
// 	<button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
//   </form>

	const inputField = document.createElement('input');
	inputField.id = 'search-input';
	inputField.classList.add('form-control', 'mr-sm-2');
	inputField.type = 'search';
	inputField.placeholder = 'Search by login';

	const btn = document.createElement('button');
	btn.classList.add("btn", "my-2", "my-sm-0", 'search-button', 'btn-outline-success');
	btn.type = 'submit';
	
	const i = document.createElement('i');
	i.classList.add('fa-solid', 'fa-magnifying-glass');
	i.style = "font-size: 20px;color:white;";

	btn.appendChild(i);
	form.appendChild(inputField);
	form.appendChild(btn);
	div.appendChild(form);

	mainContainer.appendChild(div);
}

function loadLocalGame()
{
	console.log("Clicked local game");
	history.pushState(12, null, 'play-local');
	console.log(history.length + " after pushState");


	const mainContainer = document.getElementById('main-container');
	mainContainer.innerHTML = "";;
	
	const canvas = document.createElement('canvas');
	canvas.id = 'gameBoard';

	canvas.width = 500;
	canvas.height = 500;

	mainContainer.appendChild(canvas);

	localGame.gameStart();
}

function loadLoginPage()
{
	const mainContainer = document.getElementById('main-container');
	mainContainer.innerHTML = "";

	const title = document.createElement('h2');
	title.classList.add('login-title-text', 'text-center', 'mb-4');
	title.textContent = 'Login';

	const loginArea = document.createElement('div');
	loginArea.classList.add('login-area', 'container', 'd-flex', 'justify-content-center', 'align-items-center');
	loginArea.id = 'login-area';
	


	const form = document.createElement('form');
	form.id = 'login.form';

	const usernameDiv = document.createElement('div');
	usernameDiv.classList.add('form-group');

	const usernameLabel = document.createElement('label');
	usernameLabel.setAttribute('for', 'username');
	usernameLabel.textContent = 'Username';

	const usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.classList.add('form-control');
    usernameInput.id = 'username';
    usernameInput.placeholder = 'Enter username';
    usernameInput.required = true;

	usernameDiv.appendChild(usernameLabel);
	usernameDiv.appendChild(usernameInput);

	const passwordDiv = document.createElement('div');
    passwordDiv.classList.add('form-group');

    const passwordLabel = document.createElement('label');
    passwordLabel.setAttribute('for', 'password');
    passwordLabel.textContent = 'Password';

    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.classList.add('form-control');
    passwordInput.id = 'password';
    passwordInput.placeholder = 'Enter password';
    passwordInput.required = true;

	passwordDiv.appendChild(passwordLabel);
	passwordDiv.appendChild(passwordInput);

	const loginButton = document.createElement('button');
	loginButton.type = 'submit';
	loginButton.classList.add('btn', 'btn-block', 'submit-login-btn');
	loginButton.textContent = 'Login';

	form.appendChild(usernameDiv);
	form.appendChild(passwordDiv);
	form.appendChild(loginButton);

	loginArea.appendChild(form);

	mainContainer.appendChild(titleArea);
	mainContainer.appendChild(loginArea);
}