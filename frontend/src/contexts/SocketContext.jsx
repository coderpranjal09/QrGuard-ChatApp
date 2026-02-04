import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { initSocket, disconnectSocket } from '../services/socketService'
import { toast } from 'react-hot-toast'

const SocketContext = createContext(null)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)

  const initializeSocket = useCallback(() => {
    const sessionId = localStorage.getItem('qrguard_session')
    const userType = localStorage.getItem('qrguard_userType')
    
    const socketInstance = initSocket(sessionId, userType)
    setSocket(socketInstance)

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected in context:', socketInstance.id)
      setIsConnected(true)
      setReconnecting(false)
      toast.success('Connected to chat server')
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
      setIsConnected(false)
      toast.error('Disconnected from chat server')
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        setTimeout(() => {
          socketInstance.connect()
        }, 1000)
      }
    })

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message)
      setIsConnected(false)
      if (!reconnecting) {
        setReconnecting(true)
        setTimeout(() => {
          socketInstance.connect()
        }, 2000)
      }
    })

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log(`✅ Socket reconnected after ${attemptNumber} attempts`)
      setIsConnected(true)
      setReconnecting(false)
      toast.success('Reconnected to chat server')
    })

    socketInstance.on('reconnect_attempt', () => {
      console.log('🔄 Attempting to reconnect...')
      setReconnecting(true)
    })

    socketInstance.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed')
      setReconnecting(false)
      toast.error('Failed to reconnect. Please refresh the page.')
    })

    socketInstance.on('error', (error) => {
      console.error('❌ Socket error:', error)
      toast.error(error.message || 'Socket error occurred')
    })

    return socketInstance
  }, [reconnecting])

  useEffect(() => {
    const socketInstance = initializeSocket()

    return () => {
      if (socketInstance) {
        socketInstance.off('connect')
        socketInstance.off('disconnect')
        socketInstance.off('connect_error')
        socketInstance.off('reconnect')
        socketInstance.off('reconnect_attempt')
        socketInstance.off('reconnect_failed')
        socketInstance.off('error')
        disconnectSocket()
      }
    }
  }, [initializeSocket])

  const joinChat = useCallback((chatId) => {
    if (socket && socket.connected) {
      socket.emit('join-chat', chatId)
      console.log(`✅ Joined chat: ${chatId}`)
    } else {
      console.error('⚠️ Cannot join chat: socket not connected')
      toast.error('Cannot join chat - connection lost')
    }
  }, [socket])

  const sendMessage = useCallback((messageData) => {
    if (socket && socket.connected && messageData) {
      console.log('📤 Emitting message via socket:', messageData)
      socket.emit('send-message', messageData)
      return true
    } else {
      console.error('❌ Socket not connected')
      toast.error('Connection lost. Please refresh the page.')
      return false
    }
  }, [socket])

  const approveChat = useCallback((chatId, ownerName, ownerSessionId) => {
    if (socket && socket.connected) {
      socket.emit('approve-chat', { chatId, ownerName, ownerSessionId })
      return true
    }
    return false
  }, [socket])

  const reconnect = useCallback(() => {
    if (socket) {
      socket.connect()
    }
  }, [socket])

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect()
    }
  }, [socket])

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        reconnecting,
        joinChat,
        sendMessage,
        approveChat,
        reconnect,
        disconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}