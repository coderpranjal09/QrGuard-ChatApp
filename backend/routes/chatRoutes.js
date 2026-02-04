// routes/chatRoutes.js - COMPLETE FIXED FILE
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Create a new chat request
router.post('/create', chatController.createChatRequest);

// Get chat requests for a vehicle
router.get('/requests/:vehicleNumber', chatController.getChatRequests);

// Approve a chat request
router.post('/approve/:chatId', chatController.approveChatRequest);

// Request mobile number
router.post('/request-mobile/:chatId', chatController.requestMobileNumber);

// Approve and share mobile number
router.post('/approve-mobile/:chatId', chatController.approveMobileNumber);

// End chat
router.post('/end-chat/:chatId', chatController.endChat);

// Get chat details
router.get('/:chatId', chatController.getChatDetails);

// Send message - ADD THIS LINE
router.post('/:chatId/message', chatController.sendMessage);

module.exports = router;