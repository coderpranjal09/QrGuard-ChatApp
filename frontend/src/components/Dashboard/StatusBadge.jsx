import React from 'react'
import { clsx } from 'clsx'
import { Clock, CheckCircle, XCircle, AlertTriangle, Zap } from 'lucide-react'

const StatusBadge = ({ status, showIcon = true, size = 'md' }) => {
  const statusConfig = {
    pending: {
      label: 'Pending',
      icon: Clock,
      className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      iconColor: 'text-yellow-600',
    },
    active: {
      label: 'Active',
      icon: Zap,
      className: 'bg-green-50 text-green-700 border-green-200',
      iconColor: 'text-green-600',
    },
    completed: {
      label: 'Completed',
      icon: CheckCircle,
      className: 'bg-blue-50 text-blue-700 border-blue-200',
      iconColor: 'text-blue-600',
    },
    expired: {
      label: 'Expired',
      icon: XCircle,
      className: 'bg-gray-50 text-gray-700 border-gray-200',
      iconColor: 'text-gray-600',
    },
    rejected: {
      label: 'Rejected',
      icon: XCircle,
      className: 'bg-red-50 text-red-700 border-red-200',
      iconColor: 'text-red-600',
    },
  }

  const config = statusConfig[status] || statusConfig.pending
  const Icon = config.icon
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <div
      className={clsx(
        'inline-flex items-center rounded-full border',
        config.className,
        sizeClasses[size]
      )}
    >
      {showIcon && <Icon className={clsx('w-3 h-3 mr-1.5', config.iconColor)} />}
      <span className="font-semibold">{config.label}</span>
    </div>
  )
}

export default StatusBadge