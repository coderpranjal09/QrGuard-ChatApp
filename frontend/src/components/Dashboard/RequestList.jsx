import React from 'react'
import { format } from 'date-fns'
import { Clock, User, MessageSquare, ArrowRight, Smartphone, Users } from 'lucide-react'
import StatusBadge from './StatusBadge'
import Button from '../Common/Button'

const RequestList = ({ requests, onApprove, approvingId }) => {
  // Handle both old structure (requests) and new structure (chats)
  const requestsData = requests || [];
  
  if (requestsData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex p-4 bg-gray-100 rounded-2xl mb-4">
          <MessageSquare className="text-gray-400" size={24} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Active Chats Found
        </h3>
        <p className="text-gray-600">
          There are no active chats for this vehicle number.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requestsData.map((request) => {
        const isApproving = approvingId === request.chatId;
        
        return (
          <div
            key={request._id || request.chatId}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-4 flex-1">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center">
                    <MessageSquare className="text-primary-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="font-semibold text-gray-900 text-lg">
                        Active Chat
                      </h4>
                      <div className="flex items-center space-x-2">
                        {request.isOwnerJoined ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Users size={12} className="mr-1" />
                            Owner Joined
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Users size={12} className="mr-1" />
                            Owner Not Joined
                          </span>
                        )}
                        <StatusBadge status={request.status || 'active'} />
                      </div>
                    </div>
                    
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center text-sm">
                        <span className="text-gray-700 font-medium mr-2">Chat ID:</span>
                        <code className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">
                          {request.chatId?.substring(0, 12)}...
                        </code>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock size={14} className="mr-1.5" />
                          {format(new Date(request.createdAt), 'dd MMM yyyy, hh:mm a')}
                        </span>
                        
                        <span className="flex items-center">
                          <MessageSquare size={14} className="mr-1.5" />
                          {request.messages?.length || 0} messages
                        </span>
                      </div>
                    </div>
                    
                    {request.requester?.mobileRequested && (
                      <div className="mt-3 inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
                        <Smartphone size={14} className="mr-2" />
                        <span className="font-medium">Mobile number requested</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:w-48 flex justify-end lg:justify-center">
                <Button
                  onClick={() => onApprove(request.chatId, request.isOwnerJoined)}
                  loading={isApproving}
                  disabled={isApproving}
                  variant="primary"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="w-full lg:w-auto whitespace-nowrap"
                  size="lg"
                >
                  {isApproving 
                    ? 'Joining...' 
                    : request.isOwnerJoined 
                      ? 'Rejoin Chat' 
                      : 'Join Chat'
                  }
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )
}

export default RequestList