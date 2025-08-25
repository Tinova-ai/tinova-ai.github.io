'use client'

import { getConfiguredAdminCount, ALLOWED_USERS } from '@/lib/auth-config'
import { useEffect, useState } from 'react'

export default function AdminConfig() {
  const [config, setConfig] = useState<{
    github: number
    google: number
    usingFallback: boolean
  } | null>(null)

  useEffect(() => {
    setConfig(getConfiguredAdminCount())
  }, [])

  if (!config) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">Admin Configuration Status</h3>
          <div className="mt-2 text-sm text-blue-700">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>GitHub Users:</strong> {config.github > 0 ? `${config.github} configured` : 'None configured (using demo)'}
              </li>
              <li>
                <strong>Google Emails:</strong> {config.google > 0 ? `${config.google} configured` : 'None configured (using demo)'}
              </li>
              {config.usingFallback && (
                <li className="text-yellow-700">
                  <strong>⚠️ Using demo fallback - Configure GitHub Secrets for production</strong>
                </li>
              )}
            </ul>
            
            {!config.usingFallback && (
              <div className="mt-3 text-xs">
                <p>✅ Admin users configured via GitHub Secrets</p>
                <p>Configured users: {ALLOWED_USERS.github.join(', ')} | {ALLOWED_USERS.google.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}