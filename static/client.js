$(function () {
    var socket = io();
    $('form').submit(function () {
        socket.emit('chat_message', $('#m').val());
        $('#m').val('');
        return false;
    });
    socket.on('new_connection', function (username, users) {
        $('#messages').append('<li>' + username + ' masuk</li>');
    });
    socket.on('users', function (users) {
        $('#users').text(users);
    });
    socket.on('chat_message', function (data) {
        $('#messages').append(
                $('<li class="msg">').text(data.user + ' : ' + data.msg)
                );
    });
    socket.on('user_action', function (data) {
        $('#messages').append(
                $('<li>').text(data.action)
                );
    });
    socket.on('usernames', function (usernames) {
        var users = '<ul>';
        for (x = 0; x <= usernames.length - 1; x++) {
            users += '<li>' + usernames[x] + '</li>'
        }
        users += '</ul>';
        $('#online').html(users);
    });

    // toggle views who is online
    $('#online-toggle').click(function () {
        $('#online').toggleClass('hide');
    });
});
/**/