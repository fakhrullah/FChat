var winston = require('winston');
var sanitizeHtml = require('sanitize-html');
var crypto = require('crypto');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var User = mongoose.model('User', {userid:String, username:String, isLogin:Boolean, returneduserkey:String});

/**
 * Remove all html tags from user input
 */
var cleanHtml = function(userInput){
	return sanitizeHtml(userInput, {
		allowedTags: ['br'],
		allowedAttribute: []
	});
}

/**
 * Hashing
 */
var hash = function(text){
	// TODO use secret from config
	return crypto.createHmac('sha256', 'secret').update(text).digest('hex');
}

module.exports = {

	/**
	 * User login to start chat
	 * 
	 * @params user
	 * @params cb | function()
	 */
	login: function(user, cb){

		// TODO limit login 10 per day

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

			user.returneduserkey = hash(user.userid);
			var u = new User(user);
			u.save(function(err, user){
				if(err) {
					winston.debug(err);
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
		// TODO limit a message per 500ms bcoz only bot can type that fast
		// TODO ? dont accept message less than 2 characters
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
	},

	/** 
	 * User already used this chat before and `cookies` from client is available
	 */
	returned_user: function(data, cb){
		// Check if is this is really returning user.
		User.findOne({username: data.username}, function(err, user){
			if(err) {
				winston.error(err);
				cb(new Error("There is no one name like this in our database. Please logout and login again."));
				return;
			}

			// Prevent user from using other user username
			if(data.returneduserkey !== user.returneduserkey){
				winston.debug("User did not has valid key as returned user");
				cb(new Error("Your session is outdated . Please logout and login again."));
				return;
			}

			winston.debug("user founded - " + user.username)
			cb(null, user);
		});
	},

	logout: function(data, cb){

		// remove user from database
		User.remove({userid:data.userid, username:data.username}, function(err){
			if(err){
				winston.error(err);
				cb(new Error("Cannot remove user. I dont understand how this can happend. Did you do something? Try reload."));
				return;
			};

			cb(null);

		});
	},
}