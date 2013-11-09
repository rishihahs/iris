var _ = require('underscore'),
    express = require('express'),
    app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    url = require('url'),
    options = require('./options.json');

server.listen(process.env.PORT || 3000);

// Room where service requests are sent
var helpDesk = createUuid();

io.sockets.on('connection', function(socket) {
    // Helpdesk Connections
    socket.on('helpdesk', function(data) {
        socket.join(helpDesk);
    });

    require('./chat')(socket);

    socket.on('subscribe', function(data) {
        onSubscribe(socket, data);
    });
});

function onSubscribe(socket, data) {
    var room = (data && data.room) ? data.room : createUuid(); // Existing or new room
    var occupants = io.sockets.clients(room).length; // People currently in room

    // Verify URL
    var site = data && data.url;
    // SECURITY: Disabled for Dev
    // if (url.parse(site).hostname !== options.hostname) {
    //     socket.disconnect();
    //     return;
    // }

    socket.join(room);
    if (occupants === 0) {console.log(room);
        io.sockets.in(helpDesk).emit('newCitizen', {
            room: room,
            url: site
        });
    } else {
        io.sockets.in(room).emit('start', {
            room: room
        });
    }

}

function createUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}