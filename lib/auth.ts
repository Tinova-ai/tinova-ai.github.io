'use client'

import { signInWithGitHub, type GitHubUser } from './github-auth'
import { ALLOWED_USERS, isUserAllowed } from './auth-config'

// Enhanced authentication with access control
export interface User {
  id: string
  name: string
  email: string
  image?: string
  provider: 'github' | 'google'
  username?: string
  organizations?: string[]
}

const AUTH_KEY = 'tinova_auth'

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(AUTH_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function setStoredUser(user: User | null) {
  if (typeof window === 'undefined') return
  
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(AUTH_KEY)
  }
}

export async function signIn(provider: 'github' | 'google'): Promise<User | null> {
  try {
    if (provider === 'github') {
      const githubUser = await signInWithGitHub()
      if (!githubUser) return null
      
      const user: User = {
        id: githubUser.id.toString(),
        name: githubUser.name || githubUser.login,
        email: githubUser.email || `${githubUser.login}@github.com`,
        provider: 'github',
        username: githubUser.login,
        image: githubUser.avatar_url,
        organizations: githubUser.organizations,
      }
      
      setStoredUser(user)
      return user
    }
    
    if (provider === 'google') {
      // Simulate Google OAuth with access control
      const email = window.prompt(
        'Demo: Enter your Google email to simulate OAuth login:'
      )
      
      if (!email) return null
      
      // Check if user is allowed
      if (!isUserAllowed('google', email)) {
        alert(`Access denied. Email "${email}" is not in the allowed list.\n\nAllowed emails: ${ALLOWED_USERS.google.join(', ')}\n\nPlease contact an administrator to request access.`)
        return null
      }
      
      const user: User = {
        id: Math.random().toString(),
        name: `${email.split('@')[0]} (Demo)`,
        email,
        provider: 'google',
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      }
      
      setStoredUser(user)
      return user
    }
    
    return null
  } catch (error) {
    console.error('Sign in error:', error)
    return null
  }
}

export function signOut() {
  setStoredUser(null)
}

// Check if current user has dashboard access
export function hasDashboardAccess(user: User | null): boolean {
  if (!user) return false
  
  // Check against allowed users list
  if (user.provider === 'github' && user.username) {
    return isUserAllowed('github', user.username)
  }
  
  if (user.provider === 'google' && user.email) {
    return isUserAllowed('google', user.email)
  }
  
  return false
}

// Get user display info for access denied messages
export function getAccessDeniedInfo() {
  return {
    allowedGitHubUsers: ALLOWED_USERS.github,
    allowedGoogleEmails: ALLOWED_USERS.google,
    contactInfo: 'contact@tinova.ai',
  }
}