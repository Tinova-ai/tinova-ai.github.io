# Dashboard Access Configuration

## Setting Up Authorized Users

To configure which GitHub usernames and Google email addresses can access the dashboard, edit the `lib/auth-config.ts` file.

### Step 1: Update Allowed Users

Edit `/lib/auth-config.ts`:

```typescript
export const ALLOWED_USERS = {
  github: [
    'your-actual-github-username',    // Replace with real GitHub username
    'team-member-1',                  // Add team member usernames
    'team-member-2',                  // Add more as needed
  ],
  google: [
    'admin@tinova.ai',                // Replace with real email addresses
    'developer@company.com',          // Add team member emails
    'manager@company.com',           // Add more as needed
  ],
} as const
```

### Step 2: Test Access Control

1. **Visit Dashboard**: Go to `/dashboard`
2. **Try GitHub Auth**: Click "GitHub" button and enter a username
3. **Test Access Control**:
   - ✅ **Allowed username** → Access granted to dashboard
   - ❌ **Unauthorized username** → Access denied with clear message
4. **Try Google Auth**: Click "Google" button and enter an email
5. **Verify Restrictions**: Unauthorized accounts should see detailed access denied page

### Current Configuration

**Authorized GitHub Usernames:**
- `your-github-username` (placeholder - replace with real username)

**Authorized Google Emails:**
- `your-email@gmail.com` (placeholder - replace with real email)

### Production Setup (Future)

For production with real OAuth:

1. **GitHub OAuth App**:
   - Create app at: https://github.com/settings/developers
   - Set authorization callback URL: `https://tinova-ai.github.io/auth/github/callback`
   - Add client ID/secret to environment variables

2. **Google OAuth App**:
   - Create app at: https://console.developers.google.com/
   - Set authorized redirect URI: `https://tinova-ai.github.io/auth/google/callback`
   - Add client ID/secret to environment variables

3. **Environment Variables**:
   ```bash
   NEXT_PUBLIC_GITHUB_ID=your_github_client_id
   GITHUB_SECRET=your_github_client_secret
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

### Security Features

✅ **Access Control**: Only specified users can access dashboard  
✅ **Clear Messaging**: Unauthorized users see helpful error messages  
✅ **Contact Information**: Clear path for requesting access  
✅ **Account Validation**: Both GitHub usernames and Google emails are checked  
✅ **Session Management**: User sessions are managed securely  

### Troubleshooting

**Problem**: User can't access dashboard  
**Solution**: Check that their username/email is in `ALLOWED_USERS` list

**Problem**: Access denied shows wrong allowed users  
**Solution**: Update the `ALLOWED_USERS` configuration and redeploy

**Problem**: Authentication not working  
**Solution**: Check browser console for errors and verify configuration

### Contact

For questions about dashboard access or configuration:
- **Email**: contact@tinova.ai
- **GitHub Issues**: Create an issue in the repository