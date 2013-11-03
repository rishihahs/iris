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
        onSubscribe(socket, data);
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
            console.log('spliced from waiting list');
            waitingList.splice(index, 1);
            return;
        }

        // Clear the room since person disconnected
        socket.get('room', function(err, room) {console.log('clearing room');
            _.each(io.sockets.clients(room), function(client) {
                // Return if client in room is same as person who disconnected
                if (client.id === socket.id) {
                    return;
                }

                client.get('type', function(err, type) {console.log('subscribing client: ' + type);
                    onSubscribe(client, type ? {
                        type: type
                    } : null);
                });
            });
        });
    });
});

function onSubscribe(socket, data) {
    console.log('subscribed');
    // if rep
    if (data && data.type && data.type === 'support') {
        console.log('if rep');
        socket.set('type', data.type, function() {});
        // Handle waiting list if there is one
        if (waitingList.length > 0) {
            console.log('clearing waiting list');
            var room = createUuid(),
                client = waitingList.shift();
            client.join(room);
            socket.join(room);

            // Set Room In Socket
            client.set('room', room, function() {
                socket.set('room', room, function() {
                    notifyRoom(room, 'start', {
                        roomName: room
                    }); // Notify room to start
                });
            });


        } else {
            representatives.push(socket);
        }

        return;
    }

    // if client
    var uuid = createUuid();
    console.log('uuid: ' + uuid);
    socket.join(uuid);

    // put available rep in same room
    if (representatives.length > 0) {
        var rep = representatives.shift();
        rep.join(uuid);

        // Set Room In Socket
        rep.set('room', uuid, function() {
            socket.set('room', uuid, function() {
                notifyRoom(uuid, 'start', {
                    roomName: uuid
                });
            });
        });

    } else {
        console.log('put in waiting list');
        waitingList.push(socket);
    }
}

function notifyRoom(room, event, data) {
    io.sockets. in (room).emit(event, data);
}

function createUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}