const mongoose = require('mongoose');

// Define message schema WITHOUT chatId in individual messages
const messageSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    default: () => require('uuid').v4()
  },
  senderType: {
    type: String,
    enum: ['requester', 'owner', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['en', 'hi'],
    default: 'en'
  },
  isPredefined: {
    type: Boolean,
    default: false
  },
  sessionId: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const chatSchema = new mongoose.Schema({
  chatId: {
    type: String,
    unique: true,
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'expired', 'rejected'],
    default: 'active' // CHANGED: Default to active
  },
  requester: {
    sessionId: {
      type: String,
      required: true
    },
    name: String,
    mobileNumber: String,
    mobileRequested: {
      type: Boolean,
      default: false
    },
    mobileApproved: {
      type: Boolean,
      default: false
    }
  },
  owner: {
    sessionId: String,
    name: String,
    joinedAt: Date
  },
  // NEW FIELDS:
  isOwnerJoined: {
    type: Boolean,
    default: false
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  reporterSessionId: {
    type: String,
    default: ''
  },
  // END NEW FIELDS
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 20 * 60 * 1000) // 20 minutes
  }
});

// Create indexes for better performance
chatSchema.index({ chatId: 1 }, { unique: true });
chatSchema.index({ vehicleNumber: 1 });
chatSchema.index({ status: 1 });
chatSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Chat', chatSchema);