// components/Chat/PredefinedMessages.jsx - MOBILE-FRIENDLY FIXED VERSION
import React, { useState, useEffect } from 'react'
import { MessageSquare, X, AlertTriangle, Shield, Car, Check, Loader } from 'lucide-react'

const predefinedMessages = {
  en: [
    "Major mechanical issue detected",
    "Parked in no-parking zone",
    "Child or pet locked inside vehicle",
    "Suspicious activity near vehicle",
    "Vehicle blocking emergency exit",
    "Accident involving your vehicle",
    "Engine overheating detected",
    "Fuel leak detected",
    "Airbag deployed",
    "Vehicle not properly secured",
    "Your headlights are on",
    "Door not properly closed",
    "Window left open",
    "Flat tire detected",
    "Hazard lights are on",
    "Vehicle alarm activated",
    "Registration expired",
    "Battery appears dead",
    "Vehicle leaking fluid",
    "Can you move your vehicle?"
  ],
  hi: [
    "बड़ी मैकेनिकल समस्या पाई गई",
    "नो-पार्किंग जोन में खड़ी है",
    "गाड़ी में बच्चा/पालतू बंद है",
    "गाड़ी के पास संदिग्ध गतिविधि",
    "आपातकालीन निकास अवरुद्ध",
    "गाड़ी दुर्घटनाग्रस्त हुई है",
    "इंजन ओवरहीटिंग",
    "ईंधन रिसाव पाया गया",
    "एयरबैग खुल गया है",
    "गाड़ी ठीक से सुरक्षित नहीं",
    "हेडलाइट्स चालू हैं",
    "दरवाजा ठीक से बंद नहीं",
    "खिड़की खुली छोड़ी है",
    "पंचर टायर है",
    "हेजार्ड लाइट्स चालू हैं",
    "वाहन अलार्म सक्रिय है",
    "रजिस्ट्रेशन समाप्त हो गया",
    "बैटरी डिस्चार्ज हो गई",
    "गाड़ी से तरल पदार्थ रिस रहा",
    "क्या आप गाड़ी हटा सकते हैं?"
  ]
}

const PredefinedMessages = ({ language = 'en', onSelectMessage, onClose, disabled = false }) => {
  const [sending, setSending] = useState(false)
  const [lastClickedIndex, setLastClickedIndex] = useState(null)
  const [selectedMessages, setSelectedMessages] = useState({})
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const messages = predefinedMessages[language] || predefinedMessages.en

  const handleMessageClick = async (message, index) => {
    if (disabled || (sending && lastClickedIndex === index)) return
    
    setSending(true)
    setLastClickedIndex(index)
    setSelectedMessages(prev => ({ ...prev, [index]: true }))
    
    try {
      console.log('📤 Sending message:', message.substring(0, 30))
      const success = await onSelectMessage(message)
      
      if (success) {
        setTimeout(() => {
          setSelectedMessages(prev => ({ ...prev, [index]: false }))
        }, 3000)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setSelectedMessages(prev => ({ ...prev, [index]: false }))
    } finally {
      setTimeout(() => {
        setSending(false)
        setLastClickedIndex(null)
      }, 1500)
    }
  }

  const getUrgencyLevel = (index) => {
    if (index < 5) return 'urgent'    // First 5: Most urgent
    if (index < 10) return 'emergency' // Next 5: Emergency
    return 'alert'                     // Rest: Regular alerts
  }

  const getUrgencyStyles = (level) => {
    switch(level) {
      case 'urgent':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          hover: 'hover:bg-red-100',
          text: 'text-red-800',
          icon: <AlertTriangle size={14} className="text-red-500" />,
          label: 'URGENT',
          dot: 'bg-red-500'
        }
      case 'emergency':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          hover: 'hover:bg-orange-100',
          text: 'text-orange-800',
          icon: <Shield size={14} className="text-orange-500" />,
          label: 'EMERGENCY',
          dot: 'bg-orange-500'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          hover: 'hover:bg-gray-100',
          text: 'text-gray-800',  // Fixed: Changed from gray-700 to gray-800 for better contrast
          icon: <Car size={14} className="text-gray-500" />,
          label: 'ALERT',
          dot: 'bg-gray-500'
        }
    }
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${isMobile ? 'mb-4' : ''}`}>
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Quick Messages</h3>
              <p className="text-sm text-gray-500">Tap to send instantly</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {language === 'en' ? 'English' : 'हिन्दी'}
          </div>
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-50 rounded-lg">
                <MessageSquare className="text-primary-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Quick Messages</h3>
                <p className="text-sm text-gray-500">Tap to send instantly</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className={`${isMobile ? 'p-3' : 'p-4'} max-h-[400px] overflow-y-auto`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {messages.map((message, index) => {
            const urgency = getUrgencyLevel(index)
            const styles = getUrgencyStyles(urgency)
            const isSelected = selectedMessages[index]
            const isLoading = sending && lastClickedIndex === index

            return (
              <button
                key={`${language}-${index}`}
                onClick={() => handleMessageClick(message, index)}
                disabled={disabled || isLoading}
                className={`
                  relative p-3 rounded-lg text-left transition-all duration-200 border
                  ${styles.bg} ${styles.border} ${styles.hover} ${styles.text}
                  ${disabled || isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}
                  ${isSelected ? 'ring-2 ring-primary-500 ring-opacity-50' : ''}
                  min-h-[70px] flex flex-col justify-between
                `}
                aria-label={`Send: ${message}`}
              >
                {/* Urgency Indicator */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${styles.dot}`}></div>
                    <span className="text-xs font-medium">{styles.label}</span>
                  </div>
                  {isLoading && (
                    <Loader className="animate-spin text-primary-600" size={16} />
                  )}
                  {isSelected && !isLoading && (
                    <Check className="text-green-500" size={16} />
                  )}
                </div>

                {/* Message Text */}
                <p className="text-sm font-medium leading-tight break-words">
                  {message}
                </p>

                {/* Urgency Icon */}
                <div className="mt-2 flex justify-end">
                  {styles.icon}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className={`${isMobile ? 'p-3' : 'p-4'} border-t border-gray-200 bg-gray-50`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
              <span>Urgent</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
              <span>Emergency</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 bg-gray-500 rounded-full"></div>
              <span>Alert</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            <span className="font-medium">{messages.length}</span> messages available
          </div>
        </div>
        
        {sending && (
          <div className="mt-2 text-xs text-primary-600 animate-pulse">
            Sending message...
          </div>
        )}
      </div>
    </div>
  )
}

export default PredefinedMessages