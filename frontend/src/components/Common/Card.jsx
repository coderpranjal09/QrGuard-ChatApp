import React from 'react'
import { clsx } from 'clsx'

const Card = React.forwardRef(({
  children,
  className,
  hover = false,
  padding = 'md',
  border = true,
  shadow = 'soft',
  ...props
}, ref) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    soft: 'shadow-soft',
    md: 'shadow-md',
    lg: 'shadow-lg',
  }

  const classes = clsx(
    'bg-white rounded-2xl',
    border && 'border border-gray-200',
    paddingClasses[padding],
    shadowClasses[shadow],
    hover && 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
    className
  )

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  )
})

Card.displayName = 'Card'

export default Card