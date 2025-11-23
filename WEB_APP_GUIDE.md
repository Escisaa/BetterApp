# BetterApp - Web Application Guide

## Overview

BetterApp is now a **fully functional web application** accessible from any browser. All desktop app code has been removed and the application runs entirely in the browser.

## Architecture

### Frontend (Vercel)

- **Framework**: React + TypeScript + Vite
- **Routing**: React Router (URL-based navigation)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (automatic deployments from GitHub)

### Backend (Render)

- **Framework**: Express.js (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Payment**: Stripe
- **Email**: Resend
- **Deployment**: Render (API-only, no frontend serving)

## How It Works End-to-End

### 1. User Flow

#### Landing Page (`/`)

- User visits the landing page
- Can view features, pricing, FAQ
- Clicks "Subscribe" → Stripe checkout
- Clicks "Get Started" → Redirects to `/dashboard` (requires license)

#### Dashboard (`/dashboard`)

- **Protected Route**: Requires valid license key
- If no license → Redirected back to landing page
- If valid license → Full access to dashboard features

### 2. Authentication & Licensing

**Current System: License Key Based**

- No traditional user accounts (email/password)
- Users purchase subscription → Receive license key via email
- License key stored in browser localStorage
- License validated on dashboard access

**How License Works:**

1. User subscribes via Stripe on landing page
2. Stripe webhook creates license in Supabase
3. License key sent to user's email
4. User enters license key in dashboard
5. License validated against Supabase on each access
6. Device ID (browser fingerprint) stored for security

**License Validation:**

- Checks if license exists in database
- Verifies license is active and not expired
- Validates device binding (optional security)
- Returns license status to frontend

### 3. Features

#### Dashboard Features (All Require License):

- **App Search**: Search App Store/Play Store apps
- **Review Analysis**: AI-powered review analysis
- **Competitive Intelligence**: "How to Beat Them" insights
- **Keyword Research**: ASO keyword discovery and tracking
- **AI Chat**: Chat with AI about any app
- **Tracked Apps**: Save and monitor apps over time
- **Analysis History**: View past analyses

### 4. Data Flow

```
User Browser (Vercel)
    ↓
React App (Frontend)
    ↓
API Calls → Render Backend (Express)
    ↓
    ├─→ Supabase (License validation, data storage)
    ├─→ Stripe (Payment processing)
    ├─→ Google Gemini API (AI analysis)
    ├─→ SERP API (App Store data)
    └─→ Resend (Email sending)
```

### 5. Payment Flow

1. User clicks "Subscribe" on landing page
2. Frontend calls `/api/stripe/checkout`
3. Backend creates Stripe checkout session
4. User redirected to Stripe payment page
5. After payment, Stripe webhook calls `/api/stripe/webhook`
6. Backend:
   - Creates license in Supabase
   - Generates unique license key
   - Sends license key email via Resend
7. User receives email with license key
8. User enters license key in dashboard to access

### 6. Environment Variables

**Frontend (Vercel):**

- `VITE_API_URL`: Backend API URL (https://betterapp-arsv.onrender.com)

**Backend (Render):**

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `GEMINI_API_KEY`: Google Gemini API key
- `SERPAPI_API_KEY`: SERP API key (optional)
- `EMAIL_USER`: Resend email user
- `EMAIL_PASSWORD`: Resend API key
- `PORT`: Server port (default: 3002)

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Vercel auto-deploys from `main` branch
3. Build command: `npm run build`
4. Output directory: `dist/`

### Backend (Render)

1. Push code to GitHub
2. Render auto-deploys from `main` branch
3. Build command: `cd server && npm install`
4. Start command: `cd server && npm start`
5. Root directory: `server/`

## Security

- **License Validation**: All dashboard routes protected
- **CORS**: Backend configured to accept requests from Vercel domain
- **Device Binding**: Optional device ID binding for license security
- **API Keys**: All sensitive keys stored in environment variables

## Future Enhancements (Optional)

1. **User Accounts**: Replace license keys with email/password auth
2. **OAuth**: Add Google/GitHub login
3. **Multi-device**: Allow license on multiple devices
4. **Team Plans**: Multi-user licenses
5. **API Access**: REST API for enterprise customers

## File Structure

```
/
├── components/          # React components
│   ├── Dashboard.tsx   # Main dashboard (protected)
│   ├── LandingPage.tsx # Landing page (public)
│   └── ...
├── services/           # Frontend services
│   ├── apiService.ts   # API calls
│   ├── licenseService.ts # License management
│   └── ...
├── server/             # Backend API
│   ├── index.js        # Express server
│   └── services/       # Backend services
│       ├── licenseService.js
│       ├── stripeService.js
│       └── ...
└── App.tsx             # Main app with routing
```

## Testing

1. **Local Development:**

   - Frontend: `npm run dev` (runs on http://localhost:3001)
   - Backend: `cd server && npm start` (runs on http://localhost:3002)

2. **Production:**
   - Frontend: https://your-vercel-url.vercel.app
   - Backend: https://betterapp-arsv.onrender.com

## Support

- All features work in browser
- No installation required
- Works on all devices (desktop, tablet, mobile)
- Responsive design
