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

// Fetch SSL status from tinova-server via Cloudflare tunnel
async function fetchSSLStatusFromServer(): Promise<SSLStatus[]> {
  try {
    // Create timeout controller
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch('https://server-stat.tinova-ai.cc/ssl-status', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'tinova-web-dashboard/1.0'
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    
    // Validate the response structure from server-stat API
    if (!result.success || !Array.isArray(result.data)) {
      throw new Error(`Server API error: ${result.error || 'Invalid response format'}`)
    }

    return result.data
  } catch (error) {
    console.error('Failed to fetch SSL status from server-stat API:', error)
    
    // Fallback to mock data if live API fails
    console.warn('Using fallback mock data due to API failure')
    const fallbackData: SSLStatus[] = [
      {
        domain: 'tinova-ai.cc',
        status: 'error',
        daysUntilExpiration: -1,
        expiryDate: 'API Error',
        issuer: 'Unable to fetch from server',
        lastChecked: new Date().toISOString(),
        certificateDetails: {
          sanDomains: ['API connection failed'],
          autoRenewal: 'Unknown'
        }
      }
    ]
    
    return fallbackData
  }
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

// POST endpoint to trigger immediate SSL check on tinova-server
export async function POST() {
  try {
    // Create timeout controller
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    // Trigger SSL check on server-stat API
    const response = await fetch('https://server-stat.tinova-ai.cc/ssl-check', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'tinova-web-dashboard/1.0'
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'SSL check triggered successfully',
      data: result.data || result,
      triggeredAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to trigger SSL check:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to trigger SSL certificate check',
        details: error instanceof Error ? error.message : 'Unknown error',
        triggeredAt: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}