'use client'

import { useState, useEffect } from 'react'
import { User, getStoredUser, setStoredUser, signIn as authSignIn, signOut as authSignOut } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleAuth = async () => {
      setLoading(true)
      
      // Check for OAuth callback first
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('code')) {
        // OAuth callback detected, process it
        try {
          const user = await authSignIn('github')
          setUser(user)
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

  return {
    user,
    loading,
    signIn,
    signOut,
  }
}