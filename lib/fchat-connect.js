var winston = require('winston');
var sanitizeHtml = require('sanitize-html');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var User = mongoose.model('User', {userid:String, username:String, isLogin:Boolean});

/**
 * Remove all html tags from user input
 */
var cleanHtml = function(userInput){
	return sanitizeHtml(userInput, {
		allowedTags: ['br'],
		allowedAttribute: []
	});
}

module.exports = {

	/**
	 * User login to start chat
	 * 
	 * @params user
	 * @params cb | function()
	 */
	login: function(user, cb){
		winston.debug(user);
		var usernameLength = user.username.trim().length;

		if( usernameLength < 4 ){
			winston.debug('login_failed : username too short');
			cb(new Error("Username too short. Choose username with more than 4 characters"));
			return;
		}

		if( usernameLength > 10 ){
			winston.debug('login_failed : username too long');
			cb(new Error("Username too long. Choose username shorter than 10 characters"));
			return;
		}

		var usernameRegex = /^[a-zA-Z]+$/;
		if( !usernameRegex.test(user.username) ){
			winston.debug('login_failed : username contain unvalid character');
			cb(new Error("Username is unvalid. Choose username that contains only alphabet (a to z)."));
			return;
		}

		// check if username is already in database
		User.find({username:user.username}, function(err, users){
			if(users.length>0){
				winston.debug('login_failed : username is taken');
				cb(new Error("Username is taken, choose different username."));
				return;
			}

			var u = new User(user);
			u.save(function(err, user){
				if(err) {
					winston.debug("Failed to save user");
					cb(new Error("Failed to save user"));
					return;
				}

				winston.debug('login_success');
				cb(null, user);
			});

		});
	},

	/**
	 * Send user message
	 * 
	 */
	sendMessage: function(data, cb){
		// TODO check if user logged in
		if(data.username){
			winston.debug('user send new message');
			// TODO check if sanitize user message is enough?
			// Be carefull, people still can XSS without html tag, which by using special character. Check this!
			data.message = cleanHtml(data.message);
			cb(null, data);
		}
		else{
			cb(new Error('You are not logged in. Please login.'))
		}

	}
}