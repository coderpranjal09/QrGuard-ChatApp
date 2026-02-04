// hooks/useChat.js - COMPLETE FIXED VERSION
import { useState, useEffect, useCallback } from 'react'
import { useSocket } from '../contexts/SocketContext'
import { chatService } from '../services/chatService'
import { toast } from 'react-hot-toast'

export const useChat = (chatId) => {
  const [chat, setChat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { socket, joinChat, isConnected } = useSocket()

  const loadChat = useCallback(async () => {
    if (!chatId) return

    try {
      setLoading(true)
      setError(null)
      console.log('📡 Loading chat:', chatId)
      const response = await chatService.getChatDetails(chatId)
      setChat(response.chat)
      
      // Join chat room with session if chat is active
      if (response.chat.status === 'active') {
        const sessionId = localStorage.getItem('qrguard_session')
        if (socket && sessionId) {
          console.log(`🎯 Joining chat ${chatId} as ${response.chat.status}`)
          joinChat(chatId)
        }
      }
    } catch (err) {
      setError(err.message)
      toast.error('Failed to load chat')
      console.error('Error loading chat:', err)
    } finally {
      setLoading(false)
    }
  }, [chatId, socket, joinChat])

  useEffect(() => {
    loadChat()
    
    if (!socket) {
      console.log('⚠️ Socket not available')
      return
    }

    // Flag to prevent duplicate processing
    const processingFlags = new Set()

    const handleNewMessage = (message) => {
      console.log('📨 New message via WebSocket:', message)
      
      // Only process if message belongs to current chat
      if (message.chatId !== chatId) {
        console.log('⚠️ Message for different chat, ignoring')
        return
      }
      
      // Prevent duplicate processing
      const messageKey = `${message.chatId}_${message._id || message.content}_${message.timestamp}`
      if (processingFlags.has(messageKey)) {
        console.log('⚠️ Already processing this message, skipping')
        return
      }
      
      processingFlags.add(messageKey)
      
      setChat(prev => {
        if (!prev) return prev
        
        // Check if message already exists
        const messageExists = prev.messages?.some(m => {
          // Check by ID
          if (m._id === message._id) return true
          // Check by content and timestamp (for temp messages)
          if (m.content === message.content && 
              new Date(m.timestamp).getTime() === new Date(message.timestamp).getTime()) {
            return true
          }
          return false
        })
        
        if (messageExists) {
          console.log('⚠️ Message already exists, skipping')
          return prev
        }
        
        console.log('✅ Adding new message to chat')
        return {
          ...prev,
          messages: [...(prev?.messages || []), {
            ...message,
            timestamp: new Date(message.timestamp)
          }]
        }
      })
      
      // Clean up processing flag after 1 second
      setTimeout(() => {
        processingFlags.delete(messageKey)
      }, 1000)
    }

    const handleChatEnded = (data) => {
      if (data.chatId === chatId) {
        console.log('⏹️ Chat ended:', chatId)
        setChat(prev => ({ 
          ...prev, 
          status: 'completed',
          endedAt: new Date().toISOString()
        }))
        toast.success('Chat ended')
      }
    }

    const handleChatApproved = (data) => {
      if (data.chatId === chatId) {
        console.log('✅ Chat approved:', chatId)
        setChat(prev => ({
          ...prev,
          status: 'active',
          owner: {
            ...prev.owner,
            name: data.ownerName,
            sessionId: data.ownerSessionId
          }
        }))
        toast.success('Chat approved! You can now start chatting.')
        
        // If current user is owner, join the chat
        const userType = localStorage.getItem('qrguard_userType')
        if (userType === 'owner') {
          const sessionId = localStorage.getItem('qrguard_session')
          if (sessionId) {
            joinChat(chatId)
          }
        }
      }
    }

    const handleMobileRequested = (data) => {
      if (data.chatId === chatId) {
        console.log('📱 Mobile requested:', chatId)
        setChat(prev => ({
          ...prev,
          requester: {
            ...prev.requester,
            mobileRequested: true
          }
        }))
        toast.info('📱 Reporter has requested your mobile number', {
          duration: 5000,
          id: `mobile-requested-${chatId}` // Unique ID to prevent duplicates
        })
      }
    }

    const handleMobileApproved = (data) => {
      if (data.chatId === chatId) {
        console.log('✅ Mobile approved:', chatId)
        setChat(prev => ({
          ...prev,
          requester: {
            ...prev.requester,
            mobileApproved: true,
            mobileNumber: data.mobileNumber
          }
        }))
        toast.success('✅ Mobile number shared successfully', {
          duration: 4000,
          id: `mobile-approved-${chatId}` // Unique ID to prevent duplicates
        })
      }
    }

    const handleChatExpired = (data) => {
      if (data.chatId === chatId) {
        console.log('⌛ Chat expired:', chatId)
        setChat(prev => ({ 
          ...prev, 
          status: 'expired'
        }))
        toast.info('Chat session has expired', {
          id: `chat-expired-${chatId}`
        })
      }
    }

    // Remove existing listeners first to prevent duplicates
    socket.off('receive-message')
    socket.off('chat-ended')
    socket.off('chat-approved')
    socket.off('mobile-requested')
    socket.off('mobile-approved')
    socket.off('chat-expired')

    // Add new listeners
    socket.on('receive-message', handleNewMessage)
    socket.on('chat-ended', handleChatEnded)
    socket.on('chat-approved', handleChatApproved)
    socket.on('mobile-requested', handleMobileRequested)
    socket.on('mobile-approved', handleMobileApproved)
    socket.on('chat-expired', handleChatExpired)

    return () => {
      console.log('🧹 Cleaning up socket listeners')
      socket.off('receive-message', handleNewMessage)
      socket.off('chat-ended', handleChatEnded)
      socket.off('chat-approved', handleChatApproved)
      socket.off('mobile-requested', handleMobileRequested)
      socket.off('mobile-approved', handleMobileApproved)
      socket.off('chat-expired', handleChatExpired)
    }
  }, [socket, chatId, joinChat])

  // Reconnect when socket reconnects
  useEffect(() => {
    if (isConnected && chatId && chat?.status === 'active') {
      console.log('🔄 Reconnecting to chat:', chatId)
      joinChat(chatId)
    }
  }, [isConnected, chatId, joinChat, chat?.status])

  // SEND MESSAGE FUNCTION - FIXED VERSION
  const sendMessage = useCallback(async (content, language = 'en', isPredefined = false) => {
    console.log('📝 sendMessage called:', { 
      content: content?.substring(0, 50), 
      chatId, 
      chatStatus: chat?.status,
      socketConnected: socket?.connected
    })
    
    if (!content?.trim()) {
      toast.error('Message cannot be empty')
      return false
    }
    
    if (!chatId) {
      toast.error('Chat ID missing')
      return false
    }
    
    if (!socket || !socket.connected) {
      toast.error('Connection not established')
      return false
    }
    
    if (chat?.status !== 'active') {
      toast.error('Chat is not active')
      return false
    }

    const userType = localStorage.getItem('qrguard_userType')
    const sessionId = localStorage.getItem('qrguard_session')
    
    console.log('👤 User info:', { userType, sessionId })
    
    // Create message data with ALL required fields
    const messageData = {
      chatId,
      senderType: userType === 'requester' ? 'requester' : 'owner',
      content: content.trim(),
      language,
      isPredefined,
      sessionId: sessionId || 'unknown',
      timestamp: new Date().toISOString()
    }

    console.log('📤 Sending message data:', messageData)

    try {
      // Create temporary message for optimistic update with consistent format
      const tempMessage = {
        _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        chatId,
        senderType: messageData.senderType,
        content: messageData.content,
        language: messageData.language,
        isPredefined: messageData.isPredefined,
        timestamp: new Date(),
        __temp: true // Mark as temporary
      };

      // Optimistic update - show message immediately
      setChat(prev => ({
        ...prev,
        messages: [...(prev?.messages || []), tempMessage]
      }))
      
      // Send via socket
      socket.emit('send-message', messageData)
      console.log('✅ Message sent via socket')
      
      return true
    } catch (err) {
      toast.error('Failed to send message')
      console.error('❌ Error sending message:', err)
      return false
    }
  }, [chatId, socket, chat?.status])

  const endChat = useCallback(async () => {
    if (!chatId) {
      toast.error('Chat ID missing')
      return false
    }

    try {
      console.log('⏹️ Ending chat:', chatId)
      await chatService.endChat(chatId)
      
      // Update local state
      setChat(prev => ({ 
        ...prev, 
        status: 'completed',
        endedAt: new Date().toISOString()
      }))
      
      // Emit socket event
      if (socket) {
        socket.emit('end-chat', { chatId })
      }
      
      toast.success('Chat ended successfully', {
        id: `chat-ended-${chatId}` // Unique ID to prevent duplicates
      })
      return true
    } catch (err) {
      toast.error(err.message || 'Failed to end chat')
      console.error('Error ending chat:', err)
      return false
    }
  }, [chatId, socket])

  const requestMobileNumber = useCallback(async () => {
    if (!chatId) {
      toast.error('Chat ID missing')
      return false
    }

    try {
      console.log('📱 Requesting mobile number for chat:', chatId)
      await chatService.requestMobileNumber(chatId)
      
      // Update local state
      setChat(prev => ({
        ...prev,
        requester: {
          ...prev.requester,
          mobileRequested: true
        }
      }))
      
      // Emit socket event
      if (socket) {
        socket.emit('request-mobile', { chatId })
      }
      
      toast.success('📱 Mobile number request sent successfully', {
        id: `mobile-request-sent-${chatId}`
      })
      return true
    } catch (err) {
      toast.error(err.message || 'Failed to request mobile number')
      console.error('Error requesting mobile:', err)
      return false
    }
  }, [chatId, socket])

  const approveChat = useCallback(async (ownerName) => {
    if (!chatId || !ownerName?.trim()) {
      toast.error('Please provide your name')
      return false
    }

    try {
      console.log('✅ Approving chat:', chatId)
      const response = await chatService.approveChatRequest(chatId, ownerName)
      
      // Update local state immediately for better UX
      setChat(prev => ({
        ...prev,
        status: 'active',
        owner: {
          ...prev.owner,
          name: ownerName,
          sessionId: response.ownerSessionId || `owner_${Date.now()}`
        },
        updatedAt: new Date().toISOString()
      }))
      
      // Store owner session
      localStorage.setItem('qrguard_session', response.ownerSessionId || `owner_${Date.now()}`)
      
      // Emit socket event
      if (socket) {
        socket.emit('chat-approved', { 
          chatId, 
          ownerName,
          ownerSessionId: response.ownerSessionId || `owner_${Date.now()}`
        })
        // Join the chat room
        joinChat(chatId)
      }
      
      toast.success('Chat approved! You can now start chatting.', {
        id: `chat-approved-${chatId}`
      })
      return true
    } catch (err) {
      toast.error(err.message || 'Failed to approve chat')
      console.error('Error approving chat:', err)
      return false
    }
  }, [chatId, socket, joinChat])

  const approveMobileNumber = useCallback(async (mobileNumber) => {
    if (!chatId || !mobileNumber) {
      toast.error('Please provide a valid mobile number')
      return false
    }

    try {
      console.log('✅ Approving mobile number for chat:', chatId)
      const response = await chatService.approveMobileNumber(chatId, mobileNumber)
      
      // Update local state
      setChat(prev => ({
        ...prev,
        requester: {
          ...prev.requester,
          mobileApproved: true,
          mobileNumber: mobileNumber
        }
      }))
      
      // Emit socket event
      if (socket) {
        socket.emit('approve-mobile', { 
          chatId, 
          mobileNumber 
        })
      }
      
      toast.success('✅ Mobile number shared successfully', {
        id: `mobile-shared-${chatId}`
      })
      return true
    } catch (err) {
      toast.error(err.message || 'Failed to share mobile number')
      console.error('Error approving mobile:', err)
      return false
    }
  }, [chatId, socket])

  return {
    chat,
    loading,
    error,
    sendMessage,
    endChat,
    requestMobileNumber,
    approveChat,
    approveMobileNumber,
    refreshChat: loadChat,
    isRequester: () => localStorage.getItem('qrguard_userType') === 'requester',
    isOwner: () => localStorage.getItem('qrguard_userType') === 'owner',
  }
}