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
	return infoDiv;
}

function buildChatDiv(data){
	var chatDiv = document.createElement('div');
	var user = data.username;
	var msg = data.text;

	chatDiv.className = 'msg';
	chatDiv.innerHTML = user + " : " + msg;
	return chatDiv;
}
// send chat on ENTER button
function sendMsgOnEnterButton(event) {
	//send message if enter button push
	if (event.which === 13 )sendMsg();
};

function showLoginForm(){
	var classes = loginForm.className;
	var removedHide = classes.replace('hide','').trim();

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
	var removedHide = classes.replace('hide','').trim();

	postForm.className = removedHide;
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
	showPostForm();
})
socket.on('login_failed', function(){
	showErrorLogin();
})
socket.on('welcome_back', function(){
	showPostForm();	
})

// receive chat message
socket.on('new_message', function (data) {
	addNewMsg(buildChatDiv(data));
});

// //user left
socket.on('user_left', function () {
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
