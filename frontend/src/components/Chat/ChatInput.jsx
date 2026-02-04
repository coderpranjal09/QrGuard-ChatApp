import React, { useState, useRef, useEffect } from 'react'
import { Send, Smile, Paperclip, Mic } from 'lucide-react'
import Button from '../Common/Button'

const ChatInput = ({ onSendMessage, language, disabled, onTypingChange }) => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef(null)

  const handleInputChange = (e) => {
    const value = e.target.value
    setMessage(value)
    
    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true)
      if (onTypingChange) onTypingChange(true)
    } else if (!value.trim() && isTyping) {
      setIsTyping(false)
      if (onTypingChange) onTypingChange(false)
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Set new timeout to clear typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      if (onTypingChange) onTypingChange(false)
    }, 2000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!message.trim() || disabled) return

    onSendMessage(message, language, false)
    setMessage('')
    
    // Clear typing indicator
    setIsTyping(false)
    if (onTypingChange) onTypingChange(false)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const placeholder = language === 'hi' 
    ? 'अपना संदेश यहाँ टाइप करें... (Enter दबाएं भेजने के लिए)'
    : 'Type your message here... (Press Enter to send)'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <textarea
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none min-h-[80px] max-h-[120px] pr-12"
          rows="3"
          maxLength="500"
        />
        
        <div className="absolute right-3 bottom-3 flex items-center space-x-2">
          <button
            type="button"
            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={disabled}
          >
            <Smile size={18} />
          </button>
          <button
            type="button"
            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={disabled}
          >
            <Paperclip size={18} />
          </button>
          <button
            type="button"
            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={disabled}
          >
            <Mic size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {message.length}/500 characters • {language === 'hi' ? 'हिन्दी' : 'English'}
        </div>
        
        <Button
          type="submit"
          disabled={disabled || !message.trim()}
          variant="primary"
          size="md"
          icon={Send}
          iconPosition="right"
        >
          Send Message
        </Button>
      </div>
    </form>
  )
}

export default ChatInput