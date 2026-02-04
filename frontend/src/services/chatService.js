// services/chatService.js - UPDATED VERSION
import { api } from './api'

export const chatService = {
  createChatRequest: (vehicleNumber) => 
    api.post('/chats/create', { vehicleNumber }),

  getChatRequests: (vehicleNumber) => 
    api.get(`/chats/requests/${vehicleNumber}`),

  approveChatRequest: (chatId, ownerName) => 
    api.post(`/chats/approve/${chatId}`, { 
      ownerName, 
      ownerSessionId: `owner_${Date.now()}` 
    }),

  requestMobileNumber: (chatId) => 
    api.post(`/chats/request-mobile/${chatId}`),

  approveMobileNumber: (chatId, mobileNumber) => 
    api.post(`/chats/approve-mobile/${chatId}`, { mobileNumber }),

  endChat: (chatId) => 
    api.post(`/chats/end-chat/${chatId}`),

  getChatDetails: (chatId) => 
    api.get(`/chats/${chatId}`),

  // REMOVE THIS - we're using socket-only for messages
  // sendMessage: (chatId, messageData) =>
  //   api.post(`/chats/${chatId}/message`, messageData),

  getVehicleChats: (vehicleNumber) => 
    api.get(`/vehicles/${vehicleNumber}/chats`),
}