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
      if (response.isExisting) {
        toast.success('Joined existing active chat!')
      } else {
        toast.success('Chat created successfully!')
      }
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create chat')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getChatRequests = async (vehicleNumber) => {
    setLoading(true)
    try {
      const response = await chatService.getChatRequests(vehicleNumber)
      console.log('ChatContext: API Response:', response) // Debug log
      
      // Handle both old and new response structures
      if (response && response.success) {
        // Return chats if available, otherwise requests for backward compatibility
        const chats = response.chats || response.requests || []
        return {
          success: true,
          chats: chats,
          requests: chats, // Keep both for backward compatibility
          message: response.message || `Found ${chats.length} active chat(s)`
        }
      }
      return { success: false, message: response?.message || 'No chats found' }
    } catch (error) {
      console.error('ChatContext Error:', error)
      toast.error(error.response?.data?.message || 'Failed to fetch chats')
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch chats' 
      }
    } finally {
      setLoading(false)
    }
  }

  const approveChatRequest = async (chatId, ownerName) => {
    setLoading(true)
    try {
      const response = await chatService.approveChatRequest(chatId, ownerName)
      toast.success(response.isExisting ? 'Rejoined chat!' : 'Joined chat!')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join chat')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const joinAsOwner = async (chatId, ownerName) => {
    setLoading(true)
    try {
      const response = await chatService.joinAsOwner(chatId, ownerName)
      toast.success('Joined chat as owner!')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join as owner')
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
        joinAsOwner,
        addActiveChat,
        removeActiveChat,
        clearAllChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}