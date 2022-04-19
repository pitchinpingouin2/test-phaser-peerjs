const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');

app.set("view engine", "ejs");
app.use(express.static('public'));

app.get('/', (req, res) => { 
    res.redirect(`/${uuidV4()}`)
});

app.get('/:room', (req, res) => {
    res.render('room-view', { roomId: req.params.room})
});

var numClients = 0;

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
        numClients++;
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId, numClients); //broadcast to everyone except the user.
        socket.emit('num-clients', numClients); //send to user only.

        socket.on('disconnect', () => {
            numClients--;
            socket.to(roomId).emit('user-left', userId, numClients);
        })
    })
});

server.listen(8001);