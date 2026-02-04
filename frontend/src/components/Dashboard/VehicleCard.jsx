import React from 'react'
import { Car, Clock, MapPin, AlertTriangle } from 'lucide-react'
import StatusBadge from './StatusBadge'

const VehicleCard = ({ vehicle, onClick }) => {
  const {
    vehicleNumber,
    status,
    lastActive,
    location,
    incidentCount = 0,
  } = vehicle

  const formatTime = (date) => {
    if (!date) return 'Never'
    const now = new Date()
    const lastActiveDate = new Date(date)
    const diffMs = now - lastActiveDate
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  return (
    <div
      onClick={onClick}
      className="card hover:shadow-lg cursor-pointer transition-all duration-300 group"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 font-mono">
              {vehicleNumber}
            </h3>
            {location && (
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <MapPin size={14} className="mr-1" />
                {location}
              </p>
            )}
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="text-blue-600" size={18} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Active</p>
              <p className="font-semibold text-gray-900">
                {formatTime(lastActive)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="text-red-600" size={18} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Incidents</p>
              <p className="font-semibold text-gray-900">
                {incidentCount} reports
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Vehicle Details</span>
            <Car className="text-gray-400 group-hover:text-primary-600 transition-colors" size={18} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default VehicleCard