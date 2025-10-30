import express from 'express';
import postRoute from './routes/post.route.js';
import authRouter from './routes/auth.route.js';
import testRouter from './routes/test.route.js';
import userRoute from './routes/user.route.js';
import chatRoute from './routes/chat.route.js';
import messageRoute from './routes/message.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

let onlineUser = [];
const addUser = (userId, socketId) => {
  const userExits = onlineUser.find((user) => user.userId === userId);

  if (!userExits) {
    onlineUser.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUser.find((user) => user.userId === userId);
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('newUser', (userId) => {
    addUser(userId, socket.id);

    console.log(onlineUser);
  });

  socket.on('sendMessage', ({ receiverId, data }) => {
    // console.log(receiverId, 'receiverId');
    // console.log(data, 'data');
    const receiver = getUser(receiverId);

    io.to(receiver.socketId).emit('getMessage', data);
  });

  socket.on('disconnect', () => {
    removeUser(socket.id);
  });
});

app.use(
  cors({
    origin: ['https://lamaesate-front.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/users', userRoute);
app.use('/api/posts', postRoute);
app.use('/api/test', testRouter);
app.use('/api/chats', chatRoute);
app.use('/api/messages', messageRoute);

const PORT = process.env.PORT || 8800;

server.listen(PORT, () => {
  console.log(`Server + Socket.IO running on port ${PORT}`);
});
export { io };
