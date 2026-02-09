import io from 'socket.io-client'

let socket = null

export const initSocket = () => {
  if (!socket) {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://qrguard-chatapp.onrender.com'
    
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
      extraHeaders: {
        'X-Client-Type': 'web'
      }
    })

    // Add connection event listeners
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id)
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
    })

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message)
    })

    socket.on('error', (error) => {
      console.error('❌ Socket error:', error)
    })
  }
  return socket
}

export const getSocket = () => {
  if (!socket) {
    return initSocket()
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const joinChatRoom = (chatId) => {
  const socket = getSocket()
  if (socket && chatId) {
    socket.emit('join-chat', chatId)
  }
}

export const sendMessage = (messageData) => {
  const socket = getSocket()
  if (socket && messageData) {
    socket.emit('send-message', messageData)
  }
}

export const endChat = (chatId) => {
  const socket = getSocket()
  if (socket && chatId) {
    socket.emit('end-chat', chatId)
  }
}

export const onMessageReceived = (callback) => {
  const socket = getSocket()
  if (socket) {
    socket.on('receive-message', callback)
  }
}

export const onChatEnded = (callback) => {
  const socket = getSocket()
  if (socket) {
    socket.on('chat-ended', callback)
  }
}

export const onChatExpired = (callback) => {
  const socket = getSocket()
  if (socket) {
    socket.on('chat-expired', callback)
  }
}

export const offMessageReceived = (callback) => {
  const socket = getSocket()
  if (socket) {
    socket.off('receive-message', callback)
  }
}

export const offChatEnded = (callback) => {
  const socket = getSocket()
  if (socket) {
    socket.off('chat-ended', callback)
  }
}

export const offChatExpired = (callback) => {
  const socket = getSocket()
  if (socket) {
    socket.off('chat-expired', callback)
  }
}

// Connection status helpers
export const isSocketConnected = () => {
  return socket?.connected || false
}

export const getSocketId = () => {
  return socket?.id || null
}