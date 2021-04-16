// const http = require('http');
const socketIo = require('socket.io');
import { FRONTEND_API } from '../src/constants/constants';
let io;

const users = {};
const usersToConsultationId = {};
class socket {
  static init(server) {
    io = socketIo(server, {
      cors: {
        cors: true,
        origin: [FRONTEND_API],
        optionsSuccessStatus: 200, // For legacy browser support
        methods: ['GET', 'POST'],
        allowedHeaders: ['my-custom-header'],
        credentials: true,
      },
    });
    this.initConnection();
  }

  static initConnection() {
    io.sockets.on('connection', (socket) => {
      console.log('socket connected =', socket.id);

      // let frontend know their socketId
      socket.emit('yourID', socket.id);

      // frontend will emit 'init', sending consultationId and accountId that is connected
      socket.on('init', (data) => {
        if (data.consultationId && data.accountId) {
          if (!users[data.consultationId]) {
            users[data.consultationId] = {};
          }

          /**
           * _user = {
           *   <consultationId>: {
           *     <accountId>: <socketId>
           *   }
           * }
           */
          users[data.consultationId][data.accountId] = socket.id;
          usersToConsultationId[socket.id] = data.consultationId;
          const consultConnectedSocketIds = Object.values(
            users[data.consultationId]
          );

          if (consultConnectedSocketIds.length > 2) {
            io.to(socket.id).emit('tooManyUsers');
            delete users[data.consultationId][socket.id];
          } else {
            // emit socketIds connected to the consultation to all consultation sensei & student
            consultConnectedSocketIds.map((_socket) => {
              io.to(_socket).emit(
                'consultationUsers',
                users[data.consultationId]
              );
            });
          }
        } else {
          if (!data.consultation) {
            io.to(socket.id).emit('error', 'No existing consultation');
          }
          if (!data.accountId) {
            io.to(socket.id).emit('error', 'User not logged in');
          }
        }
      });

      socket.on('disconnect', () => {
        const consultationId = usersToConsultationId[socket.id];
        console.log('DISCONNECT =', consultationId);
        if (consultationId) {
          const userKeys = Object.keys(users[consultationId]);
          const userSocketIds = Object.values(users[consultationId]);
          const socketIndex = userSocketIds.indexOf(socket.id);
          if (socketIndex != -1) {
            const userAccountId = userKeys[socketIndex];
            delete users[consultationId][userAccountId];
            delete usersToConsultationId[socket.id];

            // emit to remaining user
            const consultConnectedSocketIds = Object.values(
              users[consultationId]
            );

            consultConnectedSocketIds.map((_socket) => {
              io.to(_socket).emit('consultationUsers', users[consultationId]);
            });
          }
        }
      });

      socket.on('callUser', (data) => {
        io.to(data.userToCall).emit('hey', {
          signal: data.signalData,
          from: data.from,
        });
      });

      socket.on('endCall', (data) => {
        if (data.consultationId) {
          const consultationSockets = Object.values(users[data.consultationId]);
          consultationSockets.forEach((socketId) => {
            io.to(socketId).emit('callEnded');
          });
        }
      });

      socket.on('acceptCall', (data) => {
        io.to(data.to).emit('callAccepted', data.signal);
      });
    });
  }
}

export default socket;
