// this is client.js
$(function () {
                
    // TODO save username in cookie for next session
   	// document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC"; 
    
    //send message function
    var sendMsg = function(){
        if( $('#m').val().trim() === '') return '';
        socket.emit('chat_message', $('#m').val());
        $('#m').val('');
        $('#m').height(36);
        autoscrollMessages();
        return false;
    };
                
    var socket = io();
    
    // send message on send button clicked
    $('#sendMsg').click(function () {
        sendMsg();
    });
    
    // new user enter
    socket.on('new_connection', function (username) {
        $('#messages').append('<li class="user_enter">' + username + ' masuk</li>');
        showMsg();
    });
    
    //user left
    socket.on('user_left', function (username) {
        $('#messages').append('<li class="user_left">' + username + ' keluar</li>');
        showMsg();
    });
    
    // users count
    socket.on('users', function (users) {
        $('#users').text(users);
    });
    
    // receive chat message
    socket.on('chat_message', function (data) {
        var username = '<span class="username">'+ data.user + '</span>';
        var userMsg = '<span class="user_message">' + data.msg + '</span>';
        $('#messages').append('<li>'+username + ' : ' + userMsg + '</li>');
        showMsg();
    });
    
    // receive user action
    socket.on('user_action', function (data) {
        $('#messages').append(
                $('<li class="'+data.action+'">').text(data.msg)
                );
        showMsg();
    });
    
    // update online users
    socket.on('usernames', function (usernames) {
        var users = '';
        for (x = 0; x <= usernames.length - 1; x++) {
            users += '<li>' + usernames[x] + '</li>';
        }
        users += '';
        $('#online ul').html(users);
    });

    // toggle views who is online
    $('#online-toggle').click(function () {
        $('#online').toggleClass('my-close');
    });
    
    // ---- autogrow chat area
    $('#m').keyup(function (e) {
//        console.log(e.which);
        var textarea = $(this);
        
        //send message if enter button push
        if (e.which === 13 )sendMsg();
        
        var scrollHeight = textarea.prop('scrollHeight') - parseInt(textarea.css('padding-top')) - parseInt(textarea.css('padding-bottom')),
                allHeight = textarea.height();

        if (allHeight < scrollHeight) {
            textarea.height(scrollHeight);
        } else {
            textarea.height(scrollHeight);
        }
    });
    
    // clear chat
    $('#clearChat').click(function(){
        $('#messages').html('');
    });
    
    // auto scroll 
    var autoscrollMessages=function(){
        
        setTimeout(function(){
            var m = document.getElementById('messages');
            window.scrollTo(0,m.offsetHeight);
        },300);
    };

    var showMsg = function(){
    	setTimeout(function(){
    		var lastShowedMsg = $('.show_msg').length + 1;
    		$("#messages li:nth-child("+lastShowedMsg+")").addClass('show_msg');
    	}, 50);    	
    }

});