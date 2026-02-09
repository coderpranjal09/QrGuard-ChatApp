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

// ===== DATABASE CONNECTION =====
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

// ===== SOCKET.IO CONFIG (FIXED FOR REAL-TIME) =====
const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true
  }
});

const Chat = require('./models/Chat');
const { v4: uuidv4 } = require('uuid');

// Store active socket connections
const activeConnections = new Map();
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('✅ New client connected:', socket.id, 'Transport:', socket.conn.transport.name);
  
  activeConnections.set(socket.id, socket);
  
  socket.conn.on("upgrade", (transport) => {
    console.log("⬆️ Transport upgraded to:", transport.name);
  });

  // Handle chat room joining
  socket.on('join-chat', async (data) => {
    try {
      const { chatId, sessionId } = data;
      
      if (!chatId) {
        socket.emit('error', { message: 'Chat ID is required' });
        return;
      }
      
      socket.join(chatId);
      console.log(`✅ Socket ${socket.id} joined chat: ${chatId}`);
      
      if (sessionId) {
        userSockets.set(sessionId, socket.id);
      }
      
      socket.emit('joined-chat', { 
        chatId, 
        success: true,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Error joining chat:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  // Send message - FIXED VERSION
  socket.on('send-message', async (data) => {
    try {
      console.log('📨 [SERVER] Received message:', {
        chatId: data.chatId,
        senderType: data.senderType,
        contentLength: data.content?.length,
        sessionId: data.sessionId
      });
      
      const { chatId, senderType, content, language, isPredefined, sessionId } = data;
      
      // Validation
      if (!chatId || !senderType || !content || !sessionId) {
        console.error('❌ Missing required fields:', { chatId, senderType, content, sessionId });
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }
      
      if (typeof content !== 'string' || content.trim() === '') {
        socket.emit('error', { message: 'Message content cannot be empty' });
        return;
      }
      
      const chat = await Chat.findOne({ chatId });
      if (!chat) {
        console.error('❌ Chat not found:', chatId);
        socket.emit('error', { message: 'Chat not found' });
        return;
      }

      if (chat.status !== 'active') {
        console.error('❌ Chat not active:', chatId, 'Status:', chat.status);
        socket.emit('error', { message: 'Chat is not active' });
        return;
      }

      // Create and save message
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
      
      // Save to database
      chat.messages.push(message);
      chat.lastActivity = new Date();
      await chat.save();
      
      console.log('✅ [SERVER] Message saved to DB:', messageId);
      
      // Broadcast to ALL clients in the chat room (including sender)
      io.to(chatId).emit('receive-message', {
        ...message,
        chatId,
        fromSocketId: socket.id,
        saved: true,
        broadcastedAt: new Date().toISOString()
      });
      
      console.log(`📤 [SERVER] Message broadcasted to room ${chatId}, ${io.sockets.adapter.rooms.get(chatId)?.size || 0} clients`);
      
    } catch (error) {
      console.error('❌ [SERVER] Error sending message:', error.message, error.stack);
      socket.emit('error', { 
        message: 'Failed to send message',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Mobile request
  socket.on('request-mobile', async (data) => {
    try {
      const { chatId } = data;
      console.log('📱 Mobile request for chat:', chatId);
      
      socket.to(chatId).emit('mobile-requested', { 
        ...data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error handling mobile request:', error);
    }
  });

  // Mobile response
  socket.on('respond-mobile', async (data) => {
    try {
      const { chatId } = data;
      console.log('📱 Mobile response for chat:', chatId);
      
      io.to(chatId).emit('mobile-responded', { 
        ...data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error handling mobile response:', error);
    }
  });

  // Approve mobile
  socket.on('approve-mobile', async (data) => {
    try {
      const { chatId, mobileNumber } = data;
      console.log('✅ Approving mobile for chat:', chatId);
      
      const chat = await Chat.findOne({ chatId });
      if (chat) {
        chat.requester.mobileNumber = mobileNumber;
        chat.requester.mobileApproved = true;
        chat.lastActivity = new Date();
        await chat.save();
        
        io.to(chatId).emit('mobile-approved', { 
          chatId, 
          mobileNumber,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Error approving mobile:', error);
    }
  });

  // Chat approval
  socket.on('chat-approved', async (data) => {
    try {
      const { chatId, ownerName, ownerSessionId } = data;
      console.log('✅ Chat approved:', chatId);
      
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
          ownerSessionId,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Error approving chat:', error);
    }
  });

  // End chat
  socket.on('end-chat', async (data) => {
    try {
      const { chatId } = data;
      console.log('⏹️ Ending chat:', chatId);
      
      const chat = await Chat.findOne({ chatId });
      if (chat && chat.status === 'active') {
        chat.status = 'completed';
        await chat.save();
        
        io.to(chatId).emit('chat-ended', { 
          chatId,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Error ending chat:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log('❌ Client disconnected:', socket.id, 'Reason:', reason);
    
    // Clean up
    activeConnections.delete(socket.id);
    
    // Remove from userSockets
    for (const [sessionId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(sessionId);
        break;
      }
    }
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
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