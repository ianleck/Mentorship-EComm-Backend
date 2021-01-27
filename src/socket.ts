// const http = require('http');
const socketIo = require('socket.io');

let io;
const users = {};

class socket {
    static init(server){
        io = socketIo(server, {
            cors: {
                cors:true,
                origin: 'http://localhost:3000',
                optionsSuccessStatus: 200, // For legacy browser support
                methods: ["GET", "POST"],
                allowedHeaders: ["my-custom-header"],
                credentials: true
            }
        });
        this.initConnection()
    }

    static initConnection() {
        io.sockets.on('connection', socket => {
            console.log('socket connected =', socket.id)
            if (!users[socket.id]) {
                users[socket.id] = socket.id;
            }
            socket.emit("yourID", socket.id);
            io.sockets.emit("allUsers", users);
            socket.on('disconnect', () => {
                delete users[socket.id];
                console.log('user disconnected=', users)
            })

            socket.on("callUser", (data) => {
                io.to(data.userToCall).emit('hey', {signal: data.signalData, from: data.from});
            })

            socket.on("acceptCall", (data) => {
                io.to(data.to).emit('callAccepted', data.signal);
            })
        });
    }
}

export default socket;