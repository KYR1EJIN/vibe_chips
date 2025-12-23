# Quick Deployment Checklist

## Before You Deploy

1. ✅ **Code is ready**: All changes committed and pushed to GitHub
2. ✅ **Build works locally**: Run `npm run build` successfully
3. ✅ **Environment variables prepared**: Know what values you'll need

## Railway Deployment Steps

1. **Sign up** at [railway.app](https://railway.app)
2. **Create new project** → "Deploy from GitHub repo"
3. **Select your repository** (`vibe_chips`)
4. **Add environment variables**:
   ```
   NODE_ENV=production
   CORS_ORIGIN=https://your-app-name.railway.app
   ```
5. **Wait for deployment** (2-5 minutes)
6. **Get your URL** from Railway dashboard
7. **Update CORS_ORIGIN** with your actual Railway URL
8. **Test** your deployed app!

## Key Environment Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Required |
| `CORS_ORIGIN` | Your Railway URL | Update after first deploy |
| `PORT` | Auto-set by Railway | Don't need to set manually |

## Quick Test

After deployment, check:
- [ ] App loads at Railway URL
- [ ] Connection indicator shows "Connected"
- [ ] Can create a room
- [ ] Can join a room via link

## Full Guide

See `docs/DEPLOYMENT.md` for detailed instructions and troubleshooting.

