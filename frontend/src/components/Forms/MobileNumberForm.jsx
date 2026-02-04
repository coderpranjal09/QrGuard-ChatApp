import React, { useState } from 'react'
import Input from '../Common/Input'
import Button from '../Common/Button'
import { Phone, Shield, AlertCircle } from 'lucide-react'

const MobileNumberForm = ({ onSubmit, onCancel, loading }) => {
  const [mobileNumber, setMobileNumber] = useState('')
  const [error, setError] = useState('')

  const validateMobileNumber = (number) => {
    const cleaned = number.replace(/\D/g, '')
    
    if (cleaned.length !== 10) {
      return 'Mobile number must be 10 digits'
    }

    const pattern = /^[6-9]\d{9}$/
    if (!pattern.test(cleaned)) {
      return 'Please enter a valid Indian mobile number'
    }

    return ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const validationError = validateMobileNumber(mobileNumber)
    if (validationError) {
      setError(validationError)
      return
    }

    const cleanedNumber = mobileNumber.replace(/\D/g, '')
    onSubmit(cleanedNumber)
  }

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
    setMobileNumber(value)
    
    if (error) {
      setError('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <div className="inline-flex p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl mb-4">
          <Phone className="text-primary-600" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Share Mobile Number
        </h3>
        <p className="text-gray-600">
          The vehicle owner has requested your mobile number for direct contact.
        </p>
      </div>

      <div>
        <Input
          type="tel"
          label="Mobile Number"
          placeholder="Enter your 10-digit mobile number"
          value={mobileNumber}
          onChange={handleChange}
          error={error}
          icon={Phone}
          maxLength="10"
          pattern="[0-9]*"
          inputMode="numeric"
          required
        />
      </div>

      <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Shield className="text-primary-600 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Privacy & Security</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Your number is only shared with the vehicle owner</li>
              <li>• Number is removed from system after chat ends</li>
              <li>• Used only for direct communication purposes</li>
              <li>• You can decline this request</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          type="submit"
          loading={loading}
          fullWidth
          variant="primary"
          icon={Phone}
        >
          Share & Continue
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          fullWidth
          variant="secondary"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default MobileNumberForm