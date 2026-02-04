// components/Chat/MobileRequestModal.jsx - UPDATED FOR OWNER
import React, { useState } from 'react'
import Button from '../Common/Button'
import { Phone, X } from 'lucide-react'

const MobileRequestModal = ({ isOpen, onClose, onRequest }) => {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onRequest()
    } catch (error) {
      console.error('❌ Error requesting mobile:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Request Mobile Number</h2>
                <p className="text-gray-600">Request reporter's contact number</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> You are requesting the reporter's mobile number for direct communication. 
                  The reporter can choose to approve or reject this request.
                </p>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Sending Request...' : 'Send Request'}
                </Button>
                <Button
                  type="button"
                  onClick={onClose}
                  variant="secondary"
                  fullWidth
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default MobileRequestModal