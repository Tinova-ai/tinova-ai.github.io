import { NextRequest, NextResponse } from 'next/server'

const GITHUB_CLIENT_ID = process.env.GITHUB_ID || 'Iv23lixRc9fo4TFMcA5y'
const GITHUB_CLIENT_SECRET = process.env.GITHUB_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Missing authorization code' },
        { status: 400 }
      )
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error('GitHub token error:', tokenData)
      return NextResponse.json(
        { error: tokenData.error_description || 'Failed to get access token' },
        { status: 400 }
      )
    }

    // Get user data
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    const userData = await userResponse.json()

    // Get user email if not public
    let email = userData.email
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/json',
        },
      })

      if (emailResponse.ok) {
        const emails = await emailResponse.json()
        const primaryEmail = emails.find((e: any) => e.primary)
        email = primaryEmail?.email || null
      }
    }

    return NextResponse.json({
      id: userData.id,
      login: userData.login,
      name: userData.name,
      email: email,
      avatar_url: userData.avatar_url,
    })

  } catch (error) {
    console.error('GitHub OAuth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// CORS headers for GitHub Pages
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://tinova-ai.cc',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}