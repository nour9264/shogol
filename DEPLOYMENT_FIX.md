# Deployment Fix - Backend Connection Issue

## Problem
The deployed app was failing to connect to the backend API because:
1. Next.js rewrites in `next.config.ts` don't work on static deployments
2. The app was trying to connect directly to the backend, causing CORS issues
3. Vercel rewrites weren't properly configured

## Solution Applied

### 1. Fixed `vercel.json` ✅
Updated the rewrites syntax to use proper Vercel format:
```json
{
  "rewrites": [
    {
      "source": "/api-proxy/(.*)",
      "destination": "https://globallink.runasp.net/api/$1"
    },
    {
      "source": "/notificationHub/(.*)",
      "destination": "https://globallink.runasp.net/notificationHub/$1"
    },
    {
      "source": "/chatHub/(.*)",
      "destination": "https://globallink.runasp.net/chatHub/$1"
    }
  ]
}
```

### 2. Fixed `src/services/api.ts` ✅
Changed from conditional URLs to always use proxy paths:
```typescript
// Always use proxy paths - vercel.json rewrites will handle backend routing
export const API_BASE_URL = '/api-proxy';
export const HUB_URL = '/chatHub';
export const NOTIFICATION_HUB_URL = '/notificationHub';
```

## How It Works

1. **Frontend makes request**: `POST /api-proxy/Auth/login`
2. **Vercel intercepts**: Matches the `/api-proxy/(.*)` pattern
3. **Vercel rewrites**: Forwards to `https://globallink.runasp.net/api/Auth/login`
4. **Backend responds**: Response is sent back through Vercel to frontend
5. **No CORS issues**: Browser thinks it's same-origin request

## Deployment Steps

### Option A: Git Push (Recommended)
```bash
git add .
git commit -m "fix: Configure Vercel rewrites for backend API connection"
git push
```
Vercel will automatically redeploy.

### Option B: Manual Redeploy
1. Go to your Vercel dashboard
2. Click "Redeploy" on your project
3. Wait for deployment to complete

## Testing After Deployment

1. Open your deployed app
2. Open browser DevTools (F12)
3. Go to Network tab
4. Try to login
5. Check the request:
   - Should go to: `https://your-app.vercel.app/api-proxy/Auth/login`
   - Should return: 200 OK (or appropriate response)
   - Should NOT show CORS errors

## Verification Checklist

- [ ] `vercel.json` exists in project root
- [ ] `src/services/api.ts` uses `/api-proxy` paths
- [ ] Code is committed and pushed to Git
- [ ] Vercel deployment completed successfully
- [ ] Login works on deployed app
- [ ] No CORS errors in browser console
- [ ] API requests show in Network tab

## Troubleshooting

### If still not working:

1. **Check Vercel logs**:
   - Go to Vercel dashboard → Your project → Deployments
   - Click on latest deployment → Function Logs
   - Look for errors

2. **Verify rewrites are active**:
   - In browser, try: `https://your-app.vercel.app/api-proxy/test`
   - Should forward to backend (might get 404 but shouldn't get CORS error)

3. **Clear browser cache**:
   - Hard refresh: Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac)
   - Or clear cache in DevTools

4. **Check backend is running**:
   - Visit: `https://globallink.runasp.net/api`
   - Should respond (even if with error, proves it's accessible)

## Files Changed
- ✅ `vercel.json` - Added/updated Vercel rewrites
- ✅ `src/services/api.ts` - Simplified to always use proxy paths
- ✅ `netlify.toml` - Created (if deploying to Netlify instead)

## Notes
- The `next.config.ts` rewrites are still there for local development
- Vercel rewrites take precedence in production
- No backend changes needed (no CORS configuration required)
- Works with SignalR hubs as well (chatHub, notificationHub)
