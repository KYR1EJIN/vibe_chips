# Troubleshooting Deployment Issues

## Issue: "Not Found" Error on Client URL

### Symptoms
- Client URL shows "Not Found" or 404 error
- Page doesn't load

### Possible Causes & Solutions

#### 1. VITE_SERVER_URL Not Set or Has Placeholder

**Check:**
- Go to client service → Variables
- Verify `VITE_SERVER_URL` is set to your actual server URL (not the placeholder)
- Should be: `https://your-server-name.up.railway.app`

**Fix:**
1. Get your server URL from server service → Networking tab
2. Update `VITE_SERVER_URL` in client service variables
3. **Important:** Redeploy the client service (environment variables are injected at build time)

#### 2. Client Service Not Rebuilt After Setting Variable

**Fix:**
1. Go to client service → Deployments
2. Click "Redeploy" to trigger a new build with the updated environment variable
3. Wait for build to complete

#### 3. Railway Static File Serving Configuration

**Check:**
- Go to client service → Settings
- Verify the service type is set correctly
- For static sites, Railway should auto-detect, but verify

**Fix:**
- If using Railway's static file serving, ensure the build output directory is `client/dist`
- Or configure a custom start command if needed

#### 4. Server CORS Not Configured

**Check:**
- Go to server service → Variables
- Verify `CORS_ORIGIN` includes your client URL
- Should be: `https://vibe-chipsclient-production.up.railway.app`

**Fix:**
1. Update `CORS_ORIGIN` to include client URL
2. Redeploy server service

---

## Quick Debugging Steps

1. **Check Browser Console:**
   - Open client URL
   - Press F12 → Console tab
   - Look for errors about:
     - Socket.io connection failures
     - 404 errors
     - CORS errors

2. **Check Server Health:**
   - Visit: `https://your-server-url.up.railway.app/health`
   - Should return: `{"status":"ok",...}`

3. **Check Client Build:**
   - Go to client service → Deployments
   - Check build logs for errors
   - Verify build completed successfully

4. **Verify Environment Variables:**
   - Client: `VITE_SERVER_URL` = your server URL
   - Server: `CORS_ORIGIN` = your client URL
   - Server: `NODE_ENV` = `production`

---

## Common Mistakes

1. **Using placeholder URL:** `VITE_SERVER_URL` still has `https://your-server-url.up.railway.app`
2. **Not redeploying after variable change:** Environment variables are injected at build time
3. **Wrong CORS origin:** Server's `CORS_ORIGIN` doesn't match client URL
4. **Typo in URLs:** Double-check for typos in environment variables

