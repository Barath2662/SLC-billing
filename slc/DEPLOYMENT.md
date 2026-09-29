# Individual Deployment Guide

## Frontend (Vercel)

1. **Push only the frontend folder to a new GitHub repo** (or use subdirectory deployment)
2. **On Vercel Dashboard:**
   - Create new project → Import Git Repository
   - Framework: **Vite**
   - Root directory: `frontend/` (if entire project is uploaded)
   - Build command: `npm run build`
   - Output directory: `dist`
   
3. **Set Environment Variables:**
   - `VITE_API_URL` = Your backend URL (e.g., `https://slc-billing-api.onrender.com`)

4. **Deploy** ✅

---

## Backend (Render)

1. **Push only the backend folder to a new GitHub repo** (or use subdirectory deployment)
2. **On Render Dashboard:**
   - Create new **Web Service**
   - Connect GitHub repo (backend folder)
   - Runtime: **Node.js**
   - Build command: `npm install && npx prisma migrate deploy`
   - Start command: `npm start`
   
3. **Set Environment Variables:**
   - `DATABASE_URL` - Your Supabase connection string
   - `DIRECT_URL` - Your Supabase direct URL
   - `JWT_SECRET` - Your JWT secret
   - `CORS_ORIGIN` - Your Vercel frontend URL (https://your-frontend.vercel.app)
   - `KEEP_ALIVE_ENABLED` - true
   - `KEEP_ALIVE_INTERVAL_HOURS` - 1

4. **Deploy** ✅

---

## Update Frontend After Backend Deploy

Once backend is running on Render:
1. Get the backend URL from Render dashboard (e.g., `https://slc-billing-api.onrender.com`)
2. Update frontend `VITE_API_URL` environment variable in Vercel with this URL
3. Redeploy frontend

---

## Local Development

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

Frontend will be at `http://localhost:5173` and automatically proxy `/api` calls to `http://localhost:5000`
