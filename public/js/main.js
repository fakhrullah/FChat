var socket = io();

// forms
var loginForm = document.getElementById('loginForm');
var postForm = document.getElementById('postForm');
var usernameInput = document.getElementById('username');


// send message on send button clicked
document.getElementById('sendMsg').onclick = function(){sendMsg();}

// send message on button ENTER
document.getElementById('msg').onkeyup = function(event){sendMsgOnEnterButton(event)}

// send login data on button click
document.getElementById('sendLogin').onclick = function(){login();}

//send message function
function sendMsg(){
	var m = document.getElementById('msg');
	if (m.value.trim()=='') return '';

	socket.emit('chat_message', m.value);
	m.value = '';

	return false;
};

function addNewMsg(div){
	var parentDiv = document.getElementById("messages");
	var topMsg = document.getElementsByClassName('msg')[0];

	parentDiv.insertBefore(div, topMsg);
}

function buildInfoDiv(data){
	var infoDiv = document.createElement('div');
	infoDiv.className = "msg info";
	var text;
	switch(data.info){
		case "user_left":
			text = data.username + " left."
			infoDiv.innerHTML = text;
			break;
		case "welcome_back":
			infoDiv.className += " action";
			var logoutBtn = document.createElement('button');
			logoutBtn.innerHTML = "CLICK HERE TO LOGOUT";
			logoutBtn.className = "btn btn-logout";
			logoutBtn.onclick = function(){logout()};
			text = "Welcome back, <strong class=\"bigger\">" + data.username + "</strong><br>" +
				"If this is not you : <br>" ;
			infoDiv.innerHTML = text;
			infoDiv.appendChild(logoutBtn);
			break;
		case 'welcome':
			infoDiv.className += " action";
			text = "Welcome to FChat. By login means you agree with our <a href=\"/terms\" target=\"_blank\">terms</a>."
			infoDiv.innerHTML = text;
			break;
		case 'user_enter':
			text = data.username + " enter chat.";
			infoDiv.innerHTML = text;
			break;
		case 'logout':
			text = data.username + " logged out";
			infoDiv.innerHTML = text;
			break;
		case 'error':
			text = data.message;
			infoDiv.innerHTML = text;
			break;
		default:
			text = data.info + " not implemented yet."
			infoDiv.innerHTML = text;
	}
	return infoDiv;
}

function buildChatDiv(data){
	var chatDiv = document.createElement('div');
	var userDiv = document.createElement('div');
	var userAvatarDiv = document.createElement('div');
	var userUsernameDiv = document.createElement('div');
	var chatMessageDiv = document.createElement('div');

	if(getUser().userid == data.userid){ chatDiv.className = "msg own"}
	else chatDiv.className = 'msg others';

	userDiv.className = 'user';
	userUsernameDiv.className = 'username';
	userUsernameDiv.innerHTML = data.username;

	userDiv.appendChild(userAvatarDiv);
	userDiv.appendChild(userUsernameDiv);

	chatMessageDiv.className = 'text';
	chatMessageDiv.innerHTML = data.text;

	if(getUser().userid == data.userid){
		chatDiv.appendChild(chatMessageDiv);
		chatDiv.appendChild(userDiv);
	}
	else{
		chatDiv.appendChild(userDiv);
		chatDiv.appendChild(chatMessageDiv);
	}
	return chatDiv;
}
// send chat on ENTER button
function sendMsgOnEnterButton(event) {
	//send message if enter button push
	if (event.which === 13 )sendMsg();
};

function showLoginForm(){
	postForm.className += " hide";
	var classes = loginForm.className;
	var removedHide = classes.split('hide').join('').trim();

	loginForm.className = removedHide;
};

function login(){
	var userid = localStorage.getItem('userid');
	var username = usernameInput.value;
	socket.emit('login',{username:username, userid:userid});
};

function showPostForm(){
	loginForm.className += ' hide';
	var classes = postForm.className;
	var removedHide = classes.split('hide').join('').trim();

	postForm.className = removedHide;
};

function logout(){
	socket.emit('logout', {
		userid: localStorage.getItem('userid'),
		username: localStorage.getItem('username'),
	});
	localStorage.clear();
}

// new user enter
socket.on('new_connection', function (user) {
	// check localstorage for username and userid
	var username = localStorage.getItem('username');
	var userid = localStorage.getItem('userid');

	// for returned user, send available user data
	// REMEMBER data from localStorage is always in string
	if( username && username != 'null'){
		// this is not the first time for user
		// localStorage.setItem('userid', user.userid);
		socket.emit('returned_user', {userid:userid, username: username});
		// console.log('miaw');
	}
	else{
		// save username and userid to localstorage
		// localStorage.setItem('username', user.username);
		localStorage.setItem('userid', user.userid);
		// ask user to login
		showLoginForm();
		// console.log('meh');
	}
});

socket.on('login_success', function (user){
	localStorage.setItem('username', user.username);
	var data = user;
	data.info = 'welcome';
	addNewMsg(buildInfoDiv(data))
	showPostForm();
});
socket.on('login_failed', function(data){
	data.info = 'error';
	addNewMsg(buildInfoDiv(data));
});
socket.on('welcome_back', function(user){
	var data = user;
	data.info = 'welcome_back';
	addNewMsg(buildInfoDiv(data));
	showPostForm();	
});
socket.on('user_enter', function(user){
	var data = user;
	data.info = 'user_enter';
	addNewMsg(buildInfoDiv(data));
});

socket.on('logout_success', function(user){
	showLoginForm();
});

// receive chat message
socket.on('new_message', function (data) {
	addNewMsg(buildChatDiv(data));
});
socket.on('send_message_failed', function(data){
	data.info = 'error';
	addNewMsg(buildInfoDiv(data));
})

// //user left
socket.on('user_left', function (data) {
	data.info = 'user_left';
	addNewMsg(buildInfoDiv(data))
});
socket.on('user_logout', function (data) {
	data.info = 'logout';
	addNewMsg(buildInfoDiv(data))
});

socket.on('user_coming_back', function(data){
	data.info = 'user_enter';
	addNewMsg(buildInfoDiv(data));
});

// clear chat
// $('#clearChat').click(function(){
//     $('#messages').html('');
// });

// var showMsg = function(){
// 	setTimeout(function(){
// 		var lastShowedMsg = $('.show_msg').length + 1;
// 		$("#messages li:nth-child("+lastShowedMsg+")").addClass('show_msg');
// 	}, 50);    	
// }

function getUser(){
	var user = {
		userid: localStorage.getItem('userid'),
		username: localStorage.getItem('username')
	}
	return user;
}