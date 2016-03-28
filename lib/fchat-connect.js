var winston = require('winston');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var User = mongoose.model('User', {userid:String, username:String, isLogin:Boolean});

module.exports = {

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
			if(user.length>0){
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

		
	}
}