const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

const users = new Map();

io.on('connection', (socket) => {
  console.log('📱 Новое подключение:', socket.id);

  socket.on('set-phone', (phone) => {
    users.set(phone, socket.id);
    console.log(`📞 ${phone} подключён`);
  });

  socket.on('send-message', ({ from, to, text }) => {
    const targetSocketId = users.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('receive-message', { from, text });
      console.log(`📨 От ${from} → ${to}: ${text}`);
    } else {
      console.log(`❌ Пользователь ${to} не в сети`);
    }
  });

  socket.on('disconnect', () => {
    for (let [phone, id] of users.entries()) {
      if (id === socket.id) {
        users.delete(phone);
        console.log(`📴 ${phone} отключён`);
        break;
      }
    }
  });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Сервер запущен на http://ВАШ_IP:3000`);
  console.log(`💡 Подсказка: узнайте свой IP командой 'ipconfig'`);
});