// App.js - Updated with new routes
import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'
import HomePage from './components/Pages/HomePage'
import ReporterPage from './components/Pages/ReporterPage'
import OwnerPage from './components/Pages/OwnerPage'
import ChatPage from './components/Pages/ChatPage'
import NotFoundPage from './components/Pages/NotFoundPage'
import { SocketProvider } from './contexts/SocketContext'
import { ChatProvider } from './contexts/ChatContext'
import { AuthProvider } from './contexts/AuthContext'
import { testCorsConnection } from './services/api'

function App() {
  useEffect(() => {
    const testConnection = async () => {
      try {
        await testCorsConnection()
        console.log('✅ CORS connection established successfully')
      } catch (error) {
        console.error('❌ CORS connection failed:', error.message)
      }
    }
    
    testConnection()
  }, [])

  return (
    <HelmetProvider>
      <AuthProvider>
        <SocketProvider>
          <ChatProvider>
            <Router>
              <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/reporter" element={<ReporterPage />} />
                    <Route path="/owner" element={<OwnerPage />} />
                    <Route path="/chat/:chatId" element={<ChatPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
                <Footer />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#1f2937',
                      color: '#fff',
                      borderRadius: '12px',
                      padding: '16px',
                      fontSize: '14px',
                    },
                  }}
                />
              </div>
            </Router>
          </ChatProvider>
        </SocketProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App