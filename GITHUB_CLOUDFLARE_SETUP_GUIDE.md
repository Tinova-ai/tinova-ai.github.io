# Complete Setup Guide: GitHub OAuth App & Cloudflare Worker Configuration

This comprehensive guide provides step-by-step instructions for configuring GitHub OAuth App redirect URIs and Cloudflare Worker CORS headers for the Tinova AI authentication system.

## Table of Contents

1. [GitHub OAuth App Configuration](#github-oauth-app-configuration)
2. [Cloudflare Worker CORS Configuration](#cloudflare-worker-cors-configuration)
3. [Verification and Testing](#verification-and-testing)
4. [Troubleshooting Common Issues](#troubleshooting-common-issues)

---

## GitHub OAuth App Configuration

### Step 1: Access Your GitHub OAuth App Settings

1. **Log in to GitHub** with the account that owns the OAuth App
   - Navigate to: https://github.com
   - Sign in with your credentials

2. **Navigate to OAuth Apps**
   - Click your profile picture (top-right corner)
   - Select **Settings** from the dropdown menu
   - Scroll down the left sidebar to find **Developer settings** (near the bottom)
   - Click **Developer settings**
   - In the left sidebar, click **OAuth Apps**

3. **Locate Your App**
   - Find the app named "Tinova AI Dashboard" or similar
   - Your Client ID should be: `Iv23lixRc9fo4TFMcA5y`
   - Click on the app name to open its settings

### Step 2: Update Authorization Callback URL

1. **Find the Authorization callback URL field**
   - Scroll down to the **Authorization callback URL** section
   - This is the most critical setting for OAuth to work properly

2. **Update the Redirect URI**
   
   **Current Production Setup:**
   ```
   https://tinova-ai.cc/dashboard
   ```

   **For Local Development (if needed):**
   ```
   http://localhost:3000/dashboard
   ```

   **For Multiple Environments:**
   If your GitHub OAuth App supports multiple redirect URIs (GitHub Apps do, OAuth Apps only support one), you can add:
   ```
   https://tinova-ai.cc/dashboard
   https://www.tinova-ai.cc/dashboard
   http://localhost:3000/dashboard
   ```

3. **Important Considerations:**
   - **Protocol matters**: `https://` vs `http://` - they must match exactly
   - **Domain must match**: `tinova-ai.cc` vs `www.tinova-ai.cc` are different
   - **Path must match**: `/dashboard` must be exact
   - **No trailing slashes**: Don't add `/` at the end unless your code expects it

4. **Save Changes**
   - Scroll to the bottom of the page
   - Click the green **Update application** button
   - You should see a success message

### Step 3: Verify Other OAuth App Settings

While you're in the OAuth App settings, verify these configurations:

1. **Application name**: Should be user-friendly (e.g., "Tinova AI Dashboard")
2. **Homepage URL**: `https://tinova-ai.cc`
3. **Application description**: Optional but helpful for users
4. **Application logo**: Optional, but improves user trust

### Step 4: Note Your Credentials

Ensure you have these values saved securely:

- **Client ID**: `Iv23lixRc9fo4TFMcA5y` (public, used in frontend)
- **Client Secret**: Keep this SECRET (used only in backend/Cloudflare Worker)

---

## Cloudflare Worker CORS Configuration

### Step 1: Access Cloudflare Dashboard

1. **Log in to Cloudflare**
   - Navigate to: https://dash.cloudflare.com
   - Sign in with your Cloudflare account

2. **Select Your Domain**
   - Click on the `tinova-ai.cc` domain from your account dashboard

### Step 2: Navigate to Workers

1. **Access Workers Section**
   - In the left sidebar, find and click **Workers Routes** or **Workers & Pages**
   - If using the new interface: Click **Workers & Pages** in the main navigation

2. **Find Your Worker**
   - Look for a worker handling `auth.tinova-ai.cc`
   - The worker might be named something like:
     - `github-oauth-worker`
     - `auth-worker`
     - `tinova-auth`

### Step 3: Edit Worker Code

1. **Open Worker Editor**
   - Click on the worker name
   - Click **Quick edit** or **Edit code** button

2. **Locate CORS Headers Configuration**
   
   Look for code sections like this:

   ```javascript
   // CORS headers configuration
   const corsHeaders = {
     'Access-Control-Allow-Origin': '*', // This needs to be updated
     'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
     'Access-Control-Allow-Headers': 'Content-Type',
   }
   ```

3. **Update CORS Headers for Production**

   **Option 1: Specific Origin (Recommended for Production)**
   ```javascript
   const corsHeaders = {
     'Access-Control-Allow-Origin': 'https://tinova-ai.cc',
     'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
     'Access-Control-Allow-Headers': 'Content-Type, Authorization',
     'Access-Control-Allow-Credentials': 'true',
     'Access-Control-Max-Age': '86400',
   }
   ```

   **Option 2: Multiple Origins (More Flexible)**
   ```javascript
   // Define allowed origins
   const allowedOrigins = [
     'https://tinova-ai.cc',
     'https://www.tinova-ai.cc',
     'http://localhost:3000', // for development
   ]

   // Function to get CORS headers based on request origin
   function getCorsHeaders(request) {
     const origin = request.headers.get('Origin')
     
     // Check if origin is allowed
     if (allowedOrigins.includes(origin)) {
       return {
         'Access-Control-Allow-Origin': origin,
         'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
         'Access-Control-Allow-Headers': 'Content-Type, Authorization',
         'Access-Control-Allow-Credentials': 'true',
         'Access-Control-Max-Age': '86400',
       }
     }
     
     // Default to no CORS if origin not allowed
     return {}
   }
   ```

4. **Handle OPTIONS Preflight Requests**

   Ensure your worker handles OPTIONS requests properly:

   ```javascript
   export default {
     async fetch(request, env, ctx) {
       // Handle CORS preflight requests
       if (request.method === 'OPTIONS') {
         return new Response(null, {
           status: 204,
           headers: getCorsHeaders(request)
         })
       }

       // Your existing worker logic here
       // ...

       // Add CORS headers to all responses
       const response = await handleRequest(request, env)
       const corsHeaders = getCorsHeaders(request)
       
       // Clone the response and add CORS headers
       const newResponse = new Response(response.body, response)
       Object.keys(corsHeaders).forEach(key => {
         newResponse.headers.set(key, corsHeaders[key])
       })
       
       return newResponse
     }
   }
   ```

### Step 4: Configure Environment Variables

1. **Navigate to Worker Settings**
   - In the Worker dashboard, click **Settings** tab
   - Click **Variables** or **Environment Variables**

2. **Add/Verify These Variables:**
   ```
   GITHUB_CLIENT_ID = Iv23lixRc9fo4TFMcA5y
   GITHUB_CLIENT_SECRET = [your-secret-here]
   ALLOWED_ORIGIN = https://tinova-ai.cc
   ```

3. **Save Environment Variables**
   - Click **Save** or **Deploy** after adding variables

### Step 5: Deploy Worker Changes

1. **Save and Deploy**
   - In the code editor, click **Save and Deploy**
   - Wait for deployment confirmation

2. **Verify Deployment**
   - Check the deployment status
   - Note the worker URL (should be `https://auth.tinova-ai.cc`)

---

## Verification and Testing

### Step 1: Test CORS Headers

1. **Using curl Command:**
   ```bash
   # Test OPTIONS preflight
   curl -X OPTIONS https://auth.tinova-ai.cc/api/github-oauth \
     -H "Origin: https://tinova-ai.cc" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -v
   ```

   **Expected Response Headers:**
   ```
   Access-Control-Allow-Origin: https://tinova-ai.cc
   Access-Control-Allow-Methods: GET, POST, OPTIONS
   Access-Control-Allow-Headers: Content-Type, Authorization
   ```

2. **Using Browser DevTools:**
   - Open Chrome/Firefox DevTools (F12)
   - Go to Network tab
   - Navigate to https://tinova-ai.cc/dashboard
   - Try to login with GitHub
   - Check the preflight OPTIONS request to `auth.tinova-ai.cc`
   - Verify CORS headers in the response

### Step 2: Test GitHub OAuth Flow

1. **Clear Browser Data**
   - Clear cookies and session storage for `tinova-ai.cc`
   - Open an incognito/private window

2. **Test Authentication Flow**
   - Navigate to: https://tinova-ai.cc/dashboard
   - Click "Sign in with GitHub"
   - You should be redirected to GitHub
   - After authorizing, you should return to `https://tinova-ai.cc/dashboard`
   - Check browser console for any errors

3. **Verify Redirect URI**
   - During GitHub authorization, check the URL
   - It should include: `redirect_uri=https%3A%2F%2Ftinova-ai.cc%2Fdashboard`

### Step 3: Common Validation Checks

**Check List:**
- [ ] GitHub OAuth App redirect URI matches exactly: `https://tinova-ai.cc/dashboard`
- [ ] Cloudflare Worker responds to OPTIONS requests with proper CORS headers
- [ ] Worker allows origin `https://tinova-ai.cc`
- [ ] POST requests to `/api/github-oauth` include CORS headers
- [ ] Browser console shows no CORS errors
- [ ] OAuth flow completes without redirect_uri mismatch errors

---

## Troubleshooting Common Issues

### Issue 1: Redirect URI Mismatch

**Error Message:**
```
The redirect_uri MUST match the registered callback URL for this application.
```

**Solution:**
1. Check exact URL in GitHub OAuth App settings
2. Ensure no trailing slashes
3. Verify protocol (http vs https)
4. Check for www subdomain differences

### Issue 2: CORS Blocked

**Error Message:**
```
Access to fetch at 'https://auth.tinova-ai.cc/api/github-oauth' from origin 
'https://tinova-ai.cc' has been blocked by CORS policy
```

**Solution:**
1. Verify Cloudflare Worker CORS headers
2. Ensure OPTIONS requests are handled
3. Check that origin is in allowed list
4. Verify worker is deployed and active

### Issue 3: Network Errors

**Error Message:**
```
Failed to fetch
net::ERR_NAME_NOT_RESOLVED
```

**Solution:**
1. Verify DNS settings in Cloudflare
2. Check that `auth.tinova-ai.cc` points to your Worker
3. Ensure Worker route is configured correctly
4. Test with: `dig auth.tinova-ai.cc`

### Issue 4: Authentication Fails Silently

**Symptoms:**
- No error messages
- Returns to dashboard without login
- Session not created

**Debug Steps:**
1. Open browser DevTools Console
2. Check Network tab for failed requests
3. Look for JavaScript errors
4. Verify Worker logs in Cloudflare dashboard
5. Check browser's session storage for oauth_state

### Issue 5: Invalid Client Error

**Error Message:**
```
Invalid client_id or client_secret
```

**Solution:**
1. Verify Client ID in frontend code matches GitHub App
2. Check Client Secret in Cloudflare Worker environment variables
3. Ensure no extra spaces or characters in credentials
4. Regenerate Client Secret if necessary (last resort)

---

## Security Best Practices

### For GitHub OAuth App:
1. **Never expose Client Secret** in frontend code
2. **Use state parameter** to prevent CSRF attacks
3. **Validate redirect URIs** to prevent open redirects
4. **Limit OAuth scopes** to minimum required

### For Cloudflare Worker:
1. **Validate Origin header** against allowlist
2. **Use environment variables** for secrets
3. **Implement rate limiting** to prevent abuse
4. **Log authentication attempts** for security monitoring
5. **Use HTTPS only** for all communications

---

## Quick Reference

### GitHub OAuth App Settings URL:
```
https://github.com/settings/developers
```

### Cloudflare Dashboard URL:
```
https://dash.cloudflare.com
```

### Test URLs:
- Production: https://tinova-ai.cc/dashboard
- Auth Worker: https://auth.tinova-ai.cc/api/github-oauth
- Health Check: https://auth.tinova-ai.cc/health

### Required Environment Variables:
```bash
# Frontend (.env.local)
NEXT_PUBLIC_GITHUB_CLIENT_ID=Iv23lixRc9fo4TFMcA5y
NEXT_PUBLIC_AUTH_WORKER_URL=https://auth.tinova-ai.cc

# Cloudflare Worker
GITHUB_CLIENT_ID=Iv23lixRc9fo4TFMcA5y
GITHUB_CLIENT_SECRET=your-secret-here
ALLOWED_ORIGINS=https://tinova-ai.cc,https://www.tinova-ai.cc
```

---

## Support and Additional Resources

### Documentation Links:
- [GitHub OAuth Apps Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

### Getting Help:
1. Check browser console for detailed error messages
2. Review Cloudflare Worker logs for backend errors
3. Verify all URLs and credentials match exactly
4. Test with curl commands for isolated debugging

---

*Last Updated: 2024*
*Document Version: 1.0.0*