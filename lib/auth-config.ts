// Authentication configuration
// Add specific GitHub usernames that should have dashboard access

export const ALLOWED_USERS = {
  github: [
    'your-github-username', // Replace with actual GitHub username
    // Add more GitHub usernames as needed
  ],
  google: [
    'your-email@gmail.com', // Replace with actual Google email
    // Add more Google emails as needed
  ],
} as const

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
  return ALLOWED_USERS[provider].includes(identifier as never)
}

export function isUserInAllowedOrg(provider: 'github', username: string): boolean {
  // In production, this would check if user is member of specified organizations
  // For now, return true for demo purposes
  return true
}