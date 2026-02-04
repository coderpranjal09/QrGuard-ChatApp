import React, { createContext, useContext, useState, useCallback } from 'react'
import { chatService } from '../services/chatService'
import { toast } from 'react-hot-toast'

const ChatContext = createContext(null)

export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider')
  }
  return context
}

export const ChatProvider = ({ children }) => {
  const [activeChats, setActiveChats] = useState([])
  const [loading, setLoading] = useState(false)

  const createChatRequest = async (vehicleNumber) => {
    setLoading(true)
    try {
      const response = await chatService.createChatRequest(vehicleNumber)
      toast.success('Chat request created successfully!')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create chat request')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getChatRequests = async (vehicleNumber) => {
    setLoading(true)
    try {
      const response = await chatService.getChatRequests(vehicleNumber)
      return response.requests
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch requests')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const approveChatRequest = async (chatId, ownerName) => {
    setLoading(true)
    try {
      const response = await chatService.approveChatRequest(chatId, ownerName)
      toast.success('Chat approved! Redirecting to chat...')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve chat')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const addActiveChat = (chat) => {
    setActiveChats(prev => {
      const exists = prev.find(c => c.chatId === chat.chatId)
      if (exists) return prev
      return [...prev, chat]
    })
  }

  const removeActiveChat = (chatId) => {
    setActiveChats(prev => prev.filter(chat => chat.chatId !== chatId))
  }

  const clearAllChats = () => {
    setActiveChats([])
  }

  return (
    <ChatContext.Provider
      value={{
        activeChats,
        loading,
        createChatRequest,
        getChatRequests,
        approveChatRequest,
        addActiveChat,
        removeActiveChat,
        clearAllChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}