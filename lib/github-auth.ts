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

// GitHub App OAuth for real authentication
export async function signInWithGitHub(): Promise<GitHubUser | null> {
  try {
    if (typeof window === 'undefined') return null
    
    // Check if we're returning from GitHub OAuth
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    
    if (code && state) {
      // We're returning from GitHub OAuth callback
      return await handleGitHubCallback(code, state)
    } else {
      // Start GitHub App OAuth flow
      initiateGitHubAppOAuth()
      return null // This will redirect, so we won't reach here
    }
    
  } catch (error) {
    console.error('GitHub auth error:', error)
    return null
  }
}

// Exchange OAuth code for user data via Cloudflare Worker
async function exchangeCodeForUserData(code: string, state: string): Promise<GitHubUser | null> {
  try {
    // Show loading state
    const loadingModal = showLoadingModal()
    
    // Call Cloudflare Worker to securely exchange code for token
    const workerUrl = 'https://auth.tinova-ai.cc/api/github-oauth'
    
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code,
        state: state
      })
    })
    
    loadingModal.remove()
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OAuth exchange failed:', response.status, errorData)
      alert(`Authentication failed: ${errorData.error || 'Unknown error'}`)
      return null
    }
    
    const userData = await response.json()
    
    if (userData.error) {
      alert(`Authentication failed: ${userData.error}`)
      return null
    }
    
    return {
      id: userData.id,
      login: userData.login,
      name: userData.name,
      email: userData.email,
      avatar_url: userData.avatar_url,
      organizations: []
    }
    
  } catch (error) {
    console.error('Error exchanging code for user data:', error)
    alert('Authentication service unavailable. Please try again later.')
    return null
  }
}

// GitHub App OAuth initiation
function initiateGitHubAppOAuth(): void {
  if (typeof window === 'undefined') return
  
  const clientId = 'Iv23lixRc9fo4TFMcA5y' // Your GitHub App Client ID
  const redirectUri = 'https://tinova-ai.github.io/dashboard'
  const scope = 'read:user user:email'
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

// Handle GitHub OAuth callback
async function handleGitHubCallback(code: string, state: string): Promise<GitHubUser | null> {
  try {
    // Verify state to prevent CSRF attacks
    const storedState = sessionStorage.getItem('github_oauth_state')
    if (state !== storedState) {
      console.error('OAuth state mismatch')
      alert('Authentication failed: Invalid state. Please try again.')
      return null
    }
    
    // Clean up URL parameters and state
    sessionStorage.removeItem('github_oauth_state')
    window.history.replaceState({}, document.title, window.location.pathname)
    
    // Exchange code for user data via Cloudflare Worker
    const githubUser = await exchangeCodeForUserData(code, state)
    if (!githubUser) {
      return null // Error already shown in exchangeCodeForUserData
    }
    
    // Debug: Log the returned user info
    console.log('GitHub user returned:', githubUser)
    console.log('Username being checked:', githubUser.login)
    
    // Check if user is authorized
    if (!isUserAllowed('github', githubUser.login)) {
      console.log('Access denied for user:', githubUser.login)
      console.log('Allowed users:', ALLOWED_USERS.github)
      alert(`Access denied. User "${githubUser.login}" is not in the allowed list.\n\nAllowed users: ${ALLOWED_USERS.github.join(', ')}\n\nPlease contact an administrator to request access.`)
      return null
    }
    
    return githubUser
    
  } catch (error) {
    console.error('Error handling GitHub callback:', error)
    return null
  }
}

// Helper functions for GitHub Pages OAuth flow

function showLoadingModal(): HTMLElement {
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
    max-width: 300px;
    width: 90%;
    text-align: center;
  `
  
  content.innerHTML = `
    <div class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
    <p>Processing authentication...</p>
  `
  
  modal.appendChild(content)
  document.body.appendChild(modal)
  return modal
}

function promptForUsernameConfirmation(): Promise<string | null> {
  return new Promise((resolve) => {
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
      <h3 style="margin: 0 0 1rem; font-size: 1.25rem; font-weight: 600; color: #1f2937;">Confirm Your Identity</h3>
      <p style="margin: 0 0 1.5rem; color: #6b7280; font-size: 0.875rem;">
        GitHub authentication successful! Please confirm your username to complete the process.
      </p>
      <input type="text" id="username-confirm" placeholder="Enter your GitHub username" 
             style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; margin-bottom: 1rem; font-size: 1rem;">
      <div style="display: flex; gap: 0.75rem; justify-content: center;">
        <button id="confirm-cancel" style="padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer;">
          Cancel
        </button>
        <button id="confirm-continue" style="padding: 0.75rem 1.5rem; background: #1f2937; color: white; border: none; border-radius: 6px; cursor: pointer;">
          Confirm
        </button>
      </div>
    `
    
    modal.appendChild(content)
    document.body.appendChild(modal)
    
    const usernameInput = modal.querySelector('#username-confirm') as HTMLInputElement
    const continueBtn = modal.querySelector('#confirm-continue') as HTMLButtonElement
    const cancelBtn = modal.querySelector('#confirm-cancel') as HTMLButtonElement
    
    usernameInput.focus()
    
    const cleanup = () => {
      document.body.removeChild(modal)
    }
    
    const handleConfirm = () => {
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
    
    continueBtn.addEventListener('click', handleConfirm)
    cancelBtn.addEventListener('click', handleCancel)
    
    usernameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleConfirm()
      }
    })
  })
}

async function fetchGitHubUserProfile(username: string): Promise<GitHubUser | null> {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`)
    
    if (!response.ok) {
      return null
    }
    
    const userData = await response.json()
    
    return {
      id: userData.id,
      login: userData.login,
      name: userData.name,
      email: userData.email,
      avatar_url: userData.avatar_url,
      organizations: [],
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