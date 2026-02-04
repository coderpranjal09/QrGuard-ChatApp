const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');

// Optional: Vehicle-related routes if needed
router.get('/:vehicleNumber/chats', async (req, res) => {
  try {
    const vehicleNumber = req.params.vehicleNumber.toUpperCase();
    
    const chats = await Chat.find({ vehicleNumber })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      chats
    });
  } catch (error) {
    console.error('Error fetching vehicle chats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;