import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useChatContext } from '../../contexts/ChatContext'
import Input from '../Common/Input'
import Button from '../Common/Button'
import Alert from '../Common/Alert'
import { Car, AlertCircle, CheckCircle } from 'lucide-react'

const VehicleForm = () => {
  const navigate = useNavigate()
  const { createChatRequest, loading } = useChatContext()
  const [vehicleNumber, setVehicleNumber] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!vehicleNumber.trim()) {
      toast.error('Please enter vehicle number')
      return
    }

    try {
      const response = await createChatRequest(vehicleNumber)
      
      if (response) {
        localStorage.setItem('qrguard_session', response.sessionId)
        localStorage.setItem('qrguard_userType', 'requester')
        
        toast.success('Chat request created successfully!')
        navigate(`/chat/${response.chatId}?userType=requester`)
      }
    } catch (error) {
      // Error handled in context
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vehicle Number
        </label>
        <Input
          type="text"
          placeholder="DL 01 AB 1234"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
          required
          icon={Car}
          className="text-uppercase font-mono"
          maxLength="15"
        />
        <p className="mt-2 text-sm text-gray-500 flex items-center">
          <CheckCircle className="mr-2 text-green-500" size={16} />
          Will be automatically converted to uppercase
        </p>
      </div>

      <Alert variant="warning" title="Important Information">
        <ul className="space-y-1">
          <li>• You can only send predefined messages initially</li>
          <li>• Chat expires automatically after 20 minutes</li>
          <li>• Vehicle owner can request your mobile number</li>
          <li>• All chats are securely logged for records</li>
        </ul>
      </Alert>

      <Button
        type="submit"
        loading={loading}
        fullWidth
        size="lg"
        icon={Car}
        className="mt-6"
      >
        Create Chat Request
      </Button>
    </form>
  )
}

export default VehicleForm