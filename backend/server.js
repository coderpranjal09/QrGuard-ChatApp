const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// ===== CORS CONFIGURATION =====
const corsOptions = {
  origin: ['https://qrguard-chat.netlify.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== DATABASE CONNECTION (FIXED) =====
const MONGODB_URI = process.env.MONGODB_URI;

console.log("🗄️ Loaded MongoDB URI from ENV:", MONGODB_URI ? "FOUND" : "NOT FOUND");

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not defined in environment variables!");
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('✅ MongoDB connection open');
});

// ===== TEST ROUTES =====
app.get('/api/test-cors', (req, res) => {
  res.json({
    message: 'CORS is working!',
    timestamp: new Date().toISOString(),
    allowedOrigins: corsOptions.origin
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'QR Guard Backend API is working!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ===== IMPORT ROUTES =====
const chatRoutes = require('./routes/chatRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');

app.use('/api/chats', chatRoutes);
app.use('/api/vehicles', vehicleRoutes);

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    uptime: process.uptime()
  });
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ===== SOCKET.IO CONFIG (FULLY FIXED FOR RENDER) =====
const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

const Chat = require('./models/Chat');
const { v4: uuidv4 } = require('uuid');

const chatTimers = new Map();

// ===== SOCKET LOGIC (ALL YOUR FEATURES KEPT) =====
io.on('connection', (socket) => {
  console.log('✅ New client connected:', socket.id);
  console.log("🔌 Transport:", socket.conn.transport.name);

  socket.conn.on("upgrade", (transport) => {
    console.log("⬆️ Transport upgraded to:", transport.name);
  });

  // Join chat room
  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
    console.log(`✅ Socket ${socket.id} joined chat: ${chatId}`);
  });

  // Send message
  socket.on('send-message', async (data) => {
    try {
      console.log('📨 Received message data:', data);
      
      const { chatId, senderType, content, language, isPredefined, sessionId } = data;
      
      if (!chatId || !senderType || !content || !sessionId) {
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }
      
      const chat = await Chat.findOne({ chatId });
      if (!chat) {
        socket.emit('error', { message: 'Chat not found' });
        return;
      }

      if (chat.status !== 'active') {
        socket.emit('error', { message: 'Chat is not active' });
        return;
      }

      const messageId = uuidv4();
      const message = {
        _id: messageId,
        senderType,
        content: content.trim(),
        language: language || 'en',
        isPredefined: isPredefined || false,
        sessionId,
        timestamp: new Date()
      };
      
      chat.messages.push(message);
      await chat.save();
      
      io.to(chatId).emit('receive-message', {
        ...message,
        chatId
      });
      
    } catch (error) {
      console.error('❌ Error sending message:', error.message);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Mobile request
  socket.on('request-mobile', async ({ chatId, requestId, requestedBy }) => {
    try {
      socket.to(chatId).emit('mobile-requested', { 
        chatId, 
        requestId, 
        requestedBy 
      });
    } catch (error) {
      console.error('❌ Error handling mobile request:', error);
    }
  });

  // Mobile response
  socket.on('respond-mobile', async ({ chatId, requestId, status, mobileNumber }) => {
    try {
      io.to(chatId).emit('mobile-responded', { 
        chatId, 
        requestId, 
        status,
        mobileNumber: status === 'approved' ? mobileNumber : undefined
      });
    } catch (error) {
      console.error('❌ Error handling mobile response:', error);
    }
  });

  // Approve mobile
  socket.on('approve-mobile', async ({ chatId, mobileNumber }) => {
    try {
      const chat = await Chat.findOne({ chatId });
      if (chat) {
        chat.requester.mobileNumber = mobileNumber;
        chat.requester.mobileApproved = true;
        await chat.save();
        
        io.to(chatId).emit('mobile-approved', { chatId, mobileNumber });
      }
    } catch (error) {
      console.error('❌ Error approving mobile:', error);
    }
  });

  // Chat approval
  socket.on('chat-approved', async ({ chatId, ownerName, ownerSessionId }) => {
    try {
      const chat = await Chat.findOne({ chatId });
      if (chat) {
        chat.status = 'active';
        chat.owner = {
          name: ownerName,
          sessionId: ownerSessionId
        };
        await chat.save();
        
        io.to(chatId).emit('chat-approved', { 
          chatId, 
          ownerName, 
          ownerSessionId 
        });
      }
    } catch (error) {
      console.error('❌ Error approving chat:', error);
    }
  });

  // End chat
  socket.on('end-chat', async ({ chatId }) => {
    try {
      const chat = await Chat.findOne({ chatId });
      if (chat && chat.status === 'active') {
        chat.status = 'completed';
        await chat.save();
        
        if (chatTimers.has(chatId)) {
          clearTimeout(chatTimers.get(chatId));
          chatTimers.delete(chatId);
        }
        
        io.to(chatId).emit('chat-ended', { chatId });
      }
    } catch (error) {
      console.error('❌ Error ending chat:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌐 Allowed Origins: ${corsOptions.origin.join(', ')}`);
  console.log(`🕐 Server started at: ${new Date().toISOString()}`);
});
