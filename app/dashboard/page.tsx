'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface ServiceStatus {
  name: string
  status: 'healthy' | 'unhealthy' | 'unknown'
  url: string
  responseTime?: number
  lastChecked: string
  uptime?: string
  description: string
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServiceStatus = async () => {
      setLoading(true)
      
      // Simulate fetching service status
      // In production, this would call your actual monitoring API
      const mockServices: ServiceStatus[] = [
        {
          name: 'Claude API Proxy',
          status: 'healthy',
          url: 'https://claudeapi.tinova-ai.cc',
          responseTime: 145,
          lastChecked: new Date().toISOString(),
          uptime: '99.9%',
          description: 'Nginx reverse proxy for Claude API requests'
        },
        {
          name: 'Health Monitor',
          status: 'healthy', 
          url: 'https://claudeapi.tinova-ai.cc/health',
          responseTime: 23,
          lastChecked: new Date().toISOString(),
          uptime: '100%',
          description: 'Health monitoring service with GitHub integration'
        },
        {
          name: 'Cloudflare Tunnel',
          status: 'healthy',
          url: 'Internal Service',
          responseTime: 12,
          lastChecked: new Date().toISOString(),
          uptime: '99.8%',
          description: 'Secure tunnel to production server'
        }
      ]
      
      // Simulate API delay
      setTimeout(() => {
        setServices(mockServices)
        setLoading(false)
      }, 1000)
    }

    if (user) {
      fetchServiceStatus()
    } else {
      setLoading(false)
    }
  }, [user])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-8">
              <svg className="w-full h-full text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
              Authentication Required
            </h1>
            <p className="text-lg text-gray-500 mb-8">
              Please sign in with your GitHub or Google account to access the service dashboard.
            </p>
            <p className="text-sm text-gray-400 mb-8">
              This dashboard provides real-time monitoring of our production services, 
              including health status, response times, and uptime metrics.
            </p>
            <Link
              href="/api/auth/signin"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Sign In to View Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-800 bg-green-100'
      case 'unhealthy':
        return 'text-red-800 bg-red-100'
      default:
        return 'text-gray-800 bg-gray-100'
    }
  }

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'unhealthy':
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Service Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Real-time monitoring of Tinova.ai production services
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white shadow rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {services.map((service, index) => (
                <div key={index} className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                    <div className="flex items-center">
                      {getStatusIcon(service.status)}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    {service.responseTime && (
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span className="font-medium">{service.responseTime}ms</span>
                      </div>
                    )}
                    {service.uptime && (
                      <div className="flex justify-between">
                        <span>Uptime:</span>
                        <span className="font-medium">{service.uptime}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Last Checked:</span>
                      <span className="font-medium">
                        {new Date(service.lastChecked).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {services.filter(s => s.status === 'healthy').length}/{services.length}
                  </div>
                  <div className="text-sm text-gray-600">Services Online</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {services.reduce((avg, s) => avg + (s.responseTime || 0), 0) / services.length || 0}ms
                  </div>
                  <div className="text-sm text-gray-600">Average Response</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">99.9%</div>
                  <div className="text-sm text-gray-600">Overall Uptime</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}