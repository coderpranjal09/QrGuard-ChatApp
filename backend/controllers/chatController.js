// controllers/chatController.js - COMPLETE FIXED FILE
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
      
      // Generate session ID for requester
      const sessionId = uuidv4();
      const chatId = uuidv4();
      
      // Create chat with uppercase vehicle number
      const chat = new Chat({
        chatId: chatId,
        vehicleNumber: vehicleNumber,
        requester: {
          sessionId: sessionId
        },
        status: 'pending'
      });
      
      await chat.save();
      
      res.status(201).json({
        success: true,
        chatId: chat.chatId,
        sessionId: sessionId,
        message: 'Chat request created successfully'
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
      
      const requests = await Chat.find({
        vehicleNumber: vehicleNumber.toUpperCase(),
        status: 'pending'
      }).select('chatId createdAt requester.name requester.mobileRequested');
      
      res.json({
        success: true,
        requests
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
      const { ownerName, ownerSessionId } = req.body;
      
      const chat = await Chat.findOne({ chatId });
      
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat request not found'
        });
      }
      
      if (chat.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Chat request is no longer pending'
        });
      }
      
      chat.status = 'active';
      chat.owner = {
        name: ownerName || '',
        sessionId: ownerSessionId || uuidv4()
      };
      
      await chat.save();
      
      res.json({
        success: true,
        message: 'Chat approved successfully',
        chat: {
          chatId: chat.chatId,
          vehicleNumber: chat.vehicleNumber,
          status: chat.status
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

  // ADD THIS NEW FUNCTION - Send Message
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
  }
};

module.exports = chatController;