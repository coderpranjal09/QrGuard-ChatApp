import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useChatContext } from '../../contexts/ChatContext'
import Input from '../Common/Input'
import Button from '../Common/Button'
import RequestList from '../Dashboard/RequestList'
import { Car, User, Search, MessageSquare } from 'lucide-react'

const OwnerForm = () => {
  const navigate = useNavigate()
  const { getChatRequests, loading } = useChatContext()
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [chats, setChats] = useState([])
  const [approvingId, setApprovingId] = useState(null)

  const handleCheckRequests = async (e) => {
    e.preventDefault()
    
    if (!vehicleNumber.trim()) {
      toast.error('Please enter vehicle number')
      return
    }

    try {
      const response = await getChatRequests(vehicleNumber)
      console.log('API Response:', response) // Debug log
      
      // Handle both old and new response structure
      if (response && response.success) {
        // New structure: response.chats
        if (response.chats && response.chats.length > 0) {
          setChats(response.chats)
          toast.success(`Found ${response.chats.length} active chat(s)`)
        } 
        // Old structure: response.requests (for backward compatibility)
        else if (response.requests && response.requests.length > 0) {
          setChats(response.requests)
          toast.success(`Found ${response.requests.length} active chat(s)`)
        }
        else {
          setChats([])
          toast.info('No active chats found for this vehicle')
        }
      } else {
        setChats([])
        toast.info('No active chats found for this vehicle')
      }
    } catch (error) {
      console.error('Error fetching chats:', error)
      setChats([])
      // Error is already handled in context
    }
  }

  const handleApproveRequest = (chatId, isOwnerAlreadyJoined = false) => {
    setApprovingId(chatId)
    
    // Store owner name in localStorage for later use
    if (ownerName.trim()) {
      localStorage.setItem('qrguard_ownerName', ownerName.trim())
    }
    
    const sessionId = `owner_${Date.now()}${Math.random().toString(36).substr(2, 9)}`
    
    localStorage.setItem('qrguard_sessionId', sessionId)
    localStorage.setItem('qrguard_userType', 'owner')
    
    // Navigate to chat
    navigate(`/chat/${chatId}?userType=owner`)
    
    toast.success(isOwnerAlreadyJoined ? 'Rejoining chat...' : 'Joining chat...', {
      icon: '🔄',
      duration: 2000
    })
    
    setTimeout(() => {
      setApprovingId(null)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCheckRequests} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="flex items-center">
              <Car size={16} className="mr-2" />
              Vehicle Number
            </span>
          </label>
          <Input
            type="text"
            placeholder="Enter your vehicle number"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
            required
            className="font-mono text-lg tracking-wide"
            maxLength={15}
          />
          <p className="mt-2 text-sm text-gray-500">
            Enter the vehicle number to see active chats
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="flex items-center">
              <User size={16} className="mr-2" />
              Your Name (Optional)
            </span>
          </label>
          <Input
            type="text"
            placeholder="Enter your name for chat"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            maxLength="50"
          />
          <p className="mt-2 text-sm text-gray-500">
            Your name will be visible in the chat. If not provided, "Vehicle Owner" will be used.
          </p>
        </div>

        <Button
          type="submit"
          loading={loading}
          fullWidth
          size="lg"
          icon={Search}
          className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
        >
          Check Active Chats
        </Button>
      </form>

      {chats.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              <span className="flex items-center">
                <MessageSquare size={20} className="mr-2" />
                Active Chats ({chats.length})
              </span>
            </h3>
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                <span className="text-gray-600">Owner Joined</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></div>
                <span className="text-gray-600">Owner Not Joined</span>
              </div>
            </div>
          </div>
          
          <RequestList 
            requests={chats} 
            onApprove={handleApproveRequest}
            approvingId={approvingId}
          />
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> You can rejoin any active chat at any time. 
              The chat will remain active for 20 minutes after the last message.
            </p>
          </div>
        </div>
      )}

      {chats.length === 0 && vehicleNumber && !loading && (
        <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
          <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
            <Search className="text-gray-400" size={24} />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            No Active Chats Found
          </h4>
          <p className="text-gray-600 mb-4">
            There are no active chats for vehicle number: <strong>{vehicleNumber}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Ask the reporter to create a chat or check if the vehicle number is correct.
          </p>
        </div>
      )}
    </div>
  )
}

export default OwnerForm