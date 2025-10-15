# Deployment Instructions

## Environment Setup

Your app is now configured to work independently without any hardcoded references to the Emergent backend.

### Required Environment Variable

**CRITICAL**: You must set the following environment variable in Vercel:

```
REACT_APP_BACKEND_URL=https://your-supabase-backend-url.com
```

### Steps to Deploy

1. **Supabase Backend Deployment**
   - Deploy your backend code to Supabase
   - Note the backend URL (e.g., `https://abc123.supabase.co`)

2. **Vercel Frontend Deployment** 
   - Connect your GitHub repository to Vercel
   - In Vercel dashboard, go to your project settings
   - Add environment variable:
     - Name: `REACT_APP_BACKEND_URL`
     - Value: Your Supabase backend URL
   - Redeploy your frontend

3. **Verify Configuration**
   - Check browser console for any errors
   - Ensure all API calls go to your Supabase backend
   - Test calculator functionality

### Removed Hardcoded References

✅ **Fixed Issues:**
- Removed all fallback URLs pointing to `localhost:8001`
- Removed references to Emergent backend
- Made `REACT_APP_BACKEND_URL` mandatory
- Added environment validation

### Architecture Flow

```
GitHub Repository → Supabase (Backend) + Vercel (Frontend) → Independent Web App
```

Your app now works completely independently of the Emergent platform.