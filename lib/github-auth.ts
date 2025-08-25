'use client'

import { ALLOWED_USERS, isUserAllowed } from './auth-config'

// Real GitHub OAuth implementation
export interface GitHubUser {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
  organizations?: string[]
}

// Simulate GitHub OAuth flow
export async function signInWithGitHub(): Promise<GitHubUser | null> {
  try {
    // In production, this would redirect to GitHub OAuth
    // For demo, we'll simulate the OAuth flow
    
    if (typeof window === 'undefined') return null
    
    // Show a prompt to enter GitHub username for demo
    const username = window.prompt(
      'Demo: Enter your GitHub username to simulate OAuth login:'
    )
    
    if (!username) return null
    
    // Check if user is allowed
    if (!isUserAllowed('github', username)) {
      alert(`Access denied. User "${username}" is not in the allowed list.\n\nAllowed users: ${ALLOWED_USERS.github.join(', ')}\n\nPlease contact an administrator to request access.`)
      return null
    }
    
    // Simulate successful GitHub user data
    const mockUser: GitHubUser = {
      id: Math.floor(Math.random() * 1000000),
      login: username,
      name: `${username} (Demo)`,
      email: `${username}@github.com`,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      organizations: ['tinova-ai'], // Demo org membership
    }
    
    return mockUser
    
  } catch (error) {
    console.error('GitHub auth error:', error)
    return null
  }
}

// Real GitHub OAuth implementation for production
export function initiateGitHubOAuth(): void {
  if (typeof window === 'undefined') return
  
  const clientId = process.env.NEXT_PUBLIC_GITHUB_ID
  if (!clientId) {
    console.error('GitHub Client ID not configured')
    return
  }
  
  const redirectUri = `${window.location.origin}/auth/github/callback`
  const scope = 'read:user user:email read:org'
  const state = Math.random().toString(36).substring(7)
  
  // Store state for verification
  sessionStorage.setItem('github_oauth_state', state)
  
  const authUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `state=${state}`
  
  window.location.href = authUrl
}

// Verify user has required permissions
export async function verifyGitHubAccess(user: GitHubUser): Promise<boolean> {
  // Check if user is in allowed list
  if (isUserAllowed('github', user.login)) {
    return true
  }
  
  // In production, check organization membership via GitHub API
  try {
    // This would be a real API call to check org membership
    const orgs = await fetchUserOrganizations(user.login)
    return orgs.some(org => ALLOWED_USERS.github.includes(org))
  } catch (error) {
    console.error('Error verifying GitHub access:', error)
    return false
  }
}

async function fetchUserOrganizations(username: string): Promise<string[]> {
  // In production, this would call GitHub API
  // For demo, return mock organizations
  return ['tinova-ai']
}