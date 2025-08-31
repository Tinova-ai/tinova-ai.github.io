'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { User, getStoredUser, setStoredUser, signIn as authSignIn, signOut as authSignOut } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (provider: 'github') => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface Props {
  children: ReactNode
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleAuth = async () => {
      setLoading(true)
      
      // Check for OAuth callback first
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('code')) {
        // OAuth callback detected, process it
        console.log('Processing OAuth callback...')
        try {
          const user = await authSignIn('github')
          console.log('OAuth completed, user:', user)
          setUser(user)
          
          // Clean up URL by removing OAuth parameters
          const url = new URL(window.location.href)
          url.searchParams.delete('code')
          url.searchParams.delete('state')
          window.history.replaceState({}, document.title, url.toString())
        } catch (error) {
          console.error('OAuth callback error:', error)
        }
      } else {
        // No OAuth callback, just load stored user
        const storedUser = getStoredUser()
        setUser(storedUser)
      }
      
      setLoading(false)
    }
    
    handleAuth()
    
    // Also listen for storage changes (in case auth happens in another tab)
    const handleStorageChange = () => {
      const storedUser = getStoredUser()
      setUser(storedUser)
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const signIn = async (provider: 'github') => {
    setLoading(true)
    try {
      const user = await authSignIn(provider)
      setUser(user)
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    authSignOut()
    setUser(null)
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}