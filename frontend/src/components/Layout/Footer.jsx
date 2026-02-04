import React from 'react'
import { Link } from 'react-router-dom'
import { Car, Shield, Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-16 bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg">
                <Shield size={24} />
              </div>
              <h2 className="text-2xl font-bold">
                QR Guard
                <span className="text-primary-400">.</span>
              </h2>
            </div>
            <p className="text-gray-400 mb-6">
              Securing vehicles through innovative incident reporting and real-time communication systems.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {['Home', 'Report Incident', 'Check Requests', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <Link
                    to="#"
                    className="text-gray-400 hover:text-primary-400 transition-colors flex items-center space-x-2 group"
                  >
                    <Car size={14} className="group-hover:translate-x-1 transition-transform" />
                    <span>{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 group">
                <Phone className="text-primary-400 mt-1 group-hover:scale-110 transition-transform" size={18} />
                <div>
                  <p className="font-medium">24/7 Support</p>
                  <p className="text-gray-400">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 group">
                <Mail className="text-primary-400 mt-1 group-hover:scale-110 transition-transform" size={18} />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-400">support@qrguard.tech</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 group">
                <MapPin className="text-primary-400 mt-1 group-hover:scale-110 transition-transform" size={18} />
                <div>
                  <p className="font-medium">Headquarters</p>
                  <p className="text-gray-400">123 Security St, Tech City</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Stay Updated</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for the latest updates.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 px-4 py-2 rounded-r-lg font-medium transition-all duration-300"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-3 text-xs text-gray-500">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © {currentYear} QR Guard Technologies. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="#" className="text-gray-400 hover:text-primary-400 text-sm">
                Privacy Policy
              </Link>
              <Link to="#" className="text-gray-400 hover:text-primary-400 text-sm">
                Terms of Service
              </Link>
              <Link to="#" className="text-gray-400 hover:text-primary-400 text-sm">
                Cookie Policy
              </Link>
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm mt-4">
            Designed with ❤️ for vehicle security and safety
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer