# Deployment Guide

## Architecture

- **Frontend (Vercel)**: React app with Vite
- **Backend (Render)**: Express.js API server

## Frontend Deployment (Vercel)

### Setup

1. Connect your GitHub repo to Vercel
2. Vercel will auto-detect Vite/React
3. Configure environment variables in Vercel dashboard

### Environment Variables (Vercel)

```
VITE_API_URL=https://betterapp-arsv.onrender.com
```

### Build Settings

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Deployment

Vercel will automatically deploy on every push to main branch.

## Backend Deployment (Render)

### Setup

1. Connect your GitHub repo to Render
2. Create a new Web Service
3. Configure the service

### Render Service Settings

- **Name**: `betterapp-backend` (or your preferred name)
- **Environment**: `Node`
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && npm start`
- **Root Directory**: `server`

### Environment Variables (Render)

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

### Auto-Deploy

Render will auto-deploy on every push to main branch.

## Manual Deployment Commands

### Deploy to Vercel (Production)

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Deploy to production
vercel --prod
```

### Deploy to Render

Render uses automatic deployments from GitHub. No manual command needed.

## Testing Deployment

### Frontend (Vercel)

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Check that landing page loads
3. Navigate to `/dashboard`
4. Test subscription flow

### Backend (Render)

1. Visit `https://your-backend.onrender.com/api/health`
2. Should return: `{"status":"ok",...}`
3. Test API endpoints from frontend

## Troubleshooting

### CORS Issues

- Ensure Render backend has CORS enabled (already configured)
- Check that `VITE_API_URL` in Vercel matches your Render backend URL

### Environment Variables

- Double-check all env vars are set in both Vercel and Render
- Restart services after adding new env vars

### Build Failures

- Check build logs in Vercel/Render dashboards
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] All environment variables set in Render
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Stripe webhook URL configured in Stripe dashboard
- [ ] Supabase database configured
- [ ] Email service (Resend) configured
- [ ] Test subscription flow end-to-end
- [ ] Test license activation
- [ ] Test subscription management
- [ ] Test resend license key
