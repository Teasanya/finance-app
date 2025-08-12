const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

const storedData = {
  table: [
    // ['2025-08-10', 0, 50000, 0, 0],
    // ['2025-08-11', 0, 0, 80000, 120000],
  ],
  messages: [],
  users: new Map(),
};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('chat_message', (payload) => {
    console.log(payload);
    const newMessage = {
      text: payload.text,
      userId: socket.id,
      timestamp: new Date().toISOString(),
    };

    storedData.messages.push(newMessage);
    io.emit('new_message', newMessage);
  });

  socket.emit('init_data', {
    table: storedData.table,
    messages: storedData.messages.map((msg) => ({
      text: msg.text,
      timestamp: msg.timestamp,
      userId: msg.userId,
    })),
  });

  socket.on('table_update', (payload) => {
    storedData.table = payload;
    socket.broadcast.emit('table_update', payload);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(3000, () => {
  console.log('Socket.IO server running on http://localhost:3000');
});
