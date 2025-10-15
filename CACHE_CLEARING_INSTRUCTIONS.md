# Cache Clearing Instructions

## The Problem
Social media platforms and browsers cache link previews and metadata for performance. Even though we've updated the HTML meta tags, cached versions may still show the old "Emergent" branding.

## Solutions

### 1. **Vercel Cache Invalidation**
After your next deployment, go to your Vercel dashboard:
- Go to your project → Deployments
- Click on the latest deployment
- Click "View Function Logs" and check if deployment was successful
- Vercel should automatically invalidate caches, but may take 5-10 minutes

### 2. **Social Media Cache Clearing**

#### Facebook/Meta Debugger
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter your website URL
3. Click "Debug" → "Scrape Again"
4. This forces Facebook to refresh the cached preview

#### Twitter Card Validator
1. Go to: https://cards-dev.twitter.com/validator
2. Enter your website URL
3. Click "Preview Card"
4. This forces Twitter to refresh the cached preview

#### LinkedIn Post Inspector
1. Go to: https://www.linkedin.com/post-inspector/
2. Enter your website URL
3. Click "Inspect"
4. This forces LinkedIn to refresh the cached preview

### 3. **Browser Cache Clearing**
For immediate testing:
- **Hard Refresh:** Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- **Incognito/Private Mode:** Test in private browsing
- **Developer Tools:** F12 → Network tab → Check "Disable cache"

### 4. **Verification Steps**
1. **View Page Source:** Right-click your site → "View Page Source"
2. **Check Title:** Should show "Fiquant TaxPro - Nigerian Tax Calculator"
3. **Check Description:** Should mention Fiquant Consult and tax services
4. **No Emergent References:** Search (Ctrl+F) for "emergent" - should find 0 results

### 5. **If Still Showing Emergent Badge**
If you still see "Made with Emergent" badge on your live site:
- Check your Vercel environment variables
- Ensure the latest build deployed successfully
- The badge might be injected by a third-party script (but we removed all such scripts)

## Current Status
✅ **HTML Updated:** All meta tags now show Fiquant TaxPro branding  
✅ **Build Verified:** Latest build contains correct branding  
✅ **Cache Headers:** Added no-cache headers for index.html  
✅ **Version Bump:** Added version meta tag to force refresh  

The changes are in place - you just need to wait for caches to clear or manually clear them using the methods above.