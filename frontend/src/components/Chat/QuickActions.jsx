// components/Chat/QuickActions.jsx
import React from 'react'
import { Home, RefreshCw, Shield, Download, Share2, Settings } from 'lucide-react'
import Button from '../Common/Button'

const QuickActions = ({ onRefresh, onGoHome, onEndChat, isChatActive }) => {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-white border border-primary-100 rounded-xl shadow-sm p-5">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-2">
        <Button
          onClick={onRefresh}
          variant="outline"
          fullWidth
          icon={RefreshCw}
          className="justify-start"
        >
          Refresh Chat
        </Button>
        
        <Button
          onClick={onGoHome}
          variant="outline"
          fullWidth
          icon={Home}
          className="justify-start"
        >
          Go to Home
        </Button>
        
        {isChatActive && (
          <Button
            onClick={onEndChat}
            variant="danger"
            fullWidth
            icon={Shield}
            className="justify-start"
          >
            End Chat Session
          </Button>
        )}
      </div>
    </div>
  )
}

export default QuickActions