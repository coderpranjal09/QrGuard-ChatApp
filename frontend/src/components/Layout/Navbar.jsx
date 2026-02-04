// components/Layout/Navbar.jsx - Update navigation links
import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, MessageSquare, Car } from 'lucide-react'

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg">
              <Shield className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-gray-900">QR Guard</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/reporter"
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <MessageSquare size={18} />
              <span>Report Incident</span>
            </Link>
            <Link
              to="/owner"
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Car size={18} />
              <span>Vehicle Owner</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar