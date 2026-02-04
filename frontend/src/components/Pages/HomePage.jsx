// components/Pages/HomePage.jsx - Simplified version
import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { 
  Car, 
  Shield, 
  MessageSquare,
  QrCode,
  Lock,
  Zap,
  Bell,
  CheckCircle
} from 'lucide-react'

const HomePage = () => {
  const features = [
    {
      icon: <Lock />,
      title: 'Secure Communication',
      description: 'End-to-end encrypted chats with auto-expiry for maximum privacy',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Zap />,
      title: 'Instant Reporting',
      description: 'Quick incident reporting with predefined messages',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <Car />,
      title: 'Vehicle Recognition',
      description: 'Automatic vehicle number formatting and validation',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <Shield />,
      title: 'Privacy First',
      description: 'Optional mobile number sharing with consent',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: <Bell />,
      title: 'Real-time Notifications',
      description: 'Instant alerts for vehicle owners',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: <CheckCircle />,
      title: 'Quick Resolution',
      description: '20-minute chat sessions for fast issue resolution',
      color: 'from-teal-500 to-teal-600'
    },
  ]

  const howItWorks = [
    {
      step: '1',
      title: 'Report Incident',
      description: 'Reporter enters vehicle number to create chat request',
      icon: <MessageSquare size={20} />
    },
    {
      step: '2',
      title: 'Owner Notification',
      description: 'Vehicle owner receives instant notification',
      icon: <Bell size={20} />
    },
    {
      step: '3',
      title: 'Secure Chat',
      description: '20-minute encrypted chat session starts',
      icon: <Lock size={20} />
    },
    {
      step: '4',
      title: 'Issue Resolution',
      description: 'Communicate and resolve the incident',
      icon: <CheckCircle size={20} />
    },
  ]

  return (
    <>
      <Helmet>
        <title>QR Guard - Secure Vehicle Incident Reporting</title>
        <meta name="description" content="Secure vehicle incident reporting system with real-time encrypted communication between reporters and vehicle owners" />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl mb-8 shadow-xl">
            <Shield className="text-white" size={56} />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Secure Vehicle
            <span className="block text-primary-600">Incident Reporting</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Connect vehicle owners and reporters instantly with our encrypted chat system. 
            Report incidents, communicate securely, and resolve issues in real-time.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              to="/reporter"
              className="btn-primary px-10 py-4 text-lg flex items-center justify-center space-x-3"
            >
              <MessageSquare size={24} />
              <span>Report an Incident</span>
            </Link>
            <Link
              to="/owner"
              className="btn-secondary px-10 py-4 text-lg flex items-center justify-center space-x-3"
            >
              <Shield size={24} />
              <span>I'm a Vehicle Owner</span>
            </Link>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How QR Guard Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A simple 4-step process for secure vehicle incident reporting
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step) => (
              <div key={step.step} className="card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl mb-6 text-2xl font-bold">
                    {step.step}
                  </div>
                  <div className="mb-4 text-primary-600">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose QR Guard
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed for secure and efficient incident reporting
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card hover:shadow-xl transition-all duration-300">
                <div className="p-8">
                  <div className={`inline-flex p-4 bg-gradient-to-br ${feature.color} rounded-2xl mb-6`}>
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="card bg-gradient-to-br from-gray-900 to-gray-950 text-white">
            <div className="p-12 md:p-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Secure Your Vehicle?
              </h2>
              <p className="text-gray-300 mb-10 max-w-2xl mx-auto text-lg">
                Join thousands of vehicle owners and reporters who trust QR Guard for 
                secure incident reporting and communication.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link
                  to="/reporter"
                  className="btn-primary bg-white text-gray-900 hover:bg-gray-100 px-10 py-4 text-lg"
                >
                  Report an Incident
                </Link>
                <Link
                  to="/owner"
                  className="btn-secondary bg-transparent border-white text-white hover:bg-white/10 px-10 py-4 text-lg"
                >
                  Check Your Vehicle
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default HomePage