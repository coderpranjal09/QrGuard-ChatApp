export const validateVehicleNumber = (number) => {
  if (!number || number.trim() === '') {
    return { valid: false, message: 'Vehicle number is required' }
  }

  const formatted = number.toUpperCase().replace(/\s/g, '')
  
  if (formatted.length < 5 || formatted.length > 15) {
    return { valid: false, message: 'Vehicle number must be between 5 and 15 characters' }
  }

  const pattern = /^[A-Z0-9]+$/
  if (!pattern.test(formatted)) {
    return { valid: false, message: 'Vehicle number can only contain letters and numbers' }
  }

  return { valid: true, message: '', formatted }
}

export const validateMobileNumber = (number) => {
  if (!number || number.trim() === '') {
    return { valid: false, message: 'Mobile number is required' }
  }

  const cleaned = number.replace(/\D/g, '')
  
  if (cleaned.length !== 10) {
    return { valid: false, message: 'Mobile number must be 10 digits' }
  }

  const pattern = /^[6-9]\d{9}$/
  if (!pattern.test(cleaned)) {
    return { valid: false, message: 'Please enter a valid Indian mobile number' }
  }

  return { valid: true, message: '', formatted: cleaned }
}

export const validateName = (name) => {
  if (!name || name.trim() === '') {
    return { valid: true, message: '' } // Name is optional
  }

  if (name.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' }
  }

  if (name.length > 50) {
    return { valid: false, message: 'Name must be less than 50 characters' }
  }

  const pattern = /^[a-zA-Z\s.'-]+$/
  if (!pattern.test(name)) {
    return { valid: false, message: 'Name contains invalid characters' }
  }

  return { valid: true, message: '' }
}

export const validateMessage = (message) => {
  if (!message || message.trim() === '') {
    return { valid: false, message: 'Message cannot be empty' }
  }

  if (message.length > 500) {
    return { valid: false, message: 'Message must be less than 500 characters' }
  }

  return { valid: true, message: '' }
}