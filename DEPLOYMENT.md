# Deployment Guide: Vercel (Frontend) + Render (Backend)

## Overview

- **Frontend**: Deployed on Vercel (React + Vite)
- **Backend**: Deployed on Render (Python + FastAPI)

Both services need to communicate across different domains, with proper environment variable configuration.

---

## Backend Deployment (Render)

Your backend is already deployed at: `https://pricing-consequence-agent.onrender.com`

**Render Environment Variables** (already configured):
- `GROQ_API_KEY` — Your Groq API key
- `HINDSIGHT_API_KEY` — Your Hindsight API key
- `HINDSIGHT_BASE_URL` — Memory service endpoint (optional, defaults to Hindsight Cloud)
- `HINDSIGHT_BANK_ID` — Memory bank ID (optional, defaults to `pricing-decisions-v2`)

✅ Backend health check: `https://pricing-consequence-agent.onrender.com/health`

---

## Frontend Deployment (Vercel)

### Step 1: Connect Your Repository to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "Add New..." → "Project"
4. Import your GitHub repository: `laxmibagodi/pricing-consequence-agent`
5. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (or leave blank if Vercel auto-detects)
   - **Build Command**: `npm run build` (Vercel should auto-detect)
   - **Output Directory**: `dist` (Vercel should auto-detect)

### Step 2: Add Environment Variable in Vercel

This is **critical** for frontend-to-backend communication.

1. In Vercel project settings, go to: **Settings** → **Environment Variables**
2. Add a new environment variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://pricing-consequence-agent.onrender.com`
   - **Environments**: Select "Production" (and "Preview" if desired for testing)
   - Click "Save"

**Why this matters:**
- Vite needs `VITE_API_URL` during build time to bake the backend URL into the JavaScript
- Without this, the frontend will default to `localhost:8000`, which won't work on Vercel
- The `.env.production` file in the repo acts as a placeholder; Vercel's UI overrides it

### Step 3: Deploy

1. Commit your code to GitHub (including the `.env.production` file and `vercel.json`)
2. Push to the `main` branch
3. Vercel automatically detects the push and triggers a build
4. Once deployed, your frontend will be available at a Vercel URL (e.g., `https://pricing-consequence-agent.vercel.app`)

### Step 4: Verify Connection

1. Open your Vercel frontend URL
2. Try submitting a pricing proposal
3. Check the browser DevTools Console (F12 → Console tab) for any errors
4. If successful, you'll see the agent's analysis

---

## Local Development

For local development, use the existing setup:

```powershell
# Terminal 1: Start backend
python -m uvicorn backend.api:app --reload

# Terminal 2: Start frontend
cd frontend
npm run dev
```

The frontend will use `.env.development` which points to `http://localhost:8000`.

---

## Environment Variable Flow

### Development (localhost)
```
.env.development: VITE_API_URL=http://localhost:8000
                     ↓
              npm run dev
                     ↓
           Frontend at http://localhost:5173
                     ↓
              Calls http://localhost:8000/ask
                     ↓
                 Works locally ✅
```

### Production (Vercel + Render)
```
Vercel UI: VITE_API_URL=https://pricing-consequence-agent.onrender.com
                     ↓
              npm run build
                     ↓
         Build artifact includes Render URL
                     ↓
           Frontend at https://xxx.vercel.app
                     ↓
      Calls https://pricing-consequence-agent.onrender.com/ask
                     ↓
         Backend on Render processes request
                     ↓
              Works in production ✅
```

---

## Troubleshooting

### "The pricing memory service is temporarily unavailable"

**Cause**: Frontend is calling the wrong backend URL or backend is down.

**Fix**:
1. Check Vercel Environment Variables: `VITE_API_URL=https://pricing-consequence-agent.onrender.com`
2. Check backend is running: `https://pricing-consequence-agent.onrender.com/health`
3. Check browser DevTools Network tab for failed requests to the backend

### Build fails on Vercel

**Cause**: Missing dependencies or build configuration issues.

**Fix**:
1. Ensure `frontend/package.json` is correct
2. Check Vercel build logs: Settings → Deployments → View Log
3. Verify `npm run build` works locally: `cd frontend && npm run build`

### CORS errors

**Status**: Should not occur. Backend has `allow_origins=["*"]`.

If CORS errors appear, the backend URL is likely incorrect or the backend is down.

---

## Files Reference

| File | Purpose |
|------|---------|
| `frontend/.env.development` | Local dev config (localhost:8000) |
| `frontend/.env.production` | Production config placeholder (Vercel UI overrides this) |
| `frontend/vercel.json` | Vercel build configuration |
| `backend/api.py` | Render backend (no changes needed) |

---

## Summary Checklist

- [ ] Backend deployed on Render: `https://pricing-consequence-agent.onrender.com`
- [ ] Backend health check passes: `https://pricing-consequence-agent.onrender.com/health`
- [ ] Repository pushed to GitHub with latest code
- [ ] Vercel project created and connected to repository
- [ ] Vercel environment variable set: `VITE_API_URL=https://pricing-consequence-agent.onrender.com`
- [ ] Frontend deployed successfully on Vercel
- [ ] Frontend can reach backend (test with pricing proposal)
- [ ] DevTools Console shows no errors

---

## Questions?

If the frontend and backend aren't connecting:

1. **Check browser DevTools Console** (F12 → Console) for error messages
2. **Check Vercel build logs** for any build-time errors
3. **Verify backend is running**: Visit `https://pricing-consequence-agent.onrender.com/health` in browser
4. **Verify environment variable**: In Vercel UI, confirm `VITE_API_URL` is set correctly
5. **Rebuild on Vercel**: Trigger a manual rebuild in Vercel → Deployments → "Redeploy"

---

**Ready to deploy!** 🚀
