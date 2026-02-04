// components/Pages/OwnerPage.jsx
import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import OwnerForm from '../Forms/OwnerForm'
import RequestList from '../Dashboard/RequestList'
import { 
  Car, 
  Shield, 
  Bell,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Users
} from 'lucide-react'

const OwnerPage = () => {
  const [requests, setRequests] = useState([])

  return (
    <>
      <Helmet>
        <title>Vehicle Owner Portal - QR Guard</title>
        <meta name="description" content="Check and respond to incident reports for your vehicle" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mb-6">
            <Shield className="text-white" size={48} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Vehicle Owner Portal
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            View and respond to incident reports for your vehicles in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="p-8">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                    <Car className="text-blue-600" size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Check Vehicle Requests</h2>
                    <p className="text-gray-600">Enter your vehicle number to view incident reports</p>
                  </div>
                </div>
                
                <OwnerForm onRequestsLoaded={setRequests} />
              </div>
            </div>

            {/* Requests List */}
            {requests.length > 0 ? (
              <div className="mt-8 animate-in slide-up">
                <div className="card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Incident Reports</h3>
                        <p className="text-gray-600">{requests.length} active reports for your vehicle</p>
                      </div>
                      <div className="flex items-center space-x-2 text-blue-600">
                        <Bell size={20} />
                        <span className="font-semibold">Real-time</span>
                      </div>
                    </div>
                    <RequestList requests={requests} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="p-8 text-center">
                  <div className="inline-flex p-4 bg-blue-100 rounded-full mb-4">
                    <MessageSquare className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Reports</h3>
                  <p className="text-gray-600 mb-4">
                    When someone reports an incident about your vehicle, it will appear here.
                  </p>
                  <div className="inline-flex items-center space-x-2 text-blue-600">
                    <CheckCircle size={16} />
                    <span className="text-sm font-medium">Your vehicle is currently clear</span>
                  </div>
                </div>
              </div>
            )}

            {/* Owner Features */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: <Bell size={20} />,
                  title: 'Instant Notifications',
                  description: 'Get real-time alerts for new incident reports',
                  color: 'from-green-500 to-green-600'
                },
                {
                  icon: <Shield size={20} />,
                  title: 'Secure Response',
                  description: 'Respond through encrypted chat sessions',
                  color: 'from-purple-500 to-purple-600'
                },
                {
                  icon: <Clock size={20} />,
                  title: 'Quick Resolution',
                  description: '20-minute chat window for fast issue resolution',
                  color: 'from-orange-500 to-orange-600'
                },
                {
                  icon: <AlertCircle size={20} />,
                  title: 'Incident History',
                  description: 'Track all reported incidents for your vehicles',
                  color: 'from-blue-500 to-blue-600'
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
            {/* Quick Stats */}
            <div className="card">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Your Vehicle Status</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-green-800">Active Reports</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">0</p>
                      </div>
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="text-green-600" size={20} />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-blue-800">Response Rate</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">100%</p>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MessageSquare className="text-blue-600" size={20} />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-purple-800">Avg Resolution Time</p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">4.2m</p>
                      </div>
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Clock className="text-purple-600" size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Owner Guidelines */}
            <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Owner Guidelines</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <span>Respond promptly to incident reports</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <span>Verify reporter details before sharing contact</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <span>Use secure chat for all communication</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <span>Mark incidents as resolved when complete</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">Parking Issue Resolved</p>
                    <p className="text-sm text-gray-600 mt-1">Yesterday, 14:30 • 5 min chat</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">Light Left On Notification</p>
                    <p className="text-sm text-gray-600 mt-1">2 days ago, 09:15 • 3 min chat</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">Window Open Alert</p>
                    <p className="text-sm text-gray-600 mt-1">1 week ago, 18:45 • 7 min chat</p>
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

export default OwnerPage