import React from 'react'
import { Shield, Car, Clock, User, Download } from 'lucide-react'
import StatusBadge from '../Dashboard/StatusBadge'
import { formatDistanceToNow } from 'date-fns'

const ChatHeader = ({ chat, userType, onEndChat, onExport }) => {
  const isRequester = userType === 'requester'

  if (!chat) {
    return (
      <div className="max-w-6xl mx-auto mb-6">
        <div className="card animate-pulse">
          <div className="p-6">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    )
  }

  const timeAgo = chat.createdAt 
    ? formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true })
    : ''

  return (
    <div className="max-w-6xl mx-auto mb-6">
      <div className="card">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <Car className="text-white" size={24} />
                </div>
              </div>
              
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 font-mono">
                    {chat.vehicleNumber}
                  </h2>
                  <StatusBadge status={chat.status} />
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Clock size={14} className="mr-1.5" />
                    Created {timeAgo}
                  </span>
                  <span className="flex items-center">
                    <User size={14} className="mr-1.5" />
                    {isRequester ? 'Incident Reporter' : 'Vehicle Owner'}
                  </span>
                  <span className="flex items-center">
                    <Shield size={14} className="mr-1.5" />
                    {chat.status === 'active' ? 'Secure Chat Active' : 'Chat Ended'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={onExport}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download size={18} />
                <span>Export</span>
              </button>
              
              {chat.status === 'active' && (
                <button
                  onClick={onEndChat}
                  className="btn-primary bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  <Shield size={18} />
                  <span>End Chat</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatHeader