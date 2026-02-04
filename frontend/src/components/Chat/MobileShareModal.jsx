// components/Chat/MobileShareModal.jsx - FIXED VERSION
import React, { useState } from 'react'
import Button from '../Common/Button'
import { Smartphone, X } from 'lucide-react'

const MobileShareModal = ({ isOpen, onClose, onShare }) => {
  const [mobileNumber, setMobileNumber] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!mobileNumber.trim()) {
      alert('Please enter your mobile number')
      return
    }

    // Validate mobile number (10 digits)
    const cleanedNumber = mobileNumber.replace(/\D/g, '')
    if (cleanedNumber.length !== 10) {
      alert('Please enter a valid 10-digit mobile number')
      return
    }

    setLoading(true)
    try {
      console.log('📱 Submitting mobile number:', cleanedNumber)
      await onShare(cleanedNumber)
      setMobileNumber('')
    } catch (error) {
      console.error('❌ Error sharing mobile:', error)
      alert('Failed to share mobile number. Please try again.')
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
                <Smartphone className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Share Mobile Number</h2>
                <p className="text-gray-600">Reporter has requested your contact</p>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  required
                  disabled={loading}
                />
                <p className="mt-2 text-sm text-gray-500">
                  This will be shared with the reporter for direct communication.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-700">
                  <strong>Note:</strong> Sharing your mobile number is optional. 
                  Only share if you're comfortable communicating directly with the reporter.
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
                  {loading ? 'Sharing...' : 'Share Number'}
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

export default MobileShareModal