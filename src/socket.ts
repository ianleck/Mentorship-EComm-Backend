// const http = require('http');
const socketIo = require('socket.io');
import { FRONTEND_APIS } from '../src/constants/constants';
let io;

const usersToSocketId = {};
const socketIdToUsers = {};
const consultIdToUsers = {};
const socketIdToConsultationId = {};
const consultNotes = {};

const chatIdToSocketIds = {};
const socketIdToChatIds = {};
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
        if (data.accountId) {
          socketIdToUsers[socket.id] = data.accountId;
          usersToSocketId[data.accountId] = socket.id;
        }

        if (data.consultationId && data.accountId) {
          this.initUsers(socket.id, data.consultationId, data.accountId);
          this.initConsultNotes(data.consultationId);
        }
        if (data.chatIds) {
          this.initChat(socket.id, data.chatIds);
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
        const consultationId = socketIdToConsultationId[socket.id];
        console.log('DISCONNECT =', consultationId);
        if (consultationId) {
          const userKeys = Object.keys(consultIdToUsers[consultationId]);
          const userSocketIds = Object.values(consultIdToUsers[consultationId]);
          const socketIndex = userSocketIds.indexOf(socket.id);
          if (socketIndex != -1) {
            const userAccountId = userKeys[socketIndex];

            // delete account socket mapping
            delete consultIdToUsers[consultationId][userAccountId];
            // delete socketId to consultation mapping
            delete socketIdToConsultationId[socket.id];
            // delete consultation to notes mapping if all users in consultIdToUsers are disconnected
            if (Object.values(consultIdToUsers[consultationId]).length == 0) {
              delete consultNotes[consultationId];
            }

            // emit to remaining user
            const consultConnectedSocketIds = Object.values(
              consultIdToUsers[consultationId]
            );

            consultConnectedSocketIds.map((_socket) => {
              io.to(_socket).emit(
                'RelatedUsers',
                consultIdToUsers[consultationId]
              );
            });
          }
        }

        this.handleChatDisconnect(socket.id);
        const accountId = socketIdToUsers[socket.id];
        delete usersToSocketId[accountId];
        delete socketIdToUsers[socket.id];
      });

      socket.on('callUser', (data) => {
        io.to(data.userToCall).emit('hey', {
          signal: data.signalData,
          from: data.from,
        });
      });

      socket.on('endCall', (data) => {
        if (data.consultationId) {
          const consultationSockets = Object.values(
            consultIdToUsers[data.consultationId]
          );
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

          this.emitToRelatedUsers(
            consultIdToUsers,
            consultationId,
            'allNotes',
            consultNotes[consultationId]
          );
        }
      });

      this.setupChat(socket);
    });
  }

  static initUsers(socketId, consultationId, accountId) {
    if (!consultIdToUsers[consultationId]) {
      consultIdToUsers[consultationId] = {};
    }
    consultIdToUsers[consultationId][accountId] = socketId;
    socketIdToConsultationId[socketId] = consultationId;
    const consultConnectedSocketIds = Object.values(
      consultIdToUsers[consultationId]
    );

    if (consultConnectedSocketIds.length > 2) {
      io.to(socketId).emit('tooManyUsers');
      delete consultIdToUsers[consultationId][socketId];
    } else {
      // emit socketIds connected to the consultation to all consultation sensei & student
      consultConnectedSocketIds.map((_socket) => {
        io.to(_socket).emit(
          'consultationUsers',
          consultIdToUsers[consultationId]
        );
      });
    }
  }

  static initConsultNotes(consultationId) {
    if (!consultNotes[consultationId]) {
      consultNotes[consultationId] = [];
    }
    this.emitToRelatedUsers(
      consultIdToUsers,
      consultationId,
      'allNotes',
      consultNotes[consultationId]
    );
  }

  static initChat(socketId, chatIds) {
    chatIds.map((chatId) => {
      if (!chatIdToSocketIds[chatId]) {
        chatIdToSocketIds[chatId] = [];
      }
      if (!socketIdToChatIds[socketId]) {
        socketIdToChatIds[socketId] = [];
      }

      chatIdToSocketIds[chatId].push(socketId);
      socketIdToChatIds[socketId].push(chatId);
    });
  }

  static setupChat(socket) {
    // ON: newChat, newMessage,
    // EMIT: incomingNewChat => 2 types: group or normal chat. GroupChat -> loop through
    //  incomingNewMessage (to all users in chatId (ie. chatIdTousers[chatId])
    socket.on('newChat', (data) => {
      const message = data.sentMessage;
      if (message) {
        const chatId = message.chatId;
        chatIdToSocketIds[chatId] = [];
        if (usersToSocketId[message.senderId]) {
          chatIdToSocketIds[chatId].push(usersToSocketId[message.senderId]);
        }
        if (usersToSocketId[message.receiverId]) {
          chatIdToSocketIds[chatId].push(usersToSocketId[message.receiverId]);
        }

        // update all chat participants who are connected
        chatIdToSocketIds[chatId].map((participantSocketId) => {
          io.to(participantSocketId).emit('incomingChange');
        });
      }
    });

    socket.on('newMessage', (data) => {
      const message = data.sentMessage;
      if (message) {
        const chatId = data.chatId;
        // update all chat participants who are connected
        if (!chatIdToSocketIds[chatId]) {
          chatIdToSocketIds[chatId] = [];
        }
        if (usersToSocketId[message.senderId]) {
          chatIdToSocketIds[chatId].push(usersToSocketId[message.senderId]);
        }
        if (usersToSocketId[message.receiverId]) {
          chatIdToSocketIds[chatId].push(usersToSocketId[message.receiverId]);
        }
        chatIdToSocketIds[chatId].map((participantSocketId) => {
          io.to(participantSocketId).emit('incomingChange', {
            newMessage: message,
          });
        });
      }
    });

    socket.on('newChatGroup', (data) => {
      const groupChat = data.groupChat;
      if (groupChat) {
        const chatId = groupChat.chatId;
        const accountId = groupChat.accountId;
        if (!chatIdToSocketIds[chatId]) {
          chatIdToSocketIds[chatId] = [];
        }
        if (usersToSocketId[accountId]) {
          chatIdToSocketIds[chatId].push(usersToSocketId[accountId]);
        }
      }
    });

    socket.on('newMember', (data) => {
      const userAdded = data.userAdded;
      if (userAdded) {
        const chatId = userAdded.chatId;
        // update all chat participants who are connected
        if (!chatIdToSocketIds[chatId]) {
          chatIdToSocketIds[chatId] = [];
        }
        if (usersToSocketId[userAdded.accountId]) {
          chatIdToSocketIds[chatId].push(usersToSocketId[userAdded.accountId]);
        }
        chatIdToSocketIds[chatId].map((participantSocketId) => {
          io.to(participantSocketId).emit('incomingChange');
        });
      }
    });

    socket.on('newGroupMessage', (data) => {
      const message = data.sentMessage;
      const users = data.users;
      if (message && users) {
        const chatId = message.chatId;
        // update all chat participants who are connected
        if (!chatIdToSocketIds[chatId]) {
          chatIdToSocketIds[chatId] = [];
        }
        if (usersToSocketId[message.senderId]) {
          chatIdToSocketIds[chatId].push(usersToSocketId[message.senderId]);
        }
        chatIdToSocketIds[chatId].map((participantSocketId) => {
          io.to(participantSocketId).emit('incomingChange', {
            newMessage: message,
          });
        });
      }
    });
  }

  static handleChatDisconnect(socketId) {
    const chatIds = socketIdToChatIds[socketId];
    if (chatIds) {
      chatIds.forEach((chatId) => {
        // remove socketId that is subscribed to a chatId
        chatIdToSocketIds[chatId] = chatIdToSocketIds[chatId].filter(
          (_socketId) => _socketId !== socketId
        );
        if (chatIdToSocketIds[chatId].length === 0) {
          // no more users connected to chat
          delete chatIdToSocketIds[chatId];
        }
      });
    }
    delete socketIdToChatIds[socketId];
  }

  static emitToRelatedUsers(_users, consultationId, event, data) {
    const connectedSocketIds = Object.values(_users[consultationId]);

    connectedSocketIds.map((_socket) => {
      io.to(_socket).emit(event, data);
    });
  }
}

export default socket;
