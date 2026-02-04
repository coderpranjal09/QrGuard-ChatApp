import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useChatContext } from '../../contexts/ChatContext'
import Input from '../Common/Input'
import Button from '../Common/Button'
import RequestList from '../Dashboard/RequestList'
import { Car, User, Search } from 'lucide-react'

const OwnerForm = () => {
  const navigate = useNavigate()
  const { getChatRequests, loading } = useChatContext()
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [requests, setRequests] = useState([])

  const handleCheckRequests = async (e) => {
    e.preventDefault()
    
    if (!vehicleNumber.trim()) {
      toast.error('Please enter vehicle number')
      return
    }

    try {
      const fetchedRequests = await getChatRequests(vehicleNumber)
      setRequests(fetchedRequests || [])
      
      if (!fetchedRequests || fetchedRequests.length === 0) {
        toast.info('No pending requests found for this vehicle')
      }
    } catch (error) {
      // Error handled in context
    }
  }

  const handleApproveRequest = (chatId) => {
    const sessionId = `owner_${Date.now()}`
    const name = ownerName.trim() || 'Vehicle Owner'
    
    localStorage.setItem('qrguard_session', sessionId)
    localStorage.setItem('qrguard_userType', 'owner')
    
    navigate(`/chat/${chatId}?userType=owner`)
    toast.success('Redirecting to chat...')
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCheckRequests} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Number
          </label>
          <Input
            type="text"
            placeholder="Enter your vehicle number"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
            required
            icon={Car}
            className="text-uppercase font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name (Optional)
          </label>
          <Input
            type="text"
            placeholder="Enter your name"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            icon={User}
            maxLength="50"
          />
          <p className="mt-2 text-sm text-gray-500">
            Your name will be visible to the requester
          </p>
        </div>

        <Button
          type="submit"
          loading={loading}
          fullWidth
          size="lg"
          icon={Search}
        >
          Check Requests
        </Button>
      </form>

      {requests.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pending Requests ({requests.length})
          </h3>
          <RequestList 
            requests={requests} 
            onApprove={handleApproveRequest}
          />
        </div>
      )}
    </div>
  )
}

export default OwnerForm