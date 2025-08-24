'use client'

import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

// Simple auth provider for static builds
// In production, you would use a proper auth provider
export function AuthProvider({ children }: Props) {
  return <>{children}</>
}