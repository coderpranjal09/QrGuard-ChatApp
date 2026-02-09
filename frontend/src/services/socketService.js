import { io } from 'socket.io-client'

let socket = null
let connectionAttempts = 0
const MAX_RECONNECTION_ATTEMPTS = 10

export const initSocket = () => {
  if (socket?.connected) {
    console.log('✅ Socket already connected')
    return socket
  }

  // Close existing socket if any
  if (socket) {
    socket.disconnect()
    socket = null
  }

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://qrguard-chatapp.onrender.com'
  
  console.log(`🔌 Connecting to WebSocket server: ${SOCKET_URL}`)
  
  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECTION_ATTEMPTS,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    withCredentials: true,
    autoConnect: true,
    forceNew: true,
    extraHeaders: {
      'X-Client-Type': 'web',
      'X-Client-Version': '1.0.0'
    },
    query: {
      client: 'web',
      timestamp: Date.now()
    }
  })

  // Connection events
  socket.on('connect', () => {
    console.log('✅ [SOCKET] Connected to server. Socket ID:', socket.id)
    connectionAttempts = 0
  })

  socket.on('disconnect', (reason) => {
    console.log('❌ [SOCKET] Disconnected from server. Reason:', reason)
    
    if (reason === 'io server disconnect') {
      // Server initiated disconnect, try to reconnect
      setTimeout(() => {
        if (connectionAttempts < MAX_RECONNECTION_ATTEMPTS) {
          connectionAttempts++
          console.log(`🔄 [SOCKET] Attempting to reconnect (${connectionAttempts}/${MAX_RECONNECTION_ATTEMPTS})`)
          socket.connect()
        }
      }, 1000)
    }
  })

  socket.on('connect_error', (error) => {
    console.error('❌ [SOCKET] Connection error:', error.message)
    
    connectionAttempts++
    if (connectionAttempts >= MAX_RECONNECTION_ATTEMPTS) {
      console.error('❌ [SOCKET] Max reconnection attempts reached')
    }
  })

  socket.on('error', (error) => {
    console.error('❌ [SOCKET] Error:', error)
  })

  socket.on('reconnect', (attempt) => {
    console.log(`✅ [SOCKET] Reconnected on attempt ${attempt}`)
    connectionAttempts = 0
  })

  socket.on('reconnect_attempt', (attempt) => {
    console.log(`🔄 [SOCKET] Reconnection attempt ${attempt}`)
  })

  socket.on('reconnect_error', (error) => {
    console.error('❌ [SOCKET] Reconnection error:', error)
  })

  socket.on('reconnect_failed', () => {
    console.error('❌ [SOCKET] Reconnection failed after all attempts')
  })

  // Application specific events
  socket.on('joined-chat', (data) => {
    console.log('✅ [SOCKET] Joined chat room:', data.chatId)
  })

  socket.on('receive-message', (message) => {
    console.log('📨 [SOCKET] Received message:', {
      chatId: message.chatId,
      messageId: message._id,
      content: message.content?.substring(0, 30)
    })
  })

  socket.on('chat-ended', (data) => {
    console.log('⏹️ [SOCKET] Chat ended:', data.chatId)
  })

  socket.on('chat-approved', (data) => {
    console.log('✅ [SOCKET] Chat approved:', data.chatId)
  })

  socket.on('mobile-requested', (data) => {
    console.log('📱 [SOCKET] Mobile requested:', data.chatId)
  })

  socket.on('mobile-approved', (data) => {
    console.log('✅ [SOCKET] Mobile approved:', data.chatId)
  })

  return socket
}

export const getSocket = () => {
  if (!socket || !socket.connected) {
    return initSocket()
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    console.log('🔌 Disconnecting socket...')
    socket.disconnect()
    socket = null
  }
}

export const joinChatRoom = (chatId, sessionId) => {
  const socket = getSocket()
  if (socket && socket.connected && chatId) {
    socket.emit('join-chat', {
      chatId,
      sessionId: sessionId || localStorage.getItem('qrguard_session')
    })
    return true
  }
  return false
}

export const sendMessage = (messageData) => {
  const socket = getSocket()
  if (socket && socket.connected && messageData) {
    socket.emit('send-message', messageData)
    return true
  }
  return false
}

// Helper functions to manage listeners
export const addSocketListener = (event, callback) => {
  const socket = getSocket()
  if (socket) {
    socket.on(event, callback)
  }
}

export const removeSocketListener = (event, callback) => {
  const socket = getSocket()
  if (socket) {
    socket.off(event, callback)
  }
}

export const removeAllSocketListeners = (event) => {
  const socket = getSocket()
  if (socket) {
    socket.removeAllListeners(event)
  }
}

// Connection status
export const isSocketConnected = () => {
  return socket?.connected || false
}

export const getSocketId = () => {
  return socket?.id || null
}

export const getConnectionStatus = () => {
  if (!socket) return 'disconnected'
  if (socket.connected) return 'connected'
  return 'connecting'
}