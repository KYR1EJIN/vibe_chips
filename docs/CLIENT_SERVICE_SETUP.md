# Client Service Railway Configuration

## Critical Settings for Client Service

When Railway auto-detects your client service, you need to configure it correctly:

### Step 1: Set Root Directory

1. Go to client service → **Settings** → **Service**
2. **Root Directory**: Set to `client` (not empty!)
3. This tells Railway to run commands from the `client/` directory

### Step 2: Verify Build Command

1. Go to **Settings** → **Service**
2. **Build Command**: Should be `npm install && npm run build`
3. This builds the static files to `client/dist/`

### Step 3: Verify Start Command

1. Go to **Settings** → **Service**
2. **Start Command**: Should be `npm run start`
3. This runs `node server.js` which serves the static files

### Step 4: Check Environment Variables

1. Go to **Variables** tab
2. Ensure `VITE_SERVER_URL` is set to your server URL
3. Example: `https://vibe-chipsserver-production.up.railway.app`

### Step 5: Verify Deployment

1. Go to **Deployments** tab
2. Check the latest deployment logs
3. Look for:
   - ✅ Build completing successfully
   - ✅ "Client server running on port XXXX"
   - ❌ Any errors about missing files or ports

## Troubleshooting

### If still getting "Not Found":

1. **Check Root Directory**: Must be `client`, not empty
2. **Check Build Logs**: Verify `dist/` folder is created
3. **Check Start Logs**: Verify server.js is running
4. **Test Health Endpoint**: Visit `https://your-client-url/health`
   - Should return: `{"status":"ok","service":"client",...}`

### Common Issues:

- **Root Directory wrong**: If set to root, Railway can't find `server.js`
- **Build failing**: Check that all dependencies install correctly
- **Port not listening**: Verify `PORT` environment variable is set by Railway

