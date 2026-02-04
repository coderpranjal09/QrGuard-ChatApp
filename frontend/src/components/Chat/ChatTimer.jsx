// components/Chat/ChatTimer.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

const ChatTimer = ({ chat }) => {
  const [seconds, setSeconds] = useState(null)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (!chat?.expiresAt) return

    // Calculate remaining seconds based on expiresAt from API
    const calculateRemainingSeconds = () => {
      const now = new Date()
      const expiresAt = new Date(chat.expiresAt)
      const diffInSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000))
      
      if (diffInSeconds <= 0) {
        setIsExpired(true)
        return 0
      }
      
      return diffInSeconds
    }

    // Initial calculation
    setSeconds(calculateRemainingSeconds())

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateRemainingSeconds()
      setSeconds(remaining)
      
      if (remaining <= 0) {
        setIsExpired(true)
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [chat?.expiresAt])

  const formatTime = () => {
    if (seconds === null || seconds <= 0) return '00:00'
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getTimerColor = () => {
    if (!seconds) return 'text-gray-600'
    if (seconds > 600) return 'text-green-600' // More than 10 minutes
    if (seconds > 300) return 'text-yellow-600' // 5-10 minutes
    if (seconds > 60) return 'text-orange-600' // 1-5 minutes
    return 'text-red-600' // Less than 1 minute
  }

  const getTimerBg = () => {
    if (!seconds) return 'bg-gray-50 border-gray-200'
    if (seconds > 600) return 'bg-green-50 border-green-200'
    if (seconds > 300) return 'bg-yellow-50 border-yellow-200'
    if (seconds > 60) return 'bg-orange-50 border-orange-200'
    return 'bg-red-50 border-red-200'
  }

  if (isExpired) {
    return (
      <div className="flex items-center space-x-3 px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl">
        <AlertTriangle size={20} />
        <div>
          <p className="font-semibold">Chat Expired</p>
          <p className="text-sm">This chat session has ended</p>
        </div>
      </div>
    )
  }

  if (seconds === null) {
    return (
      <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 text-gray-600 border border-gray-200 rounded-xl">
        <Clock size={20} />
        <div>
          <p className="font-bold text-lg">--:--</p>
          <p className="text-xs">Loading timer...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl border ${getTimerBg()} ${getTimerColor()}`}>
      <Clock size={20} />
      <div>
        <p className="font-bold text-lg">{formatTime()}</p>
        <p className="text-xs">Time remaining</p>
      </div>
    </div>
  )
}

export default ChatTimer