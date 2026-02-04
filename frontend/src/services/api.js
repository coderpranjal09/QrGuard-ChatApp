import axios from 'axios'

// Create axios instance with proper configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
  timeout: 10000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const sessionId = localStorage.getItem('qrguard_session')
    if (sessionId) {
      config.headers['X-Session-ID'] = sessionId
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error.message)
      return Promise.reject(new Error('Request timeout. Please try again.'))
    }
    
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response
      const errorMessage = data?.message || `Request failed with status ${status}`
      
      console.error(`API Error ${status}:`, errorMessage)
      
      if (status === 401) {
        // Unauthorized - clear local storage
        localStorage.removeItem('qrguard_session')
        localStorage.removeItem('qrguard_userType')
        window.location.href = '/'
      }
      
      if (status === 403) {
        return Promise.reject(new Error('Access forbidden. Please check your permissions.'))
      }
      
      if (status === 404) {
        return Promise.reject(new Error('Resource not found.'))
      }
      
      return Promise.reject(new Error(errorMessage))
    } else if (error.request) {
      // Request made but no response
      console.error('No response received:', error.request)
      return Promise.reject(new Error('Network error. Please check your internet connection.'))
    } else {
      // Something else happened
      console.error('Request setup error:', error.message)
      return Promise.reject(error)
    }
  }
)

// Test CORS connection
export const testCorsConnection = async () => {
  try {
    const response = await api.get('/test-cors')
    console.log('✅ CORS Test Successful:', response)
    return response
  } catch (error) {
    console.error('❌ CORS Test Failed:', error)
    throw error
  }
}

export { api }