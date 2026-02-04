// components/Chat/ChatInfo.jsx - MOBILE-FRIENDLY FIXED VERSION
import React from 'react'
import { Car, User, Shield, Calendar, Phone, Info, MessageSquare, Clock } from 'lucide-react'

const ChatInfo = ({ chat, userType, compact = false }) => {
  if (!chat) return null

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch (error) {
      return '--:--'
    }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' })
    } catch (error) {
      return '--'
    }
  }

  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-primary-50 rounded">
                <Car size={14} className="text-primary-600" />
              </div>
              <span className="font-mono font-bold text-gray-900">{chat.vehicleNumber}</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              chat.status === 'active' ? 'bg-green-100 text-green-800' :
              chat.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              chat.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {chat.status.charAt(0).toUpperCase() + chat.status.slice(1)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User size={14} className="text-gray-500" />
              <span className="text-sm text-gray-600">Role</span>
            </div>
            <span className="text-sm font-medium bg-primary-100 text-primary-700 px-2 py-1 rounded">
              {userType === 'requester' ? 'Reporter' : 'Owner'}
            </span>
          </div>
          
          {chat.createdAt && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock size={14} className="text-gray-500" />
                <span className="text-sm text-gray-600">Started</span>
              </div>
              <span className="text-sm text-gray-700">{formatTime(chat.createdAt)}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Info className="text-primary-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Chat Information</h3>
            <p className="text-sm text-gray-500">Real-time details</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Vehicle Number */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Car className="text-gray-600" size={18} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Vehicle Number</p>
              <p className="font-mono font-bold text-gray-900">{chat.vehicleNumber}</p>
            </div>
          </div>
        </div>
        
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Shield className="text-gray-600" size={18} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            chat.status === 'active' ? 'bg-green-100 text-green-800 border border-green-200' :
            chat.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
            chat.status === 'completed' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
            'bg-gray-100 text-gray-800 border border-gray-200'
          }`}>
            {chat.status.charAt(0).toUpperCase() + chat.status.slice(1)}
          </span>
        </div>
        
        {/* User Role */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <User className="text-gray-600" size={18} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Your Role</p>
            </div>
          </div>
          <span className="font-medium text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-200">
            {userType === 'requester' ? 'Reporter' : 'Vehicle Owner'}
          </span>
        </div>
        
        {/* Chat Started */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Calendar className="text-gray-600" size={18} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Chat Started</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{formatDate(chat.createdAt)}</p>
            <p className="text-xs text-gray-500">{formatTime(chat.createdAt)}</p>
          </div>
        </div>
        
        {/* Mobile Request Status */}
        {chat.requester?.mobileRequested && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Phone className="text-gray-600" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mobile Request</p>
                  <p className="text-xs text-gray-500">Status</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  chat.requester?.mobileApproved 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                }`}>
                  {chat.requester?.mobileApproved ? 'Shared' : 'Pending'}
                </span>
                {chat.requester?.mobileNumber && (
                  <p className="text-xs text-gray-500 mt-1">
                    Number: {chat.requester.mobileNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Chat ID */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Chat ID</p>
            <p className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {chat._id?.substring(0, 8)}...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInfo