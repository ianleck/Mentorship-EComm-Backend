// const http = require('http');
const socketIo = require('socket.io');
import { FRONTEND_APIS } from '../src/constants/constants';
let io;

const users = {};
const usersToConsultationId = {};
const consultNotes = {};
class socket {
  static init(server) {
    io = socketIo(server, {
      cors: {
        cors: true,
        origin: FRONTEND_APIS,
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
          this.initUsers(socket.id, data.consultationId, data.accountId);
          this.initConsultNotes(data.consultationId);
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

            // delete account socket mapping
            delete users[consultationId][userAccountId];
            // delete socketId to consultation mapping
            delete usersToConsultationId[socket.id];
            // delete consultation to notes mapping if all users disconnected
            if (Object.values(users[consultationId]).length == 0) {
              delete consultNotes[consultationId];
            }

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

      // consult notes
      socket.on('addNote', (data) => {
        const { newNote, consultationId } = data;
        if (consultationId && consultNotes[consultationId]) {
          consultNotes[consultationId].push(newNote);

          this.emitToConsultationUsers(
            consultationId,
            'allNotes',
            consultNotes[consultationId]
          );
        }
      });
    });
  }

  static initUsers(socketId, consultationId, accountId) {
    if (!users[consultationId]) {
      users[consultationId] = {};
    }

    /**
     * _user = {
     *   <consultationId>: {
     *     <accountId>: <socketId>
     *   }
     * }
     */
    users[consultationId][accountId] = socketId;
    usersToConsultationId[socketId] = consultationId;
    const consultConnectedSocketIds = Object.values(users[consultationId]);

    if (consultConnectedSocketIds.length > 2) {
      io.to(socketId).emit('tooManyUsers');
      delete users[consultationId][socketId];
    } else {
      // emit socketIds connected to the consultation to all consultation sensei & student
      consultConnectedSocketIds.map((_socket) => {
        io.to(_socket).emit('consultationUsers', users[consultationId]);
      });
    }
  }

  static initConsultNotes(consultationId) {
    if (!consultNotes[consultationId]) {
      consultNotes[consultationId] = [];
    }
    this.emitToConsultationUsers(
      consultationId,
      'allNotes',
      consultNotes[consultationId]
    );
  }

  static emitToConsultationUsers(consultationId, event, data) {
    const consultConnectedSocketIds = Object.values(users[consultationId]);

    consultConnectedSocketIds.map((_socket) => {
      io.to(_socket).emit(event, data);
    });
  }
}

export default socket;
