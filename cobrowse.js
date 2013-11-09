module.exports = function(socket) {

    socket.on('cursor-update', function(data) {
        if (data && data.room) {console.log('cursor-update: ' + JSON.stringify(data));
            socket.broadcast.to(data.room).emit('cursor-update', data);
        }
    });

    socket.on('cursor-click', function(data) {
        if (data && data.room) {console.log('cursor-click: ' + JSON.stringify(data));
            socket.broadcast.to(data.room).emit('cursor-click', data);
        }
    });

};