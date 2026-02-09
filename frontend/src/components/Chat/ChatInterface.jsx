import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useMediaQuery } from 'react-responsive'
import ChatHeader from './ChatHeader'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'
import PredefinedMessages from './PredefinedMessages'
import MobileRequestModal from './MobileRequestModal'
import MobileShareModal from './MobileShareModal'
import ChatTimer from './ChatTimer'
import QuickActions from './QuickActions'
import ChatInfo from './ChatInfo'
import { useChat } from '../../hooks/useChat'
import { useSocket } from '../../contexts/SocketContext'
import Loader from '../Common/Loader'
import Alert from '../Common/Alert'
import Button from '../Common/Button'
import { 
  Clock, 
  Shield, 
  MessageSquare, 
  AlertTriangle, 
  RefreshCw,
  Home,
  Check,
  X,
  Phone,
  Smartphone,
  Languages,
  ChevronLeft,
  Menu,
  X as XIcon,
  Send,
  MoreVertical,
  User,
  Car,
  Calendar,
  ChevronRight,
  Users,
  UserCheck,
  UserX
} from 'lucide-react'

const ChatInterface = () => {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 })
  
  const { 
    chat, 
    loading, 
    error, 
    sendMessage, 
    endChat, 
    requestMobileNumber, 
    refreshChat,
    approveChat,
    approveMobileNumber
  } = useChat(chatId)
  
  const { isConnected, reconnecting } = useSocket()
  const [language, setLanguage] = useState('en')
  const [showMobileRequestModal, setShowMobileRequestModal] = useState(false)
  const [showMobileShareModal, setShowMobileShareModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [userType, setUserType] = useState('')
  const [approving, setApproving] = useState(false)
  const [ownerName, setOwnerName] = useState('')
  const [showPredefined, setShowPredefined] = useState(!isMobile)
  const [sendingMessage, setSendingMessage] = useState(false)

  // Get user type from URL or localStorage
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const type = params.get('userType') || localStorage.getItem('qrguard_userType')
    setUserType(type || '')
    
    // Check if joining existing chat
    if (location.state?.isExisting && type === 'requester') {
      toast.success('Joined existing active chat', {
        icon: '🔄',
        duration: 3000
      })
    }
  }, [location])

  const isRequester = userType === 'requester'
  const isOwner = userType === 'owner'
  const isChatActive = chat?.status === 'active'
  const isPending = chat?.status === 'pending'

  // Handle predefined message sending
  const handlePredefinedMessage = async (message) => {
    if (sendingMessage) return
    
    setSendingMessage(true)
    console.log('📨 Sending predefined message from interface:', message.substring(0, 50))
    
    const success = await sendMessage(message, language, true)
    
    if (success) {
      toast.success('Message sent successfully', {
        icon: '✅',
        duration: 2000
      })
    }
    
    setSendingMessage(false)
  }

  useEffect(() => {
    if (!isMobile) {
      setShowPredefined(true)
    }
  }, [isMobile])

  // Auto-hide mobile menu when chat changes
  useEffect(() => {
    if (showMobileMenu && chat) {
      setShowMobileMenu(false)
    }
  }, [chat])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="relative">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl animate-pulse"></div>
              <div className="absolute inset-2 bg-white rounded-xl flex items-center justify-center">
                <MessageSquare className="text-primary-600 animate-spin-slow" size={32} />
              </div>
            </div>
            <Loader size="lg" text="Loading chat..." />
            <p className="text-gray-500 mt-4 text-sm">Preparing your secure conversation...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-600" size={28} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">Connection Error</h2>
            <p className="text-gray-600 mb-6 text-center">{error}</p>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/')} 
                variant="primary" 
                fullWidth 
                size="lg"
                icon={Home}
              >
                Return Home
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                fullWidth
                icon={RefreshCw}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Chat Not Found</h2>
            <p className="text-gray-600 mb-6 text-center">
              The chat you're looking for doesn't exist or has been deleted.
            </p>
            <Button 
              onClick={() => navigate('/')} 
              variant="primary" 
              fullWidth 
              size="lg"
              icon={Home}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // =========== REPORTER VIEW ===========
  if (isRequester) {
    // Reporter sees chat immediately (no pending state)
    return (
      <>
        <Helmet>
          <title>Chat - {chat.vehicleNumber} | QR Guard</title>
        </Helmet>

        {/* Mobile Request Modal */}
        <MobileRequestModal
          isOpen={showMobileRequestModal}
          onClose={() => setShowMobileRequestModal(false)}
          onRequest={async () => {
            const success = await requestMobileNumber()
            if (success) {
              setShowMobileRequestModal(false)
            }
          }}
        />

        {/* Mobile Overlay Menu */}
        {isMobile && showMobileMenu && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
              onClick={() => setShowMobileMenu(false)}
            />
            
            <div className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-xl z-50 animate-slideInRight">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-primary-50 to-white">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Menu className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Chat Menu</h3>
                    <p className="text-xs text-gray-500">Quick actions & info</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition active:scale-95"
                  aria-label="Close menu"
                >
                  <XIcon size={24} className="text-gray-500" />
                </button>
              </div>
              
              <div className="h-[calc(100%-73px)] overflow-y-auto p-4 space-y-6">
                <ChatInfo chat={chat} userType={userType} />
                
                <QuickActions 
                  onRefresh={refreshChat}
                  onGoHome={() => navigate('/')}
                  onEndChat={endChat}
                  isChatActive={isChatActive}
                />
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">More Options</h4>
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        setShowMobileMenu(false)
                        setShowPredefined(!showPredefined)
                      }}
                      className="w-full flex items-center justify-between p-3 hover:bg-white rounded-lg transition"
                    >
                      <div className="flex items-center space-x-3">
                        <MessageSquare size={18} className="text-gray-600" />
                        <span className="text-gray-700">
                          {showPredefined ? 'Hide Quick Messages' : 'Show Quick Messages'}
                        </span>
                      </div>
                      <ChevronRight size={18} className="text-gray-400" />
                    </button>
                    
                    <button 
                      onClick={() => {
                        setShowMobileMenu(false)
                        if (!chat.requester?.mobileRequested) {
                          setShowMobileRequestModal(true)
                        }
                      }}
                      className="w-full flex items-center justify-between p-3 hover:bg-white rounded-lg transition"
                    >
                      <div className="flex items-center space-x-3">
                        <Phone size={18} className="text-gray-600" />
                        <span className="text-gray-700">
                          {!chat.requester?.mobileRequested ? 'Request Mobile' : 'Mobile Requested'}
                        </span>
                      </div>
                      <ChevronRight size={18} className="text-gray-400" />
                    </button>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition active:scale-95"
                  >
                    Close Menu
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
          {/* Connection Status */}
          {reconnecting && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
              <div className="bg-yellow-500/90 backdrop-blur-sm text-white rounded-xl shadow-lg p-4 animate-fadeInDown">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <div className="flex-1">
                    <p className="font-medium">Reconnecting...</p>
                    <p className="text-sm opacity-90">Attempting to restore connection</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Container */}
          <div className="max-w-7xl mx-auto">
            {/* Mobile Header */}
            {isMobile && (
              <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
                <div className="flex items-center justify-between p-4">
                  <button
                    onClick={() => navigate('/')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition active:scale-95"
                    aria-label="Go back"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <div className="flex-1 px-4">
                    <div className="text-center">
                      <p className="font-bold text-gray-900 truncate">{chat.vehicleNumber}</p>
                      <div className="flex items-center justify-center space-x-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${
                          isChatActive ? 'bg-green-500' : 'bg-gray-500'
                        }`}></div>
                        <p className="text-xs text-gray-500">
                          {isChatActive ? 'Active' : 'Ended'} • Reporter
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowMobileMenu(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition active:scale-95"
                    aria-label="Open menu"
                  >
                    <Menu size={20} />
                  </button>
                </div>
                
                {/* Owner Status Bar */}
                <div className="px-4 pb-3">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        chat.isOwnerJoined ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                      }`}></div>
                      <span className="text-sm font-medium">
                        {chat.isOwnerJoined ? 'Owner joined' : 'Waiting for owner'}
                      </span>
                    </div>
                    
                    {isChatActive && chat?.expiresAt && (
                      <div className="pl-4 border-l border-gray-200">
                        <ChatTimer chat={chat} compact />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Header */}
            {!isMobile && (
              <div className="p-6">
                <div className="flex flex-col space-y-4">
                  <ChatHeader 
                    chat={chat}
                    userType={userType}
                    onEndChat={endChat}
                  />
                  
                  {/* Owner Status & Timer */}
                  <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          chat.isOwnerJoined ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                        }`}></div>
                        <span className="text-sm font-medium">
                          {chat.isOwnerJoined ? 'Owner joined the chat' : 'Owner not joined yet'}
                        </span>
                      </div>
                    </div>
                    
                    {isChatActive && chat?.expiresAt && (
                      <ChatTimer chat={chat} />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Left Sidebar - Predefined Messages */}
                {isChatActive && (
                  <div className={`${isMobile && !showPredefined ? 'hidden' : 'block'} lg:col-span-1`}>
                    <div className="sticky top-4">
                      <PredefinedMessages 
                        language={language}
                        onSelectMessage={handlePredefinedMessage}
                        onClose={() => isMobile && setShowPredefined(false)}
                        disabled={sendingMessage}
                      />
                      
                      {isMobile && (
                        <div className="mt-4">
                          <ChatInfo chat={chat} userType={userType} compact />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Main Chat Area */}
                <div className={`${isChatActive ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    {/* Messages Container */}
                    <div className="h-[calc(100vh-300px)] md:h-[500px] overflow-y-auto p-4 md:p-6">
                      {chat.messages && chat.messages.length > 0 ? (
                        <>
                          {/* System Welcome Message */}
                          {chat.messages.length === 0 && (
                            <div className="text-center mb-6 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-100">
                              <div className="flex items-center justify-center space-x-2 mb-2">
                                <Shield className="text-primary-600" size={20} />
                                <h3 className="font-semibold text-primary-800">Secure Chat Started</h3>
                              </div>
                              <p className="text-sm text-gray-600">
                                Chat is active. {chat.isOwnerJoined ? 'Owner is in the chat.' : 'Waiting for owner to join...'}
                              </p>
                            </div>
                          )}
                          
                          <ChatMessages 
                            messages={chat.messages}
                            userType={userType}
                            isTyping={sendingMessage}
                          />
                        </>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8">
                          <div className="relative mb-6">
                            <div className="w-20 h-20 bg-gradient-to-r from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                              <MessageSquare className="text-primary-600" size={32} />
                            </div>
                            <div className="absolute -bottom-2 -right-2">
                              <div className="w-10 h-10 bg-white rounded-full border-2 border-primary-100 flex items-center justify-center">
                                <Send className="text-primary-500" size={16} />
                              </div>
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Start Conversation</h3>
                          <p className="text-center text-sm max-w-sm mb-4">
                            Select a predefined message or request mobile number to begin
                          </p>
                          
                          {/* Owner Status */}
                          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-center space-x-3">
                              {chat.isOwnerJoined ? (
                                <>
                                  <UserCheck className="text-green-600" size={20} />
                                  <div>
                                    <p className="text-sm font-medium text-green-800">Owner Joined</p>
                                    <p className="text-xs text-gray-600">You can start chatting</p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <UserX className="text-yellow-600" size={20} />
                                  <div>
                                    <p className="text-sm font-medium text-yellow-800">Owner Not Joined</p>
                                    <p className="text-xs text-gray-600">Waiting for owner to join the chat</p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons Bar */}
                  <div className="mt-4 md:mt-6">
                    <div className="flex flex-wrap gap-3">
                      {/* Language Toggle */}
                      {isChatActive && (
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                            <Languages size={18} className="text-gray-500" />
                            <div className="flex bg-gray-100 rounded-lg p-1 flex-1">
                              <button
                                onClick={() => setLanguage('en')}
                                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                                  language === 'en' 
                                    ? 'bg-white text-primary-600 shadow-sm' 
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                                disabled={sendingMessage}
                              >
                                English
                              </button>
                              <button
                                onClick={() => setLanguage('hi')}
                                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                                  language === 'hi' 
                                    ? 'bg-white text-primary-600 shadow-sm' 
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                                disabled={sendingMessage}
                              >
                                हिन्दी
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Mobile Toggle Button for Predefined Messages */}
                      {isMobile && isChatActive && (
                        <Button
                          onClick={() => setShowPredefined(!showPredefined)}
                          variant="outline"
                          icon={MessageSquare}
                          className="flex-1"
                          disabled={sendingMessage}
                        >
                          {showPredefined ? 'Hide Messages' : 'Quick Messages'}
                        </Button>
                      )}

                      {/* Mobile Number Request Button */}
                      {isChatActive && !chat.requester?.mobileRequested && (
                        <Button
                          onClick={() => setShowMobileRequestModal(true)}
                          variant="primary"
                          icon={Phone}
                          className="flex-1"
                          disabled={sendingMessage}
                        >
                          Request Mobile
                        </Button>
                      )}

                      {/* Mobile Number Status */}
                      {isChatActive && chat.requester?.mobileRequested && !chat.requester?.mobileApproved && (
                        <div className="flex-1 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4 min-w-[250px]">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                              <Phone className="text-yellow-600" size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-yellow-800">Request Sent</p>
                              <p className="text-xs text-yellow-700">Waiting for owner to share number</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Mobile Number Display */}
                      {chat.requester?.mobileApproved && chat.requester?.mobileNumber && (
                        <div className="flex-1 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4 min-w-[250px]">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                              <Smartphone className="text-green-600" size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-green-800">Owner's Mobile</p>
                              <p className="text-lg font-bold text-green-900">{chat.requester.mobileNumber}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* End Chat Button */}
                      {isChatActive && (
                        <Button
                          onClick={endChat}
                          variant="danger"
                          icon={Shield}
                          className="flex-1"
                          disabled={sendingMessage}
                        >
                          End Chat
                        </Button>
                      )}

                      {/* More Actions Button (Mobile) */}
                      {isMobile && (
                        <Button
                          onClick={() => setShowMobileMenu(true)}
                          variant="outline"
                          icon={MoreVertical}
                          disabled={sendingMessage}
                        >
                          More
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Sidebar - Desktop Only */}
                {!isMobile && (
                  <div className="lg:col-span-1">
                    <div className="space-y-6 sticky top-4">
                      <ChatInfo chat={chat} userType={userType} />
                      <QuickActions 
                        onRefresh={refreshChat}
                        onGoHome={() => navigate('/')}
                        onEndChat={endChat}
                        isChatActive={isChatActive}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Floating Action Button for Mobile */}
          {isMobile && isChatActive && (
            <div className="fixed bottom-6 right-6 z-30">
              <div className="flex flex-col items-end space-y-3">
                {!showPredefined && chat.messages?.length === 0 && (
                  <button
                    onClick={() => setShowPredefined(true)}
                    className="bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition transform hover:scale-105 active:scale-95"
                    disabled={sendingMessage}
                  >
                    <MessageSquare size={24} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </>
    )
  }

  // =========== OWNER VIEW ===========
  if (isOwner) {
    // If owner already joined before, show chat directly
    if (chat.isOwnerJoined) {
      return (
        <>
          <Helmet>
            <title>Chat - {chat.vehicleNumber} | QR Guard</title>
          </Helmet>

          {/* Mobile Share Modal */}
          <MobileShareModal
            isOpen={showMobileShareModal}
            onClose={() => setShowMobileShareModal(false)}
            onShare={async (mobileNumber) => {
              const success = await approveMobileNumber(mobileNumber)
              if (success) {
                setShowMobileShareModal(false)
              }
            }}
          />

          {/* Mobile Overlay Menu */}
          {isMobile && showMobileMenu && (
            <>
              <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
                onClick={() => setShowMobileMenu(false)}
              />
              
              <div className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-xl z-50 animate-slideInRight">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-primary-50 to-white">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Menu className="text-primary-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Chat Menu</h3>
                      <p className="text-xs text-gray-500">Quick actions & info</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition active:scale-95"
                    aria-label="Close menu"
                  >
                    <XIcon size={24} className="text-gray-500" />
                  </button>
                </div>
                
                <div className="h-[calc(100%-73px)] overflow-y-auto p-4 space-y-6">
                  <ChatInfo chat={chat} userType={userType} />
                  
                  <QuickActions 
                    onRefresh={refreshChat}
                    onGoHome={() => navigate('/')}
                    onEndChat={endChat}
                    isChatActive={isChatActive}
                  />
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">More Options</h4>
                    <div className="space-y-2">
                      <button 
                        onClick={() => {
                          setShowMobileMenu(false)
                          if (chat.requester?.mobileRequested && !chat.requester?.mobileApproved) {
                            setShowMobileShareModal(true)
                          }
                        }}
                        className="w-full flex items-center justify-between p-3 hover:bg-white rounded-lg transition"
                      >
                        <div className="flex items-center space-x-3">
                          <Phone size={18} className="text-gray-600" />
                          <span className="text-gray-700">
                            {chat.requester?.mobileRequested && !chat.requester?.mobileApproved 
                              ? 'Share Mobile' 
                              : 'Mobile Info'}
                          </span>
                        </div>
                        <ChevronRight size={18} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowMobileMenu(false)}
                      className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition active:scale-95"
                    >
                      Close Menu
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
            {/* Main Container */}
            <div className="max-w-7xl mx-auto">
              {/* Mobile Header */}
              {isMobile && (
                <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between p-4">
                    <button
                      onClick={() => navigate('/')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition active:scale-95"
                      aria-label="Go back"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    <div className="flex-1 px-4">
                      <div className="text-center">
                        <p className="font-bold text-gray-900 truncate">{chat.vehicleNumber}</p>
                        <div className="flex items-center justify-center space-x-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${
                            isChatActive ? 'bg-green-500' : 'bg-gray-500'
                          }`}></div>
                          <p className="text-xs text-gray-500">
                            {isChatActive ? 'Active' : 'Ended'} • Owner
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowMobileMenu(true)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition active:scale-95"
                      aria-label="Open menu"
                    >
                      <Menu size={20} />
                    </button>
                  </div>
                  
                  {isChatActive && chat?.expiresAt && (
                    <div className="px-4 pb-3">
                      <ChatTimer chat={chat} />
                    </div>
                  )}
                </div>
              )}

              {/* Desktop Header */}
              {!isMobile && (
                <div className="p-6">
                  <div className="flex flex-col space-y-4">
                    <ChatHeader 
                      chat={chat}
                      userType={userType}
                      onEndChat={endChat}
                    />
                    
                    {isChatActive && chat?.expiresAt && (
                      <ChatTimer chat={chat} />
                    )}
                  </div>
                </div>
              )}

              {/* Main Content */}
              <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                  {/* Main Chat Area */}
                  <div className="lg:col-span-2">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                      {/* Messages Container */}
                      <div className="h-[calc(100vh-300px)] md:h-[500px] overflow-y-auto p-4 md:p-6">
                        {chat.messages && chat.messages.length > 0 ? (
                          <>
                            {/* Welcome back message */}
                            <div className="text-center mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                              <div className="flex items-center justify-center space-x-2 mb-2">
                                <UserCheck className="text-green-600" size={20} />
                                <h3 className="font-semibold text-green-800">Welcome Back!</h3>
                              </div>
                              <p className="text-sm text-gray-600">
                                You've rejoined the chat. Continue your conversation.
                              </p>
                            </div>
                            
                            <ChatMessages 
                              messages={chat.messages}
                              userType={userType}
                              isTyping={sendingMessage}
                            />
                          </>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8">
                            <div className="relative mb-6">
                              <div className="w-20 h-20 bg-gradient-to-r from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                                <MessageSquare className="text-primary-600" size={32} />
                              </div>
                              <div className="absolute -bottom-2 -right-2">
                                <div className="w-10 h-10 bg-white rounded-full border-2 border-primary-100 flex items-center justify-center">
                                  <Send className="text-primary-500" size={16} />
                                </div>
                              </div>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
                            <p className="text-center text-sm max-w-sm">
                              Wait for the reporter to send a message or share your mobile number
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Input Area */}
                      {isChatActive && (
                        <div className="border-t border-gray-100 p-4 md:p-6 bg-white">
                          <ChatInput 
                            onSendMessage={sendMessage}
                            language="en"
                            disabled={!isChatActive}
                            placeholder="Type your message..."
                          />
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Bar */}
                    <div className="mt-4 md:mt-6">
                      <div className="flex flex-wrap gap-3">
                        {/* Mobile Number Share Button */}
                        {isChatActive && chat.requester?.mobileRequested && !chat.requester?.mobileApproved && (
                          <Button
                            onClick={() => setShowMobileShareModal(true)}
                            variant="primary"
                            icon={Smartphone}
                            className="flex-1"
                          >
                            Share Mobile
                          </Button>
                        )}

                        {/* End Chat Button */}
                        {isChatActive && (
                          <Button
                            onClick={endChat}
                            variant="danger"
                            icon={Shield}
                            className="flex-1"
                          >
                            End Chat
                          </Button>
                        )}

                        {/* More Actions Button (Mobile) */}
                        {isMobile && (
                          <Button
                            onClick={() => setShowMobileMenu(true)}
                            variant="outline"
                            icon={MoreVertical}
                          >
                            More
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Sidebar - Desktop Only */}
                  {!isMobile && (
                    <div className="lg:col-span-1">
                      <div className="space-y-6 sticky top-4">
                        <ChatInfo chat={chat} userType={userType} />
                        <QuickActions 
                          onRefresh={refreshChat}
                          onGoHome={() => navigate('/')}
                          onEndChat={endChat}
                          isChatActive={isChatActive}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )
    }

    // =========== OWNER JOIN SCREEN (First time or new owner) ===========
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Shield className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Join Chat</h2>
                  <p className="text-primary-100 text-sm">
                    {chat.isOwnerJoined ? 'Rejoin as vehicle owner' : 'Join as vehicle owner'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Chat Info */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Car size={16} className="mr-2" />
                        Vehicle
                      </span>
                      <span className="font-mono font-bold text-lg bg-gray-100 px-3 py-1 rounded-lg">
                        {chat.vehicleNumber}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Calendar size={16} className="mr-2" />
                        Started
                      </span>
                      <span className="text-sm font-medium">
                        {new Date(chat.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Users size={16} className="mr-2" />
                        Status
                      </span>
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                        chat.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {chat.status === 'active' ? 'Active Chat' : 'Chat Ended'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Owner Name Input */}
                <div className="bg-gradient-to-br from-primary-50 to-white border border-primary-200 rounded-xl p-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Your Name <span className="text-red-500">*</span>
                    <p className="text-xs text-gray-500 font-normal mt-1">
                      This will be visible to the reporter
                    </p>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                      maxLength={50}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button 
                    onClick={async () => {
                      setApproving(true);
                      const success = await approveChat(ownerName);
                      setApproving(false);
                    }}
                    variant="primary"
                    fullWidth
                    size="lg"
                    icon={Check}
                    disabled={approving || !ownerName.trim() || chat.status !== 'active'}
                    loading={approving}
                    className="flex-1"
                  >
                    {approving ? 'Joining...' : chat.isOwnerJoined ? 'Rejoin Chat' : 'Join Chat'}
                  </Button>
                  <Button 
                    onClick={() => navigate('/')}
                    variant="outline"
                    fullWidth
                    icon={X}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    {chat.isOwnerJoined 
                      ? 'You can rejoin this chat anytime while it\'s active'
                      : 'You\'ll be able to rejoin this chat later'
                    }
                  </p>
                  {chat.status !== 'active' && (
                    <p className="text-xs text-red-500 mt-2">
                      This chat is no longer active
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========== DEFAULT VIEW (No user type) ===========
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Access Error</h2>
          <p className="text-gray-600 mb-6 text-center">
            Unable to determine user type. Please join as reporter or owner.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/')} 
              variant="primary" 
              fullWidth 
              size="lg"
              icon={Home}
            >
              Return to Home
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              fullWidth
              icon={RefreshCw}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface