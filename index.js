var _ = require('underscore'),
    express = require('express'),
    app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

server.listen(process.env.PORT || 3000);

var representatives = []; // List of connected reps
var waitingList = []; // List of clients waiting

io.sockets.on('connection', function(socket) {
    socket.on('subscribe', function(data) {
        // if rep
        if (!data.type || data.type !== 'support') {
            // Handle waiting list if there is one
            if (waitingList.length > 0) {
                var room = createUuid();
                var client = waitingList.shift();
                client.join(room);
                socket.join(room);
                notifyRoom(room, 'start', {
                    roomName: uuid
                }); // Notify room to start
            } else {
                representatives.push(socket);
            }

            return;
        }

        // if client
        var uuid = createUuid();
        socket.join(uuid);

        // put available rep in same room
        if (representatives.length > 0) {
            representatives.shift().join(uuid);
            notifyRoom(uuid, 'start', {
                roomName: uuid
            });
        } else {
            waitingList.push(socket);
        }

    });

    // Remove rep from available if they disconnect
    socket.on('disconnect', function() {
        var index = representatives.indexOf(socket);
        if (index > -1) {
            representatives.splice(index, 1);
            return;
        }

        index = waitingList.indexOf(socket);
        if (index > -1) {
            waitingList.splice(index, 1);
        }
    });
});

function notifyRoom(room, event, data) {
    var inside = io.sockets['in'];
    inside(room).emit(event, data);
}

function createUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}