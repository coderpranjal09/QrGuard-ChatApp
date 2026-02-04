// components/Pages/ReporterPage.jsx
import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import VehicleForm from '../Forms/VehicleForm'
import { 
  Car, 
  Shield, 
  MessageSquare,
  QrCode,
  AlertTriangle,
  Clock,
  MapPin,
  Send
} from 'lucide-react'

const ReporterPage = () => {
  return (
    <>
      <Helmet>
        <title>Report Incident - QR Guard</title>
        <meta name="description" content="Report a vehicle incident securely with QR Guard" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl mb-6">
            <AlertTriangle className="text-white" size={48} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Report Vehicle Incident
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Securely report vehicle issues, communicate with owners, and resolve incidents in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="p-8">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl">
                    <Car className="text-orange-600" size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Create Incident Report</h2>
                    <p className="text-gray-600">Enter vehicle details to start a secure chat</p>
                  </div>
                </div>
                
                <VehicleForm />
              </div>
            </div>

            {/* Features for Reporters */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: <Clock size={20} />,
                  title: 'Quick Reporting',
                  description: 'Predefined messages for instant incident reporting',
                  color: 'from-blue-500 to-blue-600'
                },
                {
                  icon: <Shield size={20} />,
                  title: 'Secure Communication',
                  description: 'End-to-end encrypted 20-minute chat sessions',
                  color: 'from-green-500 to-green-600'
                },
                {
                  icon: <MapPin size={20} />,
                  title: 'Location Context',
                  description: 'Provide location details for better communication',
                  color: 'from-purple-500 to-purple-600'
                },
                {
                  icon: <Send size={20} />,
                  title: 'Instant Notification',
                  description: 'Vehicle owners receive immediate alerts',
                  color: 'from-orange-500 to-orange-600'
                },
              ].map((feature, index) => (
                <div key={index} className="card hover:shadow-lg">
                  <div className="p-6">
                    <div className={`inline-flex p-3 bg-gradient-to-br ${feature.color} rounded-xl mb-4`}>
                      <div className="text-white">{feature.icon}</div>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* How It Works */}
            <div className="card">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">How to Report</h3>
                <div className="space-y-4">
                  {[
                    { step: '1', title: 'Enter Vehicle Number', desc: 'Input the vehicle registration number' },
                    { step: '2', title: 'Start Secure Chat', desc: 'Initiate 20-minute encrypted chat session' },
                    { step: '3', title: 'Send Message', desc: 'Use predefined messages or type your own' },
                    { step: '4', title: 'Share Details', desc: 'Provide location and incident details' },
                    { step: '5', title: 'Resolve Issue', desc: 'Communicate with owner until resolution' },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Shield size={20} />
                  <span>Reporting Tips</span>
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <span>Always verify vehicle number before reporting</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <span>Be specific about location and issue details</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <span>Use predefined messages for common incidents</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <span>Share mobile number only when necessary</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Statistics */}
            <div className="card">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Report Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Reports Today</span>
                    <span className="font-bold text-gray-900">156</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Response Time</span>
                    <span className="font-bold text-gray-900">2.4 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Resolution Rate</span>
                    <span className="font-bold text-green-600">94%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Chats</span>
                    <span className="font-bold text-blue-600">24</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ReporterPage