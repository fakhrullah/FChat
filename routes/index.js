module.exports = function(io){

	var express = require('express');
	var router = express.Router();
	var winston = require('winston');
	// var sanitizeHtml = require('sanitize-html');
	var fchat = require(__rootpath + 'lib/fchat-connect.js');
	// var mongoose = require('mongoose');
	// mongoose.connect('mongodb://localhost/test');

	// var User = mongoose.model('User', {userid:String, username:String, isLogin:Boolean});

	winston.level = 'debug';

	var n=0;

	/* GET home page. */
	router.get('/', function(req, res, next) {
  		res.render('index', { title: 'FChat | Simple chat application' });
	});

	io.on('connection', function(socket){
		winston.debug("connection start");

		// when user enter website 
		var socketId = socket.id;
		var username = null;

		// first time when user enter web app
		// TODO give user first information about website
		io.to(socketId).emit('new_connection', {userid:socketId});

		// when user login
		socket.on('login', function(data){
			winston.debug('user is logging in');

			fchat.login(data, function(err, user){
				if(err) {
					io.to(socketId).emit('login_failed', {message: err.message});
					return;
				}

				// update user data
				username = user.username;
				winston.debug("username => " + username);

				// tell to this user, he/she successfully logged in
				io.to(socketId).emit('login_success', {username:username, returneduserkey:user.returneduserkey});
				// tell to all except user that this user enter chat
				socket.broadcast.emit('user_enter', {username:username});
			});

		})

		// when user send message
		socket.on('chat_message', function (message) {
			// TODO dont send message to non login user 
			// - I dont how to do this. io.emit is sending data, it send to all.
			// - Idea : create a big room '/home' that only can be join by login user.
			// - Not important

			fchat.sendMessage({
				username: username,
				userid: socketId,
				message: message
			},function(err, data){
				if(err){
					// tell user their message failed to sent to other
					io.to(socketId).emit('send_message_failed', {message: err.message});
					return;
				}

				// send message to all
				io.emit('new_message', {username:data.username, text:data.message, userid:data.userid});
			});

		})

		// when user already login before and just coming back
		socket.on('returned_user', function(data){

			fchat.returned_user(data, function(err, user){
				if(err){
					io.to(socketId).emit('unvalid_returneduserkey', {message: err.message});
					return;
				}

				username = user.username;
				winston.debug(username);
				// before change socket id
				winston.debug("Socket id autoset for new connection : " + socket.id);
				io.to(socket.id).emit('welcome_back', {username: user.username});
				socket.broadcast.emit('user_coming_back', {username: user.username});

				// change user socket id use socket id that saved in user client data
				socketId = socket.id = user.userid;
				winston.debug("Change socket id for returned user to old socket id : " + socket.id);

			});

		});

		// when user logout
		socket.on('logout', function(data){
			winston.debug('user logout');
			// TODO [bug] when user logout user still can send message
			fchat.logout(data, function(err){

				if(err){
					io.to(socketId).emit('logout_failed', {message: err.message});
					return;
				}

				io.to(socketId).emit('logout_success');
				socket.broadcast.emit('user_logout', {username:data.username})

			});
		});

		// when user left
		socket.on('disconnect', function () {
			if(username){
				winston.debug(username + " is leaving")
				socket.broadcast.emit('user_left', {username:username});
				// only remove from users if user logout
			}
		})


	})

	return router;
}