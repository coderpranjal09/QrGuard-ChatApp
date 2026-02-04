// components/Chat/ChatMessages.jsx - FINAL FIXED VERSION
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { format } from 'date-fns'
import { 
  Bot, 
  User, 
  Check, 
  Clock,
  Shield,
  Smartphone,
  ChevronDown,
  CheckCircle,
  MessageSquare
} from 'lucide-react'

const ChatMessages = ({ messages = [], userType, isTyping }) => {
  const messagesEndRef = useRef(null)
  const containerRef = useRef(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // ====== STRONG REAL-TIME DEDUPLICATION ======
  const uniqueMessages = useMemo(() => {
    const seen = new Set()

    return messages.filter(msg => {
      const key = msg._id
        ? msg._id
        : `${msg.content}-${msg.timestamp}`

      if (seen.has(key)) return false

      seen.add(key)
      return true
    })
  }, [messages])
  // ===========================================

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200
      setShowScrollButton(!isNearBottom)
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (uniqueMessages.length > 0) {
      setTimeout(() => scrollToBottom('auto'), 100)
    }
  }, [uniqueMessages, isTyping])

  if (!uniqueMessages || uniqueMessages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Secure Chat Started
        </h3>
        <p className="text-gray-500 text-center text-sm">
          Start conversation now
        </p>
      </div>
    )
  }

  const getMessageDateHeader = (timestamp) => {
    try {
      const date = new Date(timestamp)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      if (date.toDateString() === today.toDateString()) {
        return 'Today'
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday'
      } else {
        return format(date, 'MMMM d, yyyy')
      }
    } catch {
      return 'Today'
    }
  }

  let lastDate = null

  return (
    <div className="relative h-full">

      {showScrollButton && (
        <button
          onClick={() => scrollToBottom()}
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-10 bg-white border rounded-full p-2 shadow-lg"
        >
          <ChevronDown size={18} />
        </button>
      )}

      <div 
        ref={containerRef} 
        className="space-y-4 pb-4 h-full overflow-y-auto px-2"
      >
        {uniqueMessages.map((message, index) => {
          const isRequesterMessage = message.senderType === 'requester'
          const isFromCurrentUser = 
            (userType === 'requester' && isRequesterMessage) || 
            (userType === 'owner' && !isRequesterMessage)
          
          const messageDate = getMessageDateHeader(message.timestamp)
          const showDateHeader = messageDate !== lastDate
          lastDate = messageDate

          return (
            <React.Fragment key={message._id || index}>
              
              {showDateHeader && (
                <div className="flex justify-center my-4">
                  <div className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    {messageDate}
                  </div>
                </div>
              )}

              <div
                className={`flex ${
                  isFromCurrentUser ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className="max-w-[85%] md:max-w-md">
                  <div className="flex items-start space-x-2">

                    {/* LEFT AVATAR (OTHER USER) */}
                    {!isFromCurrentUser && (
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <User size={14} className="text-white" />
                      </div>
                    )}

                    {/* MESSAGE BUBBLE */}
                    <div
                      className={`rounded-xl p-3 ${
                        isFromCurrentUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-black'
                      }`}
                    >
                      {message.isPredefined && (
                        <div className="flex items-center mb-1">
                          <Bot size={12} className="mr-1 text-gray-700" />
                          <span className="text-xs text-gray-700">
                            Quick Message
                          </span>
                        </div>
                      )}

                      {/* TEXT COLOR FIXED HERE */}
                      <p
                        className={`text-sm whitespace-pre-wrap ${
                          isFromCurrentUser
                            ? 'text-white'
                            : 'text-black'
                        }`}
                      >
                        {message.content}
                      </p>

                      <div className="flex justify-between items-center mt-2 text-xs">
                        <span
                          className={`flex items-center ${
                            isFromCurrentUser
                              ? 'text-gray-200'
                              : 'text-gray-500'
                          }`}
                        >
                          <Clock size={12} className="mr-1" />
                          {format(new Date(message.timestamp), 'hh:mm a')}
                        </span>

                        {isFromCurrentUser && (
                          <span className="flex items-center text-gray-200">
                            <Check size={12} className="mr-1" />
                            Sent
                          </span>
                        )}
                      </div>
                    </div>

                    {/* RIGHT AVATAR (SELF USER) – FIXED COLORS */}
                    {isFromCurrentUser && (
                      <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center">
                        <User size={14} className="text-white" />
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </React.Fragment>
          )
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-xl p-3 text-sm">
              Typing...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

export default ChatMessages
