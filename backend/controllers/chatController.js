const Chat = require('../models/Chat');
const { v4: uuidv4 } = require('uuid');

const chatController = {
  createChatRequest: async (req, res) => {
    try {
      const { vehicleNumber } = req.body;
      
      if (!vehicleNumber || vehicleNumber.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Vehicle number is required'
        });
      }
      
      const vehicle = vehicleNumber.trim().toUpperCase();
      
      // FIRST: Check if there's an active chat for this vehicle
      const existingChat = await Chat.findOne({
        vehicleNumber: vehicle,
        status: 'active',
        expiresAt: { $gt: new Date() } // Not expired
      });
      
      let chat;
      let isExisting = false;
      const sessionId = uuidv4();
      
      if (existingChat) {
        // JOIN EXISTING ACTIVE CHAT
        chat = existingChat;
        isExisting = true;
        
        // Update requester session
        chat.requester.sessionId = sessionId;
        chat.reporterSessionId = sessionId;
        chat.lastActivity = new Date();
        
        // Add system message
        chat.messages.push({
          _id: uuidv4(),
          senderType: 'system',
          content: '🔄 New reporter joined the chat',
          sessionId: 'system',
          timestamp: new Date()
        });
        
        await chat.save();
        
        return res.status(200).json({
          success: true,
          chatId: chat.chatId,
          sessionId: sessionId,
          message: 'Joined existing active chat',
          isExisting: true
        });
      }
      
      // CREATE NEW CHAT (no active chat found)
      const chatId = uuidv4();
      
      chat = new Chat({
        chatId: chatId,
        vehicleNumber: vehicle,
        requester: {
          sessionId: sessionId
        },
        reporterSessionId: sessionId,
        status: 'active', // CHANGED: Direct active, no pending
        lastActivity: new Date()
      });
      
      await chat.save();
      
      res.status(201).json({
        success: true,
        chatId: chat.chatId,
        sessionId: sessionId,
        message: 'Chat created successfully',
        isExisting: false
      });
    } catch (error) {
      console.error('❌ Error creating chat request:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  getChatRequests: async (req, res) => {
    try {
      const vehicleNumber = req.params.vehicleNumber;
      
      if (!vehicleNumber) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle number is required'
        });
      }
      
      // CHANGED: Get active chats instead of pending
      const activeChats = await Chat.find({
        vehicleNumber: vehicleNumber.toUpperCase(),
        status: 'active'
      }).select('chatId createdAt requester.name requester.mobileRequested isOwnerJoined');
      
      res.json({
        success: true,
        chats: activeChats // CHANGED: renamed from requests to chats
      });
    } catch (error) {
      console.error('❌ Error fetching chat requests:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  approveChatRequest: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { ownerName } = req.body;
      
      const chat = await Chat.findOne({ chatId });
      
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat request not found'
        });
      }
      
      // CHANGED: Allow owner to join even if already joined before
      const ownerSessionId = uuidv4();
      const isFirstTimeJoin = !chat.isOwnerJoined;
      
      chat.isOwnerJoined = true;
      chat.owner = {
        name: ownerName || '',
        sessionId: ownerSessionId,
        joinedAt: new Date()
      };
      chat.lastActivity = new Date();
      
      // Add appropriate system message
      chat.messages.push({
        _id: uuidv4(),
        senderType: 'system',
        content: isFirstTimeJoin ? '✅ Vehicle owner joined the chat' : '🔄 Vehicle owner rejoined',
        sessionId: 'system',
        timestamp: new Date()
      });
      
      await chat.save();
      
      res.json({
        success: true,
        message: isFirstTimeJoin ? 'Joined chat as owner' : 'Rejoined chat',
        chat: {
          chatId: chat.chatId,
          vehicleNumber: chat.vehicleNumber,
          sessionId: ownerSessionId,
          isOwnerJoined: true
        }
      });
    } catch (error) {
      console.error('❌ Error approving chat request:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  requestMobileNumber: async (req, res) => {
    try {
      const { chatId } = req.params;
      
      const chat = await Chat.findOne({ chatId });
      
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }
      
      chat.requester.mobileRequested = true;
      chat.lastActivity = new Date();
      
      // Add system message
      chat.messages.push({
        _id: uuidv4(),
        senderType: 'system',
        content: '📱 Reporter requested mobile number',
        sessionId: 'system',
        timestamp: new Date()
      });
      
      await chat.save();
      
      res.json({
        success: true,
        message: 'Mobile number request sent'
      });
    } catch (error) {
      console.error('❌ Error requesting mobile number:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  approveMobileNumber: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { mobileNumber } = req.body;
      
      if (!mobileNumber || !mobileNumber.match(/^\d{10}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Valid 10-digit mobile number is required'
        });
      }
      
      const chat = await Chat.findOne({ chatId });
      
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }
      
      chat.requester.mobileNumber = mobileNumber;
      chat.requester.mobileApproved = true;
      chat.lastActivity = new Date();
      
      // Add system message
      chat.messages.push({
        _id: uuidv4(),
        senderType: 'system',
        content: '✅ Mobile number shared',
        sessionId: 'system',
        timestamp: new Date()
      });
      
      await chat.save();
      
      res.json({
        success: true,
        message: 'Mobile number approved and shared'
      });
    } catch (error) {
      console.error('❌ Error approving mobile number:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  endChat: async (req, res) => {
    try {
      const { chatId } = req.params;
      
      const chat = await Chat.findOne({ chatId });
      
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }
      
      chat.status = 'completed';
      chat.lastActivity = new Date();
      
      // Add system message
      chat.messages.push({
        _id: uuidv4(),
        senderType: 'system',
        content: '🔒 Chat ended',
        sessionId: 'system',
        timestamp: new Date()
      });
      
      await chat.save();
      
      res.json({
        success: true,
        message: 'Chat ended successfully'
      });
    } catch (error) {
      console.error('❌ Error ending chat:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  getChatDetails: async (req, res) => {
    try {
      const { chatId } = req.params;
      
      const chat = await Chat.findOne({ chatId });
      
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }
      
      res.json({
        success: true,
        chat
      });
    } catch (error) {
      console.error('❌ Error fetching chat details:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  sendMessage: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { content, language = 'en', isPredefined = false, senderType, sessionId } = req.body;
      
      console.log('📨 Sending message to chat:', chatId, { content, senderType });
      
      if (!content || !senderType || !sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Content, senderType and sessionId are required'
        });
      }
      
      const chat = await Chat.findOne({ chatId });
      
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }
      
      if (chat.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Chat is not active'
        });
      }
      
      // Create message object
      const message = {
        _id: uuidv4(),
        chatId: chatId,
        senderType: senderType,
        content: content.trim(),
        language: language,
        isPredefined: isPredefined,
        sessionId: sessionId,
        timestamp: new Date()
      };
      
      // Add message to chat
      chat.messages.push(message);
      chat.lastActivity = new Date();
      await chat.save();
      
      console.log('✅ Message saved:', message._id);
      
      res.json({
        success: true,
        message: 'Message sent successfully',
        messageData: message
      });
    } catch (error) {
      console.error('❌ Error sending message:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // NEW: Check if owner can rejoin
  checkOwnerAccess: async (req, res) => {
    try {
      const { chatId } = req.params;
      
      const chat = await Chat.findOne({ chatId });
      
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }
      
      // Owner can rejoin if:
      // 1. Chat is active
      // 2. Not expired
      // 3. Owner was previously joined (isOwnerJoined = true)
      const canRejoin = chat.status === 'active' && 
                       chat.expiresAt > new Date() && 
                       chat.isOwnerJoined === true;
      
      res.json({
        success: true,
        canRejoin,
        chatStatus: chat.status,
        isOwnerJoined: chat.isOwnerJoined,
        expiresAt: chat.expiresAt
      });
    } catch (error) {
      console.error('❌ Error checking owner access:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // NEW: Get active chat for vehicle
  getActiveChatForVehicle: async (req, res) => {
    try {
      const vehicleNumber = req.params.vehicleNumber?.toUpperCase();
      
      if (!vehicleNumber) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle number is required'
        });
      }
      
      const activeChat = await Chat.findOne({
        vehicleNumber: vehicleNumber,
        status: 'active',
        expiresAt: { $gt: new Date() }
      }).sort({ createdAt: -1 });
      
      if (!activeChat) {
        return res.status(404).json({
          success: false,
          message: 'No active chat found'
        });
      }
      
      res.json({
        success: true,
        chat: {
          chatId: activeChat.chatId,
          vehicleNumber: activeChat.vehicleNumber,
          status: activeChat.status,
          isOwnerJoined: activeChat.isOwnerJoined,
          createdAt: activeChat.createdAt
        }
      });
    } catch (error) {
      console.error('❌ Error fetching active chat:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = chatController;