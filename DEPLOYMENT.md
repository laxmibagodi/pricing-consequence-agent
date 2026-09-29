# Deployment Guide: Vercel (Frontend) + Render (Backend)

## Architecture

- **Frontend**: React + Vite → Deployed on **Vercel** (separate domain)
- **Backend**: Python FastAPI → Deployed on **Render** (separate domain, already running)
- **Communication**: Frontend calls backend via `VITE_API_URL` environment variable

---

## Backend Status ✅

Backend is already running at: `https://pricing-consequence-agent.onrender.com`

**Verification:**
```
curl https://pricing-consequence-agent.onrender.com/health
→ {"status":"ok"}
```

---

## Frontend Deployment on Vercel

### Step 1: Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Select: `laxmibagodi/pricing-consequence-agent`
4. **Root Directory**: Set to `frontend` (IMPORTANT!)
5. **Framework**: Vercel should auto-detect as "Vite"
6. Leave Build and Output settings as default
7. Click "Deploy"

### Step 2: Set Environment Variable in Vercel

After deployment, configure the backend URL:

1. Go to **Settings** → **Environment Variables**
2. Add new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://pricing-consequence-agent.onrender.com`
   - **Environments**: Production (+ Preview if testing)
3. Click "Save"

### Step 3: Redeploy

1. Go to **Deployments**
2. Find the latest deployment
3. Click "Redeploy"
4. Wait for build to complete

### Step 4: Verify Connection

1. Open your Vercel frontend URL
2. Open browser DevTools (F12 → Network tab)
3. Submit a pricing proposal
4. Verify request goes to `https://pricing-consequence-agent.onrender.com/ask`
5. Response should contain agent analysis ✅

---

## File Configuration

### `vercel.json` (Root)
Tells Vercel to treat `frontend` as the project root:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

### `frontend/vercel.json`
Explicit frontend build configuration (optional, for clarity):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

### `frontend/.env.production`
Placeholder (Vercel UI environment variable overrides this):
```
VITE_API_URL=$VITE_API_URL
```

### `frontend/.env.development`
Local development configuration:
```
VITE_API_URL=http://localhost:8000
```

---

## Local Development

### Terminal 1: Start Backend
```powershell
python -m uvicorn backend.api:app --reload
```
Backend runs at: `http://localhost:8000`

### Terminal 2: Start Frontend
```powershell
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

Both run locally and connect via `localhost:8000` ✅

---

## Troubleshooting

### Vercel Shows "FastAPI" as Framework
**Cause**: Vercel detected `backend/api.py` instead of focusing on `frontend`

**Fix**: 
1. In Vercel project settings, set **Root Directory** to `frontend`
2. Set **Framework** to `Vite`
3. Trigger redeploy

### Frontend Shows "Memory Service Unavailable"
**Cause**: `VITE_API_URL` environment variable not set or incorrect in Vercel

**Fix**:
1. Check Vercel Settings → Environment Variables
2. Verify `VITE_API_URL=https://pricing-consequence-agent.onrender.com`
3. Redeploy after changing

### Frontend Can't Reach Backend
**Cause**: Backend might be down or URL is wrong

**Fix**:
1. Test backend directly: `https://pricing-consequence-agent.onrender.com/health`
2. Check Vercel env var is correct
3. Check browser DevTools Console for errors

---

## Project Structure (for Vercel)

```
pricing-consequence-agent/
├── frontend/                    ← Vercel deploys THIS
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   │   └── api.js          ← Uses VITE_API_URL
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── vercel.json             ← Build config
│   ├── .env.development
│   ├── .env.production
│   ├── index.html
│   └── package.json
├── backend/                     ← Runs on Render (separate)
│   ├── api.py
│   ├── agent.py
│   ├── memory.py
│   └── requirements.txt
└── vercel.json                  ← Root config (tells Vercel to use frontend/)
```

---

## Summary

| Component | Location | URL | Status |
|-----------|----------|-----|--------|
| Backend | Render | `https://pricing-consequence-agent.onrender.com` | ✅ Running |
| Frontend | Vercel | `https://xxx.vercel.app` | Deploy now |
| Config | GitHub | `frontend/vercel.json` + `.env.production` | ✅ Ready |

---

## Next Steps

1. ✅ Backend is running on Render
2. ⏳ Deploy frontend on Vercel (connect GitHub repo, set Root Directory to `frontend`)
3. ⏳ Add `VITE_API_URL` environment variable in Vercel
4. ⏳ Redeploy
5. ✅ Frontend and backend communicate

**Both services run independently. Frontend calls backend via HTTPS.** 🚀

