# Deployment Guide - ChipTable

This guide will walk you through deploying ChipTable to **Railway**, a modern platform that supports WebSockets and makes deployment simple.

## Why Railway?

Railway is recommended because:
- ✅ Native WebSocket support (critical for Socket.io)
- ✅ Simple monorepo deployment
- ✅ Automatic HTTPS
- ✅ Free tier available
- ✅ Easy environment variable management
- ✅ Automatic deployments from Git

---

## Prerequisites

Before deploying, ensure you have:
1. A GitHub account
2. Your code pushed to a GitHub repository
3. A Railway account (sign up at [railway.app](https://railway.app) - it's free)

---

## Step-by-Step Deployment Guide

### Step 1: Prepare Your Repository

1. **Ensure all changes are committed:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Verify your build works locally:**
   ```bash
   npm run build
   ```
   This should build all packages (shared, server, client) without errors.

### Step 2: Create a Railway Account

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Sign up with GitHub (recommended for easy Git integration)

### Step 3: Create a New Project on Railway

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub repositories
4. Select your `vibe_chips` repository
5. Railway will automatically detect it's a Node.js project

### Step 4: Configure Environment Variables

1. In your Railway project, go to the **"Variables"** tab
2. Add the following environment variables:

   ```
   NODE_ENV=production
   PORT=3000
   CORS_ORIGIN=https://your-app-name.railway.app
   ```

   **Important Notes:**
   - `PORT` will be automatically set by Railway, but you can set it explicitly
   - `CORS_ORIGIN` should match your Railway app URL (you'll get this after first deploy)
   - For the client, Railway will automatically inject `VITE_SERVER_URL` during build, but you may need to set it manually if deploying separately

3. **After first deployment**, update `CORS_ORIGIN` with your actual Railway URL:
   - Your URL will be something like: `https://vibe-chips-production.up.railway.app`
   - Update `CORS_ORIGIN` to match this URL

### Step 5: Configure Build Settings

Railway should auto-detect your setup, but verify these settings:

1. Go to **"Settings"** → **"Service"**
2. **Root Directory**: Leave empty (root of repo)
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm run start --workspace=server`

   Or Railway will use the `Procfile` we created, which contains:
   ```
   web: npm run start --workspace=server
   ```

### Step 6: Deploy

1. Railway will automatically start building and deploying
2. Watch the build logs in the Railway dashboard
3. Wait for deployment to complete (usually 2-5 minutes)

### Step 7: Get Your App URL

1. Once deployed, Railway will provide a URL like:
   ```
   https://vibe-chips-production.up.railway.app
   ```
2. **Copy this URL** - you'll need it for the next step

### Step 8: Update CORS Configuration

1. Go back to **"Variables"** in Railway
2. Update `CORS_ORIGIN` to your actual Railway URL:
   ```
   CORS_ORIGIN=https://vibe-chips-production.up.railway.app
   ```
3. Railway will automatically redeploy with the new environment variable

### Step 9: Test Your Deployment

1. Open your Railway URL in a browser
2. You should see the ChipTable landing page
3. Try creating a room - it should work!
4. Check the connection indicator (top-right) - it should show "Connected"

### Step 10: (Optional) Set Up Custom Domain

1. In Railway, go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"** or **"Add Custom Domain"**
3. Follow Railway's instructions to configure your domain
4. Update `CORS_ORIGIN` to include your custom domain:
   ```
   CORS_ORIGIN=https://your-custom-domain.com,https://your-app.railway.app
   ```

---

## Troubleshooting

### Issue: Build Fails

**Symptoms**: Build fails with errors about missing dependencies or TypeScript errors

**Solutions**:
1. Ensure all dependencies are in `package.json` files
2. Run `npm run build` locally to catch errors first
3. Check Railway build logs for specific error messages
4. Ensure `shared` package builds before `server` and `client`

### Issue: App Deploys But Shows "Cannot Connect"

**Symptoms**: App loads but connection indicator shows "Disconnected"

**Solutions**:
1. Check that `CORS_ORIGIN` matches your Railway URL exactly
2. Verify `VITE_SERVER_URL` is set correctly (should be your Railway URL)
3. Check Railway logs for CORS errors
4. Ensure WebSocket connections are allowed (Railway supports this by default)

### Issue: Static Files Not Loading

**Symptoms**: Blank page or 404 errors for assets

**Solutions**:
1. Verify client build completed successfully (`client/dist` exists)
2. Check that `NODE_ENV=production` is set
3. Verify server is serving static files from `client/dist`

### Issue: Socket.io Connection Fails

**Symptoms**: WebSocket connection errors in browser console

**Solutions**:
1. Ensure `CORS_ORIGIN` includes your client URL
2. Check Railway logs for Socket.io errors
3. Verify `PORT` environment variable is set (Railway sets this automatically)
4. Ensure your Railway plan supports WebSockets (all plans do)

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (auto-set by Railway) | `3000` |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `https://your-app.railway.app` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_SERVER_URL` | Server URL for client (set during build) | `http://localhost:3000` |

---

## Deployment Architecture

### Single Service Deployment (Current Setup)

```
┌─────────────────────────────────┐
│      Railway Service             │
│  ┌───────────────────────────┐   │
│  │   Express Server         │   │
│  │   - API Routes           │   │
│  │   - Socket.io Server     │   │
│  │   - Static File Serving  │   │
│  └───────────────────────────┘   │
│  ┌───────────────────────────┐   │
│  │   Client (React)          │   │
│  │   - Built to dist/        │   │
│  │   - Served by Express     │   │
│  └───────────────────────────┘   │
└─────────────────────────────────┘
```

**Pros:**
- Simple deployment
- Single service to manage
- Lower cost

**Cons:**
- Client and server must deploy together
- Less flexible scaling

### Alternative: Separate Client/Server Deployment

If you want to deploy client and server separately:

1. **Client on Vercel/Netlify:**
   - Deploy `client/` directory
   - Set `VITE_SERVER_URL` to your Railway server URL
   - Configure CORS on server to allow Vercel domain

2. **Server on Railway:**
   - Deploy only `server/` directory
   - Update `CORS_ORIGIN` to include Vercel domain
   - Remove static file serving from server

---

## Monitoring & Logs

### Viewing Logs

1. In Railway dashboard, click on your service
2. Go to **"Deployments"** tab
3. Click on a deployment to see logs
4. Use **"View Logs"** for real-time logs

### Health Check

Your app has a health check endpoint:
```
GET /health
```

Railway can use this for health monitoring (configure in Settings → Healthcheck).

---

## Updating Your Deployment

### Automatic Deployments

Railway automatically deploys when you push to your connected branch (usually `main`).

### Manual Deployment

1. Push changes to GitHub
2. Railway will detect and start a new deployment
3. Monitor the deployment in Railway dashboard

### Rolling Back

1. Go to **"Deployments"** in Railway
2. Find a previous successful deployment
3. Click **"Redeploy"**

---

## Cost Considerations

### Railway Free Tier

- **$5 credit per month** (enough for small projects)
- **500 hours** of usage
- **100GB** bandwidth
- Perfect for development and small deployments

### Paid Plans

- Start at **$5/month** for additional resources
- Pay-as-you-go pricing
- Scales automatically

---

## Next Steps After Deployment

1. **Test thoroughly** with multiple users
2. **Monitor logs** for any errors
3. **Set up custom domain** (optional)
4. **Configure health checks** in Railway
5. **Set up monitoring** (optional, Railway has built-in monitoring)

---

## Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Project Issues**: Check your project's GitHub issues

---

## Summary Checklist

Before deploying, ensure:
- [ ] Code is pushed to GitHub
- [ ] `npm run build` works locally
- [ ] Environment variables are configured
- [ ] Railway account is created
- [ ] Repository is connected to Railway
- [ ] Build and start commands are correct
- [ ] CORS_ORIGIN is set to your Railway URL
- [ ] Health check endpoint works (`/health`)

After deployment:
- [ ] App loads in browser
- [ ] Connection indicator shows "Connected"
- [ ] Can create a room
- [ ] Can join a room via link
- [ ] Socket.io connections work
- [ ] No errors in browser console
- [ ] No errors in Railway logs

---

**Congratulations!** Your ChipTable app should now be live on Railway! 🎉

