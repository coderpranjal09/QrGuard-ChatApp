const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Enhanced CORS configuration
const corsOptions = {
  origin: ['https://qrguard-chat.netlify.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Use CORS middleware
app.use(cors(corsOptions));

// Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qrguard';

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
  console.log('✅ Connected to MongoDB');
});

// Test route to verify CORS
app.get('/api/test-cors', (req, res) => {
  res.json({
    message: 'CORS is working!',
    timestamp: new Date().toISOString(),
    allowedOrigins: corsOptions.origin
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'QR Guard Backend API is working!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Import Routes
const chatRoutes = require('./routes/chatRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');

// Use Routes
app.use('/api/chats', chatRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Socket.io setup with CORS
const io = socketIo(server, {
  cors: {
    origin: corsOptions.origin,
    methods: corsOptions.methods,
    credentials: corsOptions.credentials
  }
});

const Chat = require('./models/Chat');
const { v4: uuidv4 } = require('uuid');

// Store active chat timers
const chatTimers = new Map();
// socket setup in server.js - UPDATED SOCKET HANDLERS
io.on('connection', (socket) => {
  console.log('✅ New client connected:', socket.id);
  
  // Join chat room
  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
    console.log(`✅ Socket ${socket.id} joined chat: ${chatId}`);
  });

  // Send message - FIXED TO PREVENT DUPLICATES
  socket.on('send-message', async (data) => {
    try {
      console.log('📨 Received message data:', data);
      
      const { chatId, senderType, content, language, isPredefined, sessionId } = data;
      
      if (!chatId || !senderType || !content || !sessionId) {
        console.error('❌ Missing required fields:', { chatId, senderType, content, sessionId });
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }
      
      const chat = await Chat.findOne({ chatId });
      if (!chat) {
        console.error('❌ Chat not found:', chatId);
        socket.emit('error', { message: 'Chat not found' });
        return;
      }

      if (chat.status !== 'active') {
        console.error('❌ Chat not active:', chat.status);
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
        sessionId: sessionId || 'unknown',
        timestamp: new Date()
      };
      
      console.log('💾 Saving message to DB:', message);
      
      chat.messages.push(message);
      await chat.save();
      
      console.log('✅ Message saved to DB:', messageId);
      
      // Create response with chatId included for frontend
      const responseMessage = {
        ...message,
        chatId: chatId // Include chatId in response
      };
      
      // Emit to all in the chat room
      io.to(chatId).emit('receive-message', responseMessage);
      
    } catch (error) {
      console.error('❌ Error sending message:', error.message);
      console.error('Full error:', error);
      socket.emit('error', { message: 'Failed to send message: ' + error.message });
    }
  });

  // Handle mobile request from owner
  socket.on('request-mobile', async ({ chatId, requestId, requestedBy }) => {
    try {
      console.log(`📱 Mobile request for chat: ${chatId}`);
      
      // Emit to all except sender (owner emits, reporter receives)
      socket.to(chatId).emit('mobile-requested', { 
        chatId, 
        requestId, 
        requestedBy 
      });
    } catch (error) {
      console.error('❌ Error handling mobile request:', error);
    }
  });

  // Handle mobile response from reporter
  socket.on('respond-mobile', async ({ chatId, requestId, status, mobileNumber }) => {
    try {
      console.log(`📱 Mobile response for chat: ${chatId}`, { status });
      
      // Emit to all in chat room
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

  // Handle mobile request
  socket.on('request-mobile', async ({ chatId }) => {
    try {
      console.log(`📱 Mobile request for chat: ${chatId}`);
      
      const chat = await Chat.findOne({ chatId });
      if (chat) {
        chat.requester.mobileRequested = true;
        await chat.save();
        
        // Emit to all except sender
        socket.to(chatId).emit('mobile-requested', { chatId });
      }
    } catch (error) {
      console.error('❌ Error handling mobile request:', error);
    }
  });

  // Handle mobile approval
  socket.on('approve-mobile', async ({ chatId, mobileNumber }) => {
    try {
      console.log(`✅ Mobile approved for chat: ${chatId}`);
      
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

  // Handle chat approval
  socket.on('chat-approved', async ({ chatId, ownerName, ownerSessionId }) => {
    try {
      console.log(`✅ Chat approved: ${chatId}`);
      
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

  // Handle chat end
  socket.on('end-chat', async ({ chatId }) => {
    try {
      console.log(`⏹️ Chat ended: ${chatId}`);
      
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌐 Allowed Origins: ${corsOptions.origin.join(', ')}`);
  console.log(`🗄️  MongoDB URI: ${MONGODB_URI}`);
  console.log(`🕐 Server started at: ${new Date().toISOString()}`);
});