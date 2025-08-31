import { NextResponse } from 'next/server'

export interface SSLStatus {
  domain: string
  status: 'healthy' | 'warning' | 'critical' | 'error'
  daysUntilExpiration: number
  expiryDate: string
  issuer: string
  lastChecked: string
  certificateDetails: {
    sanDomains: string[]
    autoRenewal: string
  }
}

// Mock function to simulate fetching SSL status from tinova-server
// In production, this could:
// 1. Make an HTTP request to tinova-server API endpoint
// 2. Read from a shared file/database
// 3. Use SSH to execute monitoring script
async function fetchSSLStatusFromServer(): Promise<SSLStatus[]> {
  // This is a mock implementation
  // Replace with actual call to tinova-server monitoring system
  
  const mockData: SSLStatus[] = [
    {
      domain: 'tinova-ai.cc',
      status: 'healthy',
      daysUntilExpiration: 83,
      expiryDate: 'Nov 23, 2025',
      issuer: 'Google Trust Services (Let\'s Encrypt)',
      lastChecked: new Date().toISOString(),
      certificateDetails: {
        sanDomains: ['tinova-ai.cc', 'auth.tinova-ai.cc'],
        autoRenewal: 'GitHub Pages'
      }
    },
    {
      domain: 'www.tinova-ai.cc',
      status: 'healthy',
      daysUntilExpiration: 77,
      expiryDate: 'Nov 17, 2025',
      issuer: 'Google Trust Services (Let\'s Encrypt)',
      lastChecked: new Date().toISOString(),
      certificateDetails: {
        sanDomains: ['tinova-ai.cc', '*.tinova-ai.cc'],
        autoRenewal: 'GitHub Pages'
      }
    }
  ]

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return mockData
}

// Determine SSL status based on days until expiration
function determineSSLStatus(daysUntilExpiration: number): SSLStatus['status'] {
  if (daysUntilExpiration < 0) return 'error'
  if (daysUntilExpiration <= 7) return 'critical'
  if (daysUntilExpiration <= 30) return 'warning'
  return 'healthy'
}

export async function GET() {
  try {
    const sslStatuses = await fetchSSLStatusFromServer()
    
    // Process and validate data
    const processedStatuses = sslStatuses.map(ssl => ({
      ...ssl,
      status: determineSSLStatus(ssl.daysUntilExpiration)
    }))

    return NextResponse.json({
      success: true,
      data: processedStatuses,
      lastUpdated: new Date().toISOString(),
      monitoring: {
        enabled: true,
        checkInterval: '12 hours',
        alertThresholds: {
          warning: 30,
          critical: 7
        }
      }
    })
  } catch (error) {
    console.error('Failed to fetch SSL status:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch SSL certificate status',
        data: [],
        lastUpdated: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Optional: POST endpoint to trigger immediate SSL check
export async function POST() {
  try {
    // This could trigger an immediate SSL check on tinova-server
    // For now, just return the current status
    const sslStatuses = await fetchSSLStatusFromServer()
    
    return NextResponse.json({
      success: true,
      message: 'SSL check triggered successfully',
      data: sslStatuses,
      triggeredAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to trigger SSL check:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to trigger SSL certificate check',
        triggeredAt: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}