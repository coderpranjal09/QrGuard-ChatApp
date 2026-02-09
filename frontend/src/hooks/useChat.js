import { useState, useEffect, useCallback, useRef } from 'react'
import { useSocket } from '../contexts/SocketContext'
import { chatService } from '../services/chatService'
import { toast } from 'react-hot-toast'

export const useChat = (chatId) => {
  const [chat, setChat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { socket, joinChat, isConnected } = useSocket()
  
  const processingMessages = useRef(new Set())
  const retryCount = useRef(0)

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
        const userType = localStorage.getItem('qrguard_userType')
        
        if (socket && sessionId) {
          console.log(`🎯 Joining chat ${chatId} as ${userType} with session ${sessionId}`)
          joinChat(chatId, sessionId)
        }
      }
      
      retryCount.current = 0
    } catch (err) {
      console.error('Error loading chat:', err)
      setError(err.message)
      
      // Retry logic
      if (retryCount.current < 3) {
        retryCount.current++
        setTimeout(() => {
          console.log(`🔄 Retry ${retryCount.current} loading chat`)
          loadChat()
        }, 1000 * retryCount.current)
      } else {
        toast.error('Failed to load chat. Please refresh.')
      }
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

    // Handle new messages
    const handleNewMessage = (message) => {
      console.log('📨 [HOOK] New message received:', {
        chatId: message.chatId,
        messageId: message._id,
        content: message.content?.substring(0, 50),
        fromSocketId: message.fromSocketId
      })
      
      // Only process if message belongs to current chat
      if (message.chatId !== chatId) {
        console.log('⚠️ Message for different chat, ignoring')
        return
      }
      
      // Prevent duplicate processing
      const messageKey = `${message._id}_${message.timestamp}`
      if (processingMessages.current.has(messageKey)) {
        console.log('⚠️ Already processing this message, skipping')
        return
      }
      
      processingMessages.current.add(messageKey)
      
      setChat(prev => {
        if (!prev) {
          // If no chat yet, load it
          loadChat()
          return prev
        }
        
        // Check if message already exists
        const messageExists = prev.messages?.some(m => 
          m._id === message._id || 
          (m.__temp && m.content === message.content && 
           Math.abs(new Date(m.timestamp).getTime() - new Date(message.timestamp).getTime()) < 1000)
        )
        
        if (messageExists) {
          console.log('⚠️ Message already exists, replacing temp')
          return {
            ...prev,
            messages: prev.messages.map(m => 
              m.__temp && m.content === message.content ? message : m
            )
          }
        }
        
        console.log('✅ Adding new message to chat')
        return {
          ...prev,
          messages: [...(prev.messages || []), {
            ...message,
            timestamp: new Date(message.timestamp)
          }]
        }
      })
      
      // Clean up processing flag
      setTimeout(() => {
        processingMessages.current.delete(messageKey)
      }, 5000)
    }

    const handleChatEnded = (data) => {
      if (data.chatId === chatId) {
        console.log('⏹️ Chat ended:', chatId)
        setChat(prev => ({ 
          ...prev, 
          status: 'completed'
        }))
        toast('🔒 Chat ended', {
          icon: '🔒',
          duration: 3000
        })
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
          },
          isOwnerJoined: true
        }))
        toast.success('✅ Chat approved! You can now start chatting.')
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
        toast('📱 Mobile number requested', {
          icon: '📱',
          duration: 4000
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
        toast.success('✅ Mobile number shared')
      }
    }

    const handleJoinedChat = (data) => {
      if (data.chatId === chatId) {
        console.log('✅ Successfully joined chat room:', chatId)
      }
    }

    // Remove existing listeners first
    socket.off('receive-message')
    socket.off('chat-ended')
    socket.off('chat-approved')
    socket.off('mobile-requested')
    socket.off('mobile-approved')
    socket.off('joined-chat')

    // Add new listeners
    socket.on('receive-message', handleNewMessage)
    socket.on('chat-ended', handleChatEnded)
    socket.on('chat-approved', handleChatApproved)
    socket.on('mobile-requested', handleMobileRequested)
    socket.on('mobile-approved', handleMobileApproved)
    socket.on('joined-chat', handleJoinedChat)

    return () => {
      console.log('🧹 Cleaning up socket listeners for chat:', chatId)
      socket.off('receive-message', handleNewMessage)
      socket.off('chat-ended', handleChatEnded)
      socket.off('chat-approved', handleChatApproved)
      socket.off('mobile-requested', handleMobileRequested)
      socket.off('mobile-approved', handleMobileApproved)
      socket.off('joined-chat', handleJoinedChat)
    }
  }, [socket, chatId, loadChat])

  // Reconnect when socket reconnects
  useEffect(() => {
    if (isConnected && chatId && chat?.status === 'active') {
      console.log('🔄 Reconnecting to chat on socket reconnect:', chatId)
      const sessionId = localStorage.getItem('qrguard_session')
      if (sessionId) {
        joinChat(chatId, sessionId)
      }
    }
  }, [isConnected, chatId, joinChat, chat?.status])

  // SEND MESSAGE FUNCTION - FIXED VERSION
  const sendMessage = useCallback(async (content, language = 'en', isPredefined = false) => {
    console.log('📝 [HOOK] sendMessage called:', { 
      content: content?.substring(0, 50), 
      chatId, 
      chatStatus: chat?.status,
      socketConnected: socket?.connected,
      isConnected
    })
    
    if (!content?.trim()) {
      toast.error('Message cannot be empty')
      return false
    }
    
    if (!chatId) {
      toast.error('Chat ID missing')
      return false
    }
    
    if (!socket || !isConnected) {
      toast.error('Not connected to server. Please wait...')
      return false
    }
    
    if (chat?.status !== 'active') {
      toast.error('Chat is not active')
      return false
    }

    const userType = localStorage.getItem('qrguard_userType')
    const sessionId = localStorage.getItem('qrguard_session')
    
    console.log('👤 User info:', { userType, sessionId, socketId: socket.id })
    
    if (!sessionId) {
      toast.error('Session not found. Please refresh the page.')
      return false
    }

    // Create message data
    const messageData = {
      chatId,
      senderType: userType === 'requester' ? 'requester' : 'owner',
      content: content.trim(),
      language,
      isPredefined,
      sessionId,
      timestamp: new Date().toISOString()
    }

    console.log('📤 [HOOK] Sending message via socket:', messageData)

    try {
      // Create temporary message for optimistic update
      const tempMessage = {
        _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        chatId,
        senderType: messageData.senderType,
        content: messageData.content,
        language: messageData.language,
        isPredefined: messageData.isPredefined,
        sessionId: messageData.sessionId,
        timestamp: new Date(),
        __temp: true
      };

      // Optimistic update
      setChat(prev => ({
        ...prev,
        messages: [...(prev?.messages || []), tempMessage]
      }))
      
      // Send via socket
      socket.emit('send-message', messageData)
      
      // Auto-remove temp message after 5 seconds if not replaced
      setTimeout(() => {
        setChat(prev => {
          if (!prev) return prev
          return {
            ...prev,
            messages: prev.messages.filter(m => m._id !== tempMessage._id)
          }
        })
      }, 5000)
      
      return true
    } catch (err) {
      console.error('❌ [HOOK] Error in sendMessage:', err)
      toast.error('Failed to send message')
      return false
    }
  }, [chatId, socket, isConnected, chat?.status])

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
        status: 'completed'
      }))
      
      // Emit socket event
      if (socket) {
        socket.emit('end-chat', { chatId })
      }
      
      toast('🔒 Chat ended successfully', {
        icon: '🔒',
        duration: 3000
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
      
      toast('📱 Mobile number request sent', {
        icon: '📱',
        duration: 3000
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
      
      // Update local state
      setChat(prev => ({
        ...prev,
        status: 'active',
        owner: {
          ...prev.owner,
          name: ownerName,
          sessionId: response.ownerSessionId || `owner_${Date.now()}`
        },
        isOwnerJoined: true
      }))
      
      // Store owner session
      localStorage.setItem('qrguard_session', response.ownerSessionId || `owner_${Date.now()}`)
      
      // Emit socket event and join room
      if (socket) {
        socket.emit('chat-approved', { 
          chatId, 
          ownerName,
          ownerSessionId: response.ownerSessionId || `owner_${Date.now()}`
        })
        joinChat(chatId, response.ownerSessionId || `owner_${Date.now()}`)
      }
      
      toast.success('✅ Chat approved! You can now start chatting.')
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
      
      toast.success('✅ Mobile number shared successfully')
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