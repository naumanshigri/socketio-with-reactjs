const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Methods',
      'Access-Control-Allow-Headers',
    ],
  }),
);

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const functions = require('./Functions');
const { SocketEvent } = require('./client/src/socket-event.enum');

users = [];
socketList = {};

rooms = {};
room_messages = [];

io.on(SocketEvent.CONNECTION, (socket) => {
  // Add new users and their sockets
  socket.on(SocketEvent.NEW_USER, (userId, name, color) => {
    try {
      users.push({ userId: userId, name: name, color: color });

      socket.userId = userId;
      socket.name = name;
      socket.color = color;
      socketList[userId] = socket;

      console.log('\nNew user added...');
      console.log(users);
      // console.log('Socket.Name: ' + socket.name + '\nSocket.color: ' + socket.color);

      updateUsernames();
    } catch (error) {
      console.log(error);
    }
  });

  // Change name of user
  {
    /*
    socket.on(SocketEvent.CHANGE_NAME, (name, color) => {
      try {
        for (let i = 0; i < users.length; i++) {
          if (users[i].userId === socket.userId) {
            users[i].name = name;
            users[i].color = color;
            break;
          }
        }
        socket.name = name;
        socket.color = color;

        updateUsernames();

        console.log('\nName Changed...');
        console.log(users);
      } catch (error) {
        console.log(error);
      }
    });
  */
  }

  // Update name on clients
  const updateUsernames = () => {
    io.emit(SocketEvent.GET_USERS, users);
  };

  /**************************************************/
  /*                Private Chats                   */
  /**************************************************/

  // Send private message to specified client
  socket.on(SocketEvent.PRIVATE_MESSAGE, (to_userId, message) => {
    try {
      socket.emit(SocketEvent.SENT_MESSAGE, to_userId, socket.name, socket.color, message);
      socketList[to_userId.toString()].emit(
        SocketEvent.RECEIVED_MESSAGE,
        socket.userId,
        socket.name,
        socket.color,
        message,
      );
    } catch (error) {
      console.log(error);
    }
  });

  // Notify when someone joins the chat
  socket.on(SocketEvent.JOIN_NOTIFY, (to_userId) => {
    try {
      socketList[to_userId.toString()].emit(SocketEvent.JOIN_NOTIFY, socket.userId, socket.name);
    } catch (error) {
      console.log(error);
    }
  });
  // Acknowledge that other client received the notification
  socket.on(SocketEvent.JOIN_NOTIFY_ACKNOWLEDGE, (to_userId) => {
    try {
      socketList[to_userId.toString()].emit(SocketEvent.JOIN_NOTIFY_ACKNOWLEDGE, socket.userId, socket.name);
    } catch (error) {
      console.log(error);
    }
  });

  // Notify when someone leaves the chat
  socket.on(SocketEvent.LEAVE_NOTIFY, (to_userId) => {
    try {
      socketList[to_userId.toString()].emit(SocketEvent.LEAVE_NOTIFY, socket.userId, socket.name);
    } catch (error) {
      console.log(error);
    }
  });

  // Notify when user is typing
  socket.on(SocketEvent.TYPING_NOTIFY, (to_userId) => {
    try {
      socketList[to_userId.toString()].emit(SocketEvent.TYPING_NOTIFY, socket.userId);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on(SocketEvent.TYPING_STOPPED_NOTIFY, (to_userId) => {
    try {
      socketList[to_userId.toString()].emit(SocketEvent.TYPING_STOPPED_NOTIFY, socket.userId);
    } catch (error) {
      console.log(error);
    }
  });

  /**************************************************/
  /*                 Chat Rooms                     */
  /**************************************************/

  // Create room
  socket.on(SocketEvent.CREATE_ROOM, () => {
    try {
      if (socket.userId !== undefined) {
        const roomId = functions.generateRoomId(7);

        socket.join(roomId);

        let room = {
          host: { userId: socket.userId, name: socket.name },
          participants: [],
        };
        rooms[roomId] = room;

        room = { roomId: roomId, ...room };

        socket.emit(SocketEvent.ROOM_CREATED, room);

        // console.log(room);
        console.log('---------------------------ROOMS---------------------------');
        for (let i = 0; i < Object.keys(rooms).length; i++) {
          let roomId = Object.keys(rooms)[i];
          console.log(rooms[roomId]);
        }
        console.log('-----------------------------------------------------------');
      }
    } catch (error) {
      console.log(error);
    }
  });

  // Join room
  socket.on(SocketEvent.JOIN_ROOM, (roomId) => {
    try {
      if (rooms[roomId] !== undefined) {
        var userExists = rooms[roomId].participants.some((participant) => participant.userId === socket.userId);
        if (rooms[roomId].host.userId !== socket.userId && !userExists) {
          socket.join(roomId);

          rooms[roomId].participants.push({ userId: socket.userId, name: socket.name });

          let room = rooms[roomId];
          room = { roomId: roomId, ...room };
          io.to(roomId).emit(SocketEvent.ROOM_JOINED, roomId, socket.userId, socket.name, room);
          io.to(roomId).emit(SocketEvent.JOIN_ROOM_NOTIFY, roomId, socket.userId, socket.name, 'joined the room');

          console.log(`\n${socket.userId} joined room ${roomId}...`);
          console.log(room);
        }
      }
    } catch (error) {
      console.log(error);
    }
  });

  // Close room
  socket.on(SocketEvent.CLOSE_ROOM, (roomId) => {
    try {
      if (rooms[roomId].host.userId === socket.userId) {
        io.to(roomId).emit(SocketEvent.ROOM_CLOSED, roomId);

        rooms[roomId].participants.map((participant) => {
          socketList[participant.userId].leave(roomId);
        });

        socket.leave(roomId);

        delete rooms[roomId];

        console.log(rooms);
      }
    } catch (error) {
      console.log(error);
    }
  });

  // Leave room
  socket.on(SocketEvent.LEAVE_ROOM, (roomId, userId) => {
    try {
      let temp = rooms[roomId].participants.filter((item) => item.userId !== userId);
      rooms[roomId].participants = temp;
      io.to(roomId).emit(SocketEvent.LEFT_ROOM, roomId, userId);

      socketList[userId].leave(roomId);

      console.log('\n~~~~~~~~~~User Left the Room~~~~~~~~~~~~~~');
      console.log(rooms[roomId]);
      console.log('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    } catch (error) {
      console.log(error);
    }
  });

  // Save message
  socket.on(SocketEvent.SAVE_MESSAGE, (message_body) => {
    
    const { type, message, userId, name, color, roomId, id } = message_body;
    const messageExists = room_messages.some((existingMessage) => existingMessage.id === message_body.id);

    // Only push the message if the ID is not a duplicate
    if (!messageExists) {
      room_messages.push({ type, message, userId, name, color, roomId, id, created_at: new Date() });
    }

    const specific_room_messages = room_messages.filter((message) => message.roomId === roomId);
    socket.emit(SocketEvent.ROOM_MESSAGE_LIST, specific_room_messages);
  });

  // Send message to specified room
  socket.on(SocketEvent.ROOM_MESSAGE, (roomId, message, messageId) => {
    try {
      io.to(roomId).emit(
        SocketEvent.ROOM_MESSAGE,
        roomId,
        socket.userId,
        socket.name,
        socket.color,
        message,
        messageId,
      );
    } catch (error) {
      console.log(error);
    }
  });

  // Notify in room when someone joins the chat
  socket.on(SocketEvent.JOIN_ROOM_NOTIFY, (roomId, notify_text) => {
    try {
      io.to(roomId).emit(SocketEvent.JOIN_ROOM_NOTIFY, roomId, socket.userId, socket.name, notify_text);
    } catch (error) {
      console.log(error);
    }
  });

  // Acknowledge to room that other client received the notification
  socket.on(SocketEvent.JOIN_ROOM_NOTIFY_ACKNOWLEDGE, (roomId, notify_text) => {
    try {
      console.log('join room notify', roomId, 'notify_text', notify_text);
      io.to(roomId).emit(SocketEvent.JOIN_ROOM_NOTIFY_ACKNOWLEDGE, roomId, socket.userId, socket.name, notify_text);
    } catch (error) {
      console.log(error);
    }
  });

  // Notify in room when someone leaves the chat
  socket.on(SocketEvent.LEAVE_ROOM_NOTIFY, (roomId, notify_text) => {
    try {
      io.to(roomId).emit(SocketEvent.LEAVE_ROOM_NOTIFY, roomId, socket.userId, socket.name, notify_text);
    } catch (error) {
      console.log(error);
    }
  });

  // Notify in room when host removes any participant
  // socket.on(SocketEvent.REMOVED_FROM_ROOM_NOTIFY, (roomId, userId) => {
  //   try {
  //     io.to(roomId).emit(SocketEvent.REMOVED_FROM_ROOM_NOTIFY, roomId, userId, socketList[userId].name);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // });

  // Notify in room when user is typing
  socket.on(SocketEvent.TYPING_ROOM_NOTIFY, (roomId) => {
    try {
      io.to(roomId).emit(SocketEvent.TYPING_ROOM_NOTIFY, roomId, socket.userId, socket.name);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on(SocketEvent.TYPING_STOPPED_ROOM_NOTIFY, (roomId) => {
    try {
      io.to(roomId).emit(SocketEvent.TYPING_STOPPED_ROOM_NOTIFY, roomId, socket.userId);
    } catch (error) {
      console.log(error);
    }
  });

  // Remove socket from all rooms
  const removeSocketFromRooms = (socket) => {
    try {
      let roomsToDelete = [];
      const roomCount = Object.keys(rooms).length;

      for (let i = 0; i < roomCount; i++) {
        let roomId = Object.keys(rooms)[i];

        if (rooms[roomId].host.userId === socket.userId) {
          console.log(rooms[roomId]);
          io.to(roomId).emit(SocketEvent.ROOM_CLOSED, roomId);

          rooms[roomId].participants.map((participant) => {
            socketList[participant.userId].leave(roomId);
          });

          socket.leave(roomId);
          roomsToDelete.push(roomId);
        } else {
          rooms[roomId].participants.map((participant, index) => {
            if (participant.userId === socket.userId) {
              rooms[roomId].participants.splice(index, 1);

              io.to(roomId).emit(SocketEvent.LEFT_ROOM, roomId, socket.userId);

              io.to(roomId).emit(SocketEvent.LEAVE_ROOM_NOTIFY, roomId, socket.userId, socket.name, 'left the room');

              socketList[socket.userId].leave(roomId);
            }
          });
        }
      }
      // Delete all rooms created by disconnected host
      for (let i = 0; i < roomsToDelete.length; i++) {
        delete rooms[roomsToDelete[i]];
      }
      // console.log('---------------------------ROOMS---------------------------');
      // for (let i = 0; i < Object.keys(rooms).length; i++) {
      //   let roomId = Object.keys(rooms)[i];
      //   console.log(rooms[roomId]);
      // }
      // console.log('-----------------------------------------------------------');
    } catch (error) {
      console.log(error);
    }
  };

  // Remove socket on server
  const removeSocket = (socket) => {
    try {
      users = users.filter((user) => user.userId !== socket.userId);
      delete socketList[socket.userId];
      io.emit(SocketEvent.LEAVE_NOTIFY, socket.userId, socket.name);
      io.emit('user_disconnected', socket.userId);
      // updateUsernames();
      console.log(`\n${socket.name} (${socket.userId}) disconnected`);
    } catch (error) {
      console.log(error);
    }
  };

  // Remove socket when client disconnects
  socket.on(SocketEvent.DISCONNECT, (data) => {
    removeSocketFromRooms(socket);
    removeSocket(socket);
  });
});

/***************************************************************************/

app.get('/api', (req, res) => {
  console.log('PING RECEIVED');
  res.send('success');
});

console.log('NODE_ENV: ', process.env.NODE_ENV);

// Serve static assets in production
if (process.env.NODE_ENV === 'production' || true) {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// const PORT = process.env.PORT || 3001;
const PORT = 80;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));

/***************************************************************************/
