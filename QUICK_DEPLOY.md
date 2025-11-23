# Quick Deployment Guide

## ✅ Ready to Deploy!

### 1. Deploy Backend to Render

- Already configured! Just push to GitHub and Render will auto-deploy
- Or manually: Go to Render dashboard → Your service → Manual Deploy

### 2. Deploy Frontend to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy to production
npm run deploy:vercel

# Or for preview
npm run deploy:vercel:preview
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect Vite/React
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`
5. Click Deploy

### 3. Environment Variables

#### Vercel (Frontend)

```
VITE_API_URL=https://betterapp-arsv.onrender.com
```

#### Render (Backend)

```
NODE_ENV=production
PORT=3002
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
RESEND_API_KEY=your_resend_api_key
SERPAPI_API_KEY=your_serpapi_key (optional)
```

### 4. Test After Deployment

1. Visit your Vercel URL
2. Click "Get Started" → Should navigate to dashboard
3. Test subscription flow
4. Test license activation

## 🎉 Done!

Your app is now live on:

- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`
