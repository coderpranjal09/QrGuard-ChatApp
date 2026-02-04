import React from 'react'

const Loader = ({ size = 'md', variant = 'primary', text, className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  }

  const variantClasses = {
    primary: 'border-primary-200 border-t-primary-600',
    white: 'border-white/20 border-t-white',
    dark: 'border-gray-200 border-t-gray-600',
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full animate-spin`} />
      {text && (
        <p className="mt-4 text-sm text-gray-600">{text}</p>
      )}
    </div>
  )
}

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader size="lg" text="Loading QR Guard..." />
  </div>
)

export const CardLoader = () => (
  <div className="p-8">
    <Loader text="Loading content..." />
  </div>
)

export default Loader