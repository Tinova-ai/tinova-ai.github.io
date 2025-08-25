'use client'

import { useState, useEffect } from 'react'
import { User, getStoredUser, setStoredUser, signIn as authSignIn, signOut as authSignOut } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = getStoredUser()
    setUser(storedUser)
    setLoading(false)
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