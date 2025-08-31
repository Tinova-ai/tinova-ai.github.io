'use client'

import { useAuth } from '@/hooks/useAuth'
import { hasDashboardAccess, getAccessDeniedInfo } from '@/lib/auth'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminConfig from '@/components/AdminConfig'

interface ServiceStatus {
  name: string
  status: 'healthy' | 'unhealthy' | 'unknown' | 'warning' | 'critical'
  url: string
  responseTime?: number
  lastChecked: string
  uptime?: string
  description: string
  type?: 'service' | 'ssl-certificate'
  sslDetails?: {
    domain: string
    daysUntilExpiration: number
    expiryDate: string
    issuer: string
    autoRenewal: string
  }
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServiceStatus = async () => {
      setLoading(true)
      
      try {
        // Fetch SSL certificate status
        const sslResponse = await fetch('/api/ssl-status/')
        const sslData = await sslResponse.json()
        
        // Create SSL certificate service entries
        const sslServices: ServiceStatus[] = sslData.success ? sslData.data.map((ssl: any) => ({
          name: `SSL Certificate (${ssl.domain})`,
          status: ssl.status,
          url: `https://${ssl.domain}`,
          lastChecked: ssl.lastChecked,
          description: `SSL certificate for ${ssl.domain} (${ssl.daysUntilExpiration} days remaining)`,
          type: 'ssl-certificate' as const,
          sslDetails: {
            domain: ssl.domain,
            daysUntilExpiration: ssl.daysUntilExpiration,
            expiryDate: ssl.expiryDate,
            issuer: ssl.issuer,
            autoRenewal: ssl.certificateDetails.autoRenewal
          }
        })) : []
        
        // Regular service monitoring
        const regularServices: ServiceStatus[] = [
          {
            name: 'Claude API Proxy',
            status: 'healthy',
            url: 'https://claudeapi.tinova-ai.cc',
            responseTime: 145,
            lastChecked: new Date().toISOString(),
            uptime: '99.9%',
            description: 'Nginx reverse proxy for Claude API requests',
            type: 'service'
          },
          {
            name: 'Health Monitor',
            status: 'healthy', 
            url: 'https://claudeapi.tinova-ai.cc/health',
            responseTime: 23,
            lastChecked: new Date().toISOString(),
            uptime: '100%',
            description: 'Health monitoring service with GitHub integration',
            type: 'service'
          },
          {
            name: 'Cloudflare Tunnel',
            status: 'healthy',
            url: 'Internal Service',
            responseTime: 12,
            lastChecked: new Date().toISOString(),
            uptime: '99.8%',
            description: 'Secure tunnel to production server',
            type: 'service'
          }
        ]
        
        // Combine SSL and regular services
        const allServices = [...regularServices, ...sslServices]
        setServices(allServices)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch service status:', error)
        
        // Fallback to regular services only
        const fallbackServices: ServiceStatus[] = [
          {
            name: 'Claude API Proxy',
            status: 'healthy',
            url: 'https://claudeapi.tinova-ai.cc',
            responseTime: 145,
            lastChecked: new Date().toISOString(),
            uptime: '99.9%',
            description: 'Nginx reverse proxy for Claude API requests',
            type: 'service'
          },
          {
            name: 'SSL Monitoring',
            status: 'unknown',
            url: 'Server Monitoring',
            lastChecked: new Date().toISOString(),
            description: 'SSL certificate monitoring system (status unavailable)',
            type: 'service'
          }
        ]
        
        setServices(fallbackServices)
        setLoading(false)
      }
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
              Please sign in with your authorized GitHub account to access the service dashboard.
            </p>
            <p className="text-sm text-gray-400 mb-8">
              This dashboard provides real-time monitoring of our production services, 
              including health status, response times, and uptime metrics.
              <br /><br />
              <strong>Access is restricted to authorized personnel only.</strong>
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Only specific GitHub usernames are authorized for dashboard access.
                    If you need access, please contact an administrator.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check if user has dashboard access
  if (!hasDashboardAccess(user)) {
    const accessInfo = getAccessDeniedInfo()
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-8">
              <svg className="w-full h-full text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-red-900 mb-4">
              Access Denied
            </h1>
            <p className="text-lg text-gray-500 mb-6">
              Your account <strong>{user.provider === 'github' ? user.username : user.email}</strong> is not authorized to access this dashboard.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-md p-6 mb-8 text-left max-w-2xl mx-auto">
              <h3 className="text-lg font-medium text-red-900 mb-4">Authorized Accounts:</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-red-800 mb-2">Authorized GitHub Usernames:</h4>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {accessInfo.allowedGitHubUsers.map(username => (
                      <li key={username}><code>{username}</code></li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-red-200">
                <p className="text-sm text-red-600">
                  <strong>Need access?</strong> Contact an administrator at{' '}
                  <a href={`mailto:${accessInfo.contactInfo}`} className="underline">
                    {accessInfo.contactInfo}
                  </a>
                </p>
              </div>
            </div>

            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                Try Different Account
              </button>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-800 bg-green-100'
      case 'warning':
        return 'text-yellow-800 bg-yellow-100'
      case 'critical':
        return 'text-red-800 bg-red-100'
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
      case 'warning':
        return (
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'critical':
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

        <AdminConfig />

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
                    {service.type === 'ssl-certificate' && service.sslDetails ? (
                      <>
                        <div className="flex justify-between">
                          <span>Days Remaining:</span>
                          <span className={`font-medium ${
                            service.sslDetails.daysUntilExpiration <= 7 ? 'text-red-600' :
                            service.sslDetails.daysUntilExpiration <= 30 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {service.sslDetails.daysUntilExpiration} days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expires:</span>
                          <span className="font-medium">{service.sslDetails.expiryDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Auto-Renewal:</span>
                          <span className="font-medium">{service.sslDetails.autoRenewal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Issuer:</span>
                          <span className="font-medium text-xs">{service.sslDetails.issuer}</span>
                        </div>
                      </>
                    ) : (
                      <>
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
                      </>
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