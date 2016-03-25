module.exports = function(io){

	var express = require('express');
	var router = express.Router();
	var winston = require('winston');
	var sanitizeHtml = require('sanitize-html');
	var mongoose = require('mongoose');
	mongoose.connect('mongodb://localhost/test');

	var User = mongoose.model('User', {userid:String, username:String});

	winston.level = 'debug';

	var n=0;

	/* GET home page. */
	router.get('/', function(req, res, next) {
  		res.render('index', { title: 'FChat | Simple chat application' });
	});

	io.on('connection', function(socket){
		console.log("connection start");

		// when user enter website 
		n++;
		var socketId = socket.id;
		var username = null;

		// first time when user enter web app
		io.to(socketId).emit('new_connection', {userid:socketId});

		// when user login
		socket.on('login', function(user){
			if(user.username.trim().length > 3){
				// add user to db
				var u = new User(user);
				u.save(function(err, user){
					if(err) winston.debug("Failed to save user");
					else winston.debug(JSON.stringify(user, null, 2));
				});

				username = user.username;
				winston.debug('login_success');
				io.to(socketId).emit('login_success', {username:username});

			}
			else{
				winston.debug('login_failed');
				io.to(socketId).emit('login_failed');
			}
		})

		// when user send message
		socket.on('chat_message', function (message) {
			if(username){
				winston.debug('user send new message');
				// TODO purify user message
				message = cleanHtml(message);
				io.emit('new_message', {username:username, text:message});
			}
		})

		// when user already login before and just coming back
		socket.on('returned_user', function(user){

			User.find(user, function(err, data){
				if(err) winston.error("User not found");
				else {

					winston.debug("Socket id autoset for new connection : " + socket.id);
					username = user.username;
					socketId = user.userid;
					socket.id = user.userid;
					winston.debug("Change socket id for returned user to old socket id : " + socket.id);

					winston.debug(JSON.stringify(data, null, 2));

					io.emit(socketId).emit('welcome_back');
				}
			});

		});

		// when user left
		socket.on('disconnect', function () {
			if(username){
				// console.log('user leave');
				socket.broadcast.emit('user_left', username);
				// TODO remove user from users
			}
		});

		function cleanHtml(userInput){
			return sanitizeHtml(userInput, {
				allowedTags: [],
				allowedAttribute: []
			});
		} 


	})

	return router;
}
