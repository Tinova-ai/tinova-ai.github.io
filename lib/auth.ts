'use client'

// Simple client-side authentication for static builds
// In production, you would integrate with your authentication provider

export interface User {
  id: string
  name: string
  email: string
  image?: string
  provider: 'github' | 'google'
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

export function signIn(provider: 'github' | 'google'): Promise<User> {
  // In a real implementation, this would redirect to OAuth provider
  // For demo purposes, we'll simulate authentication
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockUser: User = {
        id: '1',
        name: `Demo User (${provider})`,
        email: `demo@${provider}.com`,
        provider,
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`
      }
      
      setStoredUser(mockUser)
      resolve(mockUser)
    }, 1000)
  })
}

export function signOut() {
  setStoredUser(null)
}