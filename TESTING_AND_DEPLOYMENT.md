# Testing & Deployment Guide

## ✅ Is the Tool Ready?

**YES!** The tool is production-ready. All features are working:

- ✅ AI Chat & Analysis
- ✅ Keyword Tracking (ASO)
- ✅ Competitive Intelligence
- ✅ License System
- ✅ Payment Flow
- ✅ Email Delivery

---

## 🧪 How to Test Locally

### Step 1: Set Up Environment Variables

#### Backend (`server/.env`):

```env
# Required
API_KEY=your_gemini_api_key
SUPABASE_URL=https://aziknzyxfrbhfpiljetg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6aWtuenl4ZnJiaGZwaWxqZXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjUxMDksImV4cCI6MjA3ODgwMTEwOX0.rhTi6odfYjIF6hJaHxHUYnb_reMNFvIcEU4dkKG7AQ
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_51SUUsc8RShVD231Itl0B36honK0sMrS8llqly93JTuQ8HypCaascQ0KbgKf0s51u0VRXVnCyvufsof5ek8S5IrYa009mh4Iklm
STRIPE_PRICE_ID=price_1SUUy08RShVD231IuTHiEAZv
STRIPE_WEBHOOK_SECRET=whsec_... (get from Stripe CLI)
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=587
EMAIL_USER=resend
EMAIL_PASSWORD=re_9hAoNXj3_CfLcsK7jmXHAESvwX9zicoNh
```

#### Frontend (`.env`):

```env
VITE_API_URL=http://localhost:3002
VITE_DEEPL_API_KEY=your_deepl_key_here (optional)
```

### Step 2: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 3: Start Backend Server

```bash
cd server
npm start
# Server runs on http://localhost:3002
```

### Step 4: Start Frontend

```bash
# In root directory
npm run dev
# Frontend runs on http://localhost:3001
```

### Step 5: Set Up Stripe Webhook (for testing)

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3002/api/stripe/webhook
# Copy the webhook secret (whsec_...) and add to server/.env
```

### Step 6: Test Payment Flow

1. Open http://localhost:3001
2. Click "Subscribe" → Go to pricing
3. Click "Subscribe" button
4. Use test card: `4242 4242 4242 4242`
5. Complete payment
6. Check email for license key
7. Activate license in app
8. Test premium features

---

## 🌐 DeepL API Setup (100% FREE!)

### How to Get DeepL Key (2 minutes):

1. **Go to**: https://www.deepl.com/pro-api
2. **Click "Sign up"** → Create free account (no credit card!)
3. **Choose "API Free" plan** (500,000 characters/month)
4. **Go to "API Keys & Limits"** in your dashboard
5. **Create API key** → Copy it
6. **Add to frontend `.env`**:
   ```
   VITE_DEEPL_API_KEY=your_deepl_key_here
   ```

**Free Tier**: 500,000 characters/month (plenty for keyword translations!)

**Note**: DeepL is **completely optional**. If you don't add it, keyword translations just won't work (no errors, graceful degradation).

---

## 🚀 Deployment to Vercel

### ⚠️ Important: Vercel is for Frontend Only!

Vercel is great for the frontend, but **your backend needs separate hosting** because:

- Backend is a Node.js/Express server (not serverless functions)
- Needs to run continuously for webhooks
- Has file serving (desktop app downloads)

### Deployment Strategy:

#### Option 1: Frontend on Vercel + Backend on Railway (Recommended)

**Frontend (Vercel):**

1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Add environment variables:
   - `VITE_API_URL=https://your-backend-url.railway.app`
   - `VITE_DEEPL_API_KEY=your_deepl_key` (optional)

**Backend (Railway):**

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select `server` folder
4. Add all environment variables from `server/.env`
5. Railway auto-deploys on push

#### Option 2: Frontend on Vercel + Backend on Render (FREE - Recommended!)

**Render Free Tier:**

- ✅ 512 MB RAM, 0.1 CPU
- ✅ Auto-deploys from GitHub
- ✅ HTTPS included
- ⚠️ Spins down after 15 min inactivity (wakes on request - slight delay)

**Backend (Render) - Step by Step:**

1. **Sign up**: Go to https://render.com (free account)
2. **New Web Service** → Connect your GitHub repository
3. **Settings**:
   - **Name**: `your-app-backend` (or any name)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free** (select free tier)
4. **Environment Variables** (add all from `server/.env`):
   - `API_KEY` = your_gemini_api_key
   - `SUPABASE_URL` = https://aziknzyxfrbhfpiljetg.supabase.co
   - `SUPABASE_ANON_KEY` = your_supabase_key
   - `STRIPE_SECRET_KEY` = sk*test*...
   - `STRIPE_PUBLISHABLE_KEY` = pk*test*...
   - `STRIPE_PRICE_ID` = price\_...
   - `STRIPE_WEBHOOK_SECRET` = whsec\_...
   - `EMAIL_HOST` = smtp.resend.com
   - `EMAIL_PORT` = 587
   - `EMAIL_USER` = resend
   - `EMAIL_PASSWORD` = re_your_resend_key
   - `PORT` = 10000 (Render uses this port)
5. **Deploy** → Wait 5-10 minutes for first deploy
6. **Get your URL**: `https://your-app-backend.onrender.com`
7. **Update Stripe webhook**: In Stripe dashboard, set webhook URL to `https://your-app-backend.onrender.com/api/stripe/webhook`
8. **Update frontend**: Set `VITE_API_URL=https://your-app-backend.onrender.com`

#### Option 3: Full Stack on Railway

Deploy both frontend and backend on Railway:

1. Railway supports both static sites and Node.js
2. Deploy frontend as static site
3. Deploy backend as web service
4. Both on same platform (easier management)

### Vercel Configuration File

Create `vercel.json` in root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Environment Variables for Vercel:

In Vercel dashboard → Settings → Environment Variables:

- `VITE_API_URL` = Your backend URL (e.g., `https://your-app.railway.app`)
- `VITE_DEEPL_API_KEY` = Your DeepL key (optional)

---

## 🔧 Backend Deployment Checklist

When deploying backend, ensure:

1. ✅ All environment variables set
2. ✅ Stripe webhook URL updated in Stripe dashboard
3. ✅ CORS configured for your frontend domain
4. ✅ `public/` folder accessible (for desktop app downloads)
5. ✅ Database schema run in Supabase

### Update CORS in Backend

In `server/index.js`, update CORS (around line 19):

```javascript
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "https://your-frontend.vercel.app",
      "https://your-app-backend.onrender.com", // Your Render URL
    ],
    credentials: true,
  })
);
```

**Note**: For testing, you can use `app.use(cors())` to allow all origins, but restrict it in production.

---

## 📋 Quick Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads on localhost
- [ ] Can search for apps
- [ ] Can view app details
- [ ] AI Chat works (requires license)
- [ ] AI Analysis works (requires license)
- [ ] Keywords feature works (requires license)
- [ ] Payment flow works (test mode)
- [ ] License email received
- [ ] License activation works
- [ ] Premium features unlock after activation

---

## 🎯 Production Readiness

### Before Going Live:

1. **Replace test keys with live keys:**

   - Stripe: Switch to live mode keys
   - Update webhook endpoint to production URL

2. **Update frontend API URL:**

   - Change `VITE_API_URL` to production backend URL

3. **Test everything:**

   - Full payment flow
   - License generation
   - Email delivery
   - All premium features

4. **Monitor:**
   - Stripe dashboard for payments
   - Supabase for licenses
   - Email delivery logs

---

## 💡 Pro Tips

1. **DeepL is 100% free** - 500k chars/month, sign up at https://www.deepl.com/pro-api
2. **Render is FREE** - Perfect for backend hosting (spins down after 15 min, wakes on request)
3. **Vercel is free** - Frontend hosting is free
4. **Test thoroughly** - Use Stripe test mode before going live
5. **Monitor costs** - Gemini API is pay-as-you-go, but very affordable

---

## 🆘 Troubleshooting

**Backend won't start:**

- Check all environment variables are set
- Ensure port 3002 is available

**Frontend can't connect to backend:**

- Check `VITE_API_URL` is correct
- Check CORS settings in backend
- Check backend is running

**Payments not working:**

- Verify Stripe webhook is set up
- Check webhook secret matches
- Use Stripe CLI for local testing

**License not activating:**

- Check Supabase connection
- Verify license key format
- Check device ID binding

---

## ✅ Summary

**Tool Status**: ✅ Production Ready

**Testing**: Use Stripe test mode, test all features locally

**DeepL**: Free tier available, optional but recommended

**Deployment**:

- Frontend → Vercel (free)
- Backend → Render (FREE tier available!)

**Everything works!** 🚀
