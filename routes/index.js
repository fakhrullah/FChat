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

				// tell to this user, he/she successfully logged in
				io.to(socketId).emit('login_success', {username:username});

				// tell to all except user that this user enter chat
				socket.broadcast.emit('user_enter', {username:username});

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
				io.emit('new_message', {username:username, text:message, userid:socketId});
			}
		})

		// when user already login before and just coming back
		socket.on('returned_user', function(user){

			User.find(user, function(err, data){
				if(err) winston.error("User not found");
				else {
					username = user.username;
					// before change socket id
					winston.debug("Socket id autoset for new connection : " + socket.id);
					io.to(socket.id).emit('welcome_back', {username: username});
					socket.broadcast.emit('user_coming_back', {username: username});

					// change user socket id use socket id that saved in user client data
					socketId = user.userid;
					socket.id = user.userid;
					winston.debug("Change socket id for returned user to old socket id : " + socket.id);

					winston.debug(JSON.stringify(data, null, 2));
				}
			});


		});

		// when user logout
		socket.on('logout', function(data){
			winston.debug('user logout');
			// remove user from database
			User.remove({userid:data.userid}, function(err){
				if(err) winston.error("Error remove user from DB.")
				else {
					winston.debug("remove user");
					io.to(socketId).emit('logout_success');
					socket.broadcast.emit('user_logout', {username:data.username})
				}
			});
		});

		// when user left
		socket.on('disconnect', function () {
			if(username){
				winston.debug(username + " is leaving")
				socket.broadcast.emit('user_left', {username:username});
				// only remove from users if user logout
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
