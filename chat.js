module.exports = function(socket) {

    socket.on('chat', function(data) {
        if (data && data.room) {
            socket.broadcast.to(data.room).emit('chat', data);
        }
    });

};