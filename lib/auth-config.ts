// Authentication configuration
// Admin users are now configured via GitHub Secrets for security

function parseAdminList(envVar: string | undefined): string[] {
  if (!envVar) return []
  return envVar.split(',').map(item => item.trim()).filter(item => item.length > 0)
}

export const ALLOWED_USERS = {
  github: parseAdminList(process.env.NEXT_PUBLIC_ADMIN_GITHUB_USERS),
  google: parseAdminList(process.env.NEXT_PUBLIC_ADMIN_GOOGLE_EMAILS),
}

// Fallback for development/demo - remove in production
const DEMO_FALLBACK = {
  github: ['demo-admin'], // Minimal fallback for local development
  google: ['admin@example.com'], // Demo email for testing (not used)
}

export const ORGANIZATION_MEMBERS = [
  'tinova-ai', // Organization name - members will be automatically allowed
] as const

// Production OAuth configuration
export const OAUTH_CONFIG = {
  github: {
    clientId: process.env.GITHUB_ID || '',
    scope: 'read:user user:email read:org',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    scope: 'openid profile email',
  },
} as const

export function isUserAllowed(provider: 'github' | 'google', identifier: string): boolean {
  const allowedUsers = ALLOWED_USERS[provider]
  
  console.log('Checking user access:', {
    provider,
    identifier,
    allowedUsers,
    fallbackUsers: DEMO_FALLBACK[provider],
    envVar: process.env.NEXT_PUBLIC_ADMIN_GITHUB_USERS
  })
  
  // If no admin users configured from secrets, use demo fallback
  if (allowedUsers.length === 0) {
    console.warn(`No admin users configured for ${provider}. Using demo fallback.`)
    const allowed = DEMO_FALLBACK[provider].includes(identifier)
    console.log(`Fallback check result: ${allowed}`)
    return allowed
  }
  
  const allowed = allowedUsers.includes(identifier)
  console.log(`Normal check result: ${allowed}`)
  return allowed
}

export function getConfiguredAdminCount() {
  return {
    github: ALLOWED_USERS.github.length,
    google: ALLOWED_USERS.google.length,
    usingFallback: ALLOWED_USERS.github.length === 0 && ALLOWED_USERS.google.length === 0
  }
}

export function isUserInAllowedOrg(provider: 'github', username: string): boolean {
  // In production, this would check if user is member of specified organizations
  // For now, return true for demo purposes
  return true
}