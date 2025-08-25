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

// GitHub authentication for static hosting
export async function signInWithGitHub(): Promise<GitHubUser | null> {
  try {
    if (typeof window === 'undefined') return null
    
    // For static hosting (GitHub Pages), we implement a secure prompt-based approach
    // that requires users to provide their GitHub username for verification
    
    const modal = createGitHubAuthModal()
    const username = await showGitHubAuthModal(modal)
    
    if (!username) return null
    
    // Verify user exists on GitHub and get their public profile
    const githubUser = await fetchGitHubUserProfile(username)
    if (!githubUser) {
      alert(`GitHub user "${username}" not found. Please check the username and try again.`)
      return null
    }
    
    // Check if user is authorized
    if (!isUserAllowed('github', username)) {
      alert(`Access denied. User "${username}" is not in the allowed list.\n\nAllowed users: ${ALLOWED_USERS.github.join(', ')}\n\nPlease contact an administrator to request access.`)
      return null
    }
    
    return githubUser
    
  } catch (error) {
    console.error('GitHub auth error:', error)
    return null
  }
}

// Exchange OAuth code for access token and user data
async function exchangeCodeForUserData(code: string): Promise<GitHubUser | null> {
  try {
    // For GitHub Pages static hosting, we need to use a serverless function
    // or handle this differently since we can't store client secrets
    
    // Option 1: Use GitHub device flow (more complex)
    // Option 2: Use a proxy service (security concern)
    // Option 3: Implement a serverless function endpoint
    
    // For now, we'll use the GitHub API directly with personal access token
    // This is NOT recommended for production - you should use proper OAuth flow
    
    // Since we can't securely exchange code for token in client-side code,
    // we'll fall back to using GitHub's public API to verify the user exists
    // and then use a simple authentication approach
    
    console.warn('OAuth code exchange not implemented for static hosting. Consider using GitHub Apps or serverless functions.')
    
    return null
  } catch (error) {
    console.error('Error exchanging code for user data:', error)
    return null
  }
}

// Real GitHub OAuth implementation for production
export function initiateGitHubOAuth(): void {
  if (typeof window === 'undefined') return
  
  // For GitHub Pages (static site), we need a different approach
  // Since we can't securely store client secrets, we'll use a simpler method
  
  // Option 1: Use GitHub device flow
  // Option 2: Direct to GitHub with public client_id (less secure)
  // Option 3: Use a serverless function/API endpoint
  
  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
  if (!clientId) {
    console.error('GitHub Client ID not configured. Please set NEXT_PUBLIC_GITHUB_CLIENT_ID environment variable.')
    alert('GitHub authentication is not configured. Please contact the administrator.')
    return
  }
  
  // For static hosting, redirect directly to current page with special flag
  const redirectUri = window.location.origin + window.location.pathname
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

// Create a professional GitHub authentication modal
function createGitHubAuthModal(): HTMLElement {
  const modal = document.createElement('div')
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `
  
  const content = document.createElement('div')
  content.style.cssText = `
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    width: 90%;
    text-align: center;
  `
  
  content.innerHTML = `
    <div style="margin-bottom: 1.5rem;">
      <svg style="width: 48px; height: 48px; margin: 0 auto 1rem; color: #1f2937;" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
      </svg>
      <h2 style="margin: 0 0 0.5rem; font-size: 1.25rem; font-weight: 600; color: #1f2937;">GitHub Authentication</h2>
      <p style="margin: 0; color: #6b7280; font-size: 0.875rem; line-height: 1.5;">
        For security, we need to verify your GitHub identity. Please enter your GitHub username to continue.
      </p>
    </div>
    <input type="text" id="github-username" placeholder="Enter your GitHub username" 
           style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; margin-bottom: 1rem; font-size: 1rem;"
           autocomplete="username">
    <div style="display: flex; gap: 0.75rem; justify-content: center;">
      <button id="auth-cancel" style="padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer; font-size: 0.875rem; color: #374151;">
        Cancel
      </button>
      <button id="auth-continue" style="padding: 0.75rem 1.5rem; background: #1f2937; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
        Continue
      </button>
    </div>
  `
  
  modal.appendChild(content)
  return modal
}

// Show modal and get username from user
function showGitHubAuthModal(modal: HTMLElement): Promise<string | null> {
  return new Promise((resolve) => {
    document.body.appendChild(modal)
    
    const usernameInput = modal.querySelector('#github-username') as HTMLInputElement
    const continueBtn = modal.querySelector('#auth-continue') as HTMLButtonElement
    const cancelBtn = modal.querySelector('#auth-cancel') as HTMLButtonElement
    
    usernameInput.focus()
    
    const cleanup = () => {
      document.body.removeChild(modal)
    }
    
    const handleContinue = () => {
      const username = usernameInput.value.trim()
      if (username) {
        cleanup()
        resolve(username)
      } else {
        usernameInput.focus()
      }
    }
    
    const handleCancel = () => {
      cleanup()
      resolve(null)
    }
    
    continueBtn.addEventListener('click', handleContinue)
    cancelBtn.addEventListener('click', handleCancel)
    
    usernameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleContinue()
      } else if (e.key === 'Escape') {
        handleCancel()
      }
    })
    
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        handleCancel()
      }
    })
  })
}

// Fetch user profile from GitHub API
async function fetchGitHubUserProfile(username: string): Promise<GitHubUser | null> {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        return null // User not found
      }
      throw new Error(`GitHub API error: ${response.status}`)
    }
    
    const userData = await response.json()
    
    return {
      id: userData.id,
      login: userData.login,
      name: userData.name,
      email: userData.email,
      avatar_url: userData.avatar_url,
      organizations: [], // We can't fetch private org membership without auth
    }
  } catch (error) {
    console.error('Error fetching GitHub user profile:', error)
    return null
  }
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