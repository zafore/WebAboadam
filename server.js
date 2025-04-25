const express =  require('express');
const http=require('http');
const socketIo=require('socket.io');
const  mongoose= require('mongoose');
const Message =require('./models/Message');

const app=express();
const server=http.createServer(app);
const io =  socketIo(server);

// mongodb://localhost:27017
// MongoDB connection
mongoose.connect('mongodb://localhost:27017/chatDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Serve static files (optional)
app.use(express.static('public'));

// Socket.IO events
io.on('connection', async (socket) => {
  console.log('User connected:', socket.id);

  // Send existing messages to the new client
  const messages = await Message.find().sort({ timestamp: 1 }).limit(100);
  socket.emit('chat history', messages);

  // Handle incoming chat messages
  socket.on('chat message', async (data) => {
    const msg = new Message(data);
    await msg.save();

    io.emit('chat message', msg); // Broadcast to all clients
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
server.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});