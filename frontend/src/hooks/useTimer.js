import { useState, useEffect, useCallback } from 'react'

export const useTimer = (initialSeconds, onExpire) => {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isActive, setIsActive] = useState(false)
  const [isExpired, setIsExpired] = useState(false)

  const start = useCallback(() => {
    setIsActive(true)
    setIsExpired(false)
  }, [])

  const stop = useCallback(() => {
    setIsActive(false)
  }, [])

  const reset = useCallback((newSeconds = initialSeconds) => {
    setSeconds(newSeconds)
    setIsActive(false)
    setIsExpired(false)
  }, [initialSeconds])

  const addTime = useCallback((additionalSeconds) => {
    setSeconds(prev => prev + additionalSeconds)
  }, [])

  useEffect(() => {
    let interval = null

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            setIsActive(false)
            setIsExpired(true)
            if (onExpire) onExpire()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval)
    }

    return () => clearInterval(interval)
  }, [isActive, seconds, onExpire])

  const formatTime = useCallback(() => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [seconds])

  return {
    seconds,
    isActive,
    isExpired,
    start,
    stop,
    reset,
    addTime,
    formatTime,
  }
}