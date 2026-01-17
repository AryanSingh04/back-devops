const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST']
}));
app.get("/",(req,res)=>{
 res.send("Hello from Backend")
})

const rooms = {};

io.on('connection', (socket) => {
    socket.on('create-room', ({ roomCode, userId }) => {
        if (!rooms[roomCode]) {
            rooms[roomCode] = [];
            rooms[roomCode].push(userId);
            socket.join(roomCode);
            socket.emit('you-join', { player: 'X' });
        }
    });

    socket.on('join-room', ({ roomCode, userId }) => {
        if (rooms[roomCode] && rooms[roomCode].length < 2) {
            rooms[roomCode].push(userId);
            socket.join(roomCode);
            io.to(roomCode).emit('user-join', { users: rooms[roomCode] });
            socket.emit('you-join', { player: 'O' });
        } else {
            io.to(socket.id).emit('roomNotFound');
        }
    });

    socket.on('make-move', ({ roomCode, move, player }) => {
        io.to(roomCode).emit('move-made', { move, player });
    });

    socket.on('game-finish', ({ player, roomCode }) => {
        io.to(roomCode).emit('game-finish', { player });
    });

    socket.on('reset', ({ roomCode, currentPlayer }) => {
        const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';
        io.to(roomCode).emit('reset-game', { nextPlayer });
    });

    socket.on('disconnect', () => {
        for (const roomCode in rooms) {
            rooms[roomCode] = rooms[roomCode].filter(id => id !== socket.id);
            if (rooms[roomCode].length === 0) {
                delete rooms[roomCode];
            }
            io.to(roomCode).emit('user-exit', socket.id);
        }
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
