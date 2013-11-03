module.exports = function(socket) {

    socket.on('chat', function(data) {
        socket.get('room', function(err, room) {
            socket.broadcast.to(room).emit('chat', data);
        });
    });

};