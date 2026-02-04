import React from 'react'
import { clsx } from 'clsx'

const Input = React.forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  variant = 'default',
  className,
  containerClassName,
  ...props
}, ref) => {
  const inputClasses = clsx(
    'w-full px-4 py-3 bg-white border-2 rounded-xl text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed focus:shadow-sm',
    variant === 'default' && 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200',
    variant === 'error' && 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200',
    variant === 'success' && 'border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200',
    Icon && 'pl-12',
    className
  )

  return (
    <div className={clsx('space-y-2', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
      </div>
      
      {(error || helperText) && (
        <p className={clsx(
          'text-sm',
          error ? 'text-red-600' : 'text-gray-500'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input