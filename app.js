var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// cookieParser not bundled with express anymore
app.use(cookieParser());

/* TODO : read laravel cookie and use logged in data as user. 
 * so that user doesnt need logged in again and i dont have to use API to check logged using node js
*/
// http://stackoverflow.com/questions/22658222/sharing-laravel-4-session-with-nodejs-express


app.get('/', function (req, res) {
    //res.send('<h1>Salam dunia</h1>');
//    res.cookie('username', 'miaw', {maxAge: 60*60*1000});
        
//    console.log(req.cookies);
//    console.log(req.cookies.username);
    res.sendFile(__dirname + '/index.html');
});

var n = 0, users = 0;
var usernames = [];
var clients=[], socketOfClients =[];
io.on('connection', function (socket) {
    //console.log('a user connected');
    //*
    n++;
    users += 1;
    var username = 'tetamu_' + n;
    var socketId = socket.id;
    
    // updates array of client
    usernames.push(username);
    clients.push({socketid:socket.id, username:username});
        
    // tell everyone new user enter
    socket.broadcast.emit('new_connection', username);
    
    io.emit('users', users);
    io.emit('usernames', usernames);
        
    socket.on('chat_message', function (message) {
        // console.log('msg: ' + msg);
        // if user send function
        if (message.charAt(0) === ':') {
            
            var data = userAction(message);
            
            switch (data.action){
                case 'name':
                    var oldusername = username;
                    usernames.splice(usernames.indexOf(username), 1);
                    username = data.data.trim();
                    usernames.push(username);
                    io.emit('user_action', {action: 'change_name', msg:oldusername + ' --> ' + username});
                    io.emit('usernames', usernames);
                    break;
                    
                case 'me':
                    var msg = 'untuk saya saja ' +data.data;
                    io. sockets.connected[socketId].emit('user_action', {action: 'only_me', msg:msg});
                    break;
                    
                default:
                    io.emit('user_action', {action:'...', msg: 'tiada fungsi ' + data.action + ' '});
                    break;
            }
        }
        else {
            io.emit('chat_message', {user: username, msg: message});
        }
    });
    /**/
    socket.on('disconnect', function () {
        //console.log('user disconnected');
        users -= 1;
        io.emit('users', users);
        usernames.splice(usernames.indexOf(username), 1);
        io.emit('usernames', usernames);
        socket.broadcast.emit('user_left', username);
    });/**/
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

/*------------ functions --------------------*/
// extract user data to array
var userAction = function(data){
    // :action actionData msg
    var action, actionData, msg;
    
    var firstSpace = data.indexOf(' '),
            secondSpace = data.indexOf(' ', firstSpace+1);
    
    if(firstSpace<0)
        action = data.substring(1).trim();
    else
        action = data.substring(1,firstSpace).trim();
    
    // if no 3rd data
    if(secondSpace<0){
        actionData = data.substring(firstSpace).trim();
    }else{
        actionData = data.substring(firstSpace, secondSpace).trim();
        msg = data.substring(secondSpace).trim();
    }
    
    return {
        action: action,// :action
        data: actionData,
        msg: msg
    };
};