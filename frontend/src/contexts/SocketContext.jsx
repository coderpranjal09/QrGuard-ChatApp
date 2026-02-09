import React, { createContext, useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { initSocket, disconnectSocket } from '../services/socketService'
import { toast } from 'react-hot-toast'

export const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)
  const [connectionError, setConnectionError] = useState(null)

  // Initialize socket connection
  useEffect(() => {
    console.log('🔌 Initializing socket connection...')
    
    const newSocket = initSocket()
    setSocket(newSocket)

    const handleConnect = () => {
      console.log('✅ Socket connected:', newSocket.id)
      setIsConnected(true)
      setReconnecting(false)
      setConnectionError(null)
      toast.dismiss('socket-error')
    }

    const handleDisconnect = (reason) => {
      console.log('❌ Socket disconnected:', reason)
      setIsConnected(false)
      
      if (reason === 'io server disconnect' || reason === 'transport close') {
        toast.error('Connection lost. Reconnecting...', {
          id: 'socket-error',
          duration: 5000
        })
        setReconnecting(true)
      }
    }

    const handleConnectError = (error) => {
      console.error('❌ Socket connection error:', error.message)
      setConnectionError(error.message)
      setReconnecting(true)
      
      toast.error('Connection error. Trying to reconnect...', {
        id: 'socket-error',
        duration: 5000
      })
    }

    const handleReconnect = (attempt) => {
      console.log(`🔄 Reconnecting attempt ${attempt}`)
      setReconnecting(true)
    }

    const handleReconnectError = (error) => {
      console.error('❌ Reconnection error:', error)
    }

    const handleReconnectFailed = () => {
      console.error('❌ Reconnection failed')
      toast.error('Failed to reconnect. Please refresh the page.', {
        id: 'socket-error',
        duration: 6000
      })
      setReconnecting(false)
    }

    // Add event listeners
    newSocket.on('connect', handleConnect)
    newSocket.on('disconnect', handleDisconnect)
    newSocket.on('connect_error', handleConnectError)
    newSocket.on('reconnect', handleReconnect)
    newSocket.on('reconnect_error', handleReconnectError)
    newSocket.on('reconnect_failed', handleReconnectFailed)

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up socket connection')
      newSocket.off('connect', handleConnect)
      newSocket.off('disconnect', handleDisconnect)
      newSocket.off('connect_error', handleConnectError)
      newSocket.off('reconnect', handleReconnect)
      newSocket.off('reconnect_error', handleReconnectError)
      newSocket.off('reconnect_failed', handleReconnectFailed)
      
      if (newSocket.connected) {
        disconnectSocket()
      }
    }
  }, [])

  // Join chat room function
  const joinChat = useCallback((chatId, sessionId) => {
    if (!socket || !isConnected) {
      console.log('⚠️ Cannot join chat: socket not connected')
      return false
    }

    if (!chatId) {
      console.error('❌ Cannot join chat: chatId is required')
      return false
    }

    console.log(`🎯 Joining chat room: ${chatId} with session: ${sessionId}`)
    
    const userSessionId = sessionId || localStorage.getItem('qrguard_session')
    
    socket.emit('join-chat', {
      chatId,
      sessionId: userSessionId
    })
    
    return true
  }, [socket, isConnected])

  // Send message function
  const sendMessage = useCallback((messageData) => {
    if (!socket || !isConnected) {
      console.error('❌ Cannot send message: socket not connected')
      return false
    }

    if (!messageData.chatId || !messageData.content) {
      console.error('❌ Cannot send message: missing required data')
      return false
    }

    console.log('📤 Sending message via socket:', messageData)
    socket.emit('send-message', messageData)
    return true
  }, [socket, isConnected])

  const value = {
    socket,
    isConnected,
    reconnecting,
    connectionError,
    joinChat,
    sendMessage
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export const useSocket = () => {
  const context = React.useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}