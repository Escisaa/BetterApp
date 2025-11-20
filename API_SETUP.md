# API Setup Guide

This document lists all APIs that need to be configured for the tool to work.

## Required APIs (Backend - `server/.env`)

### 1. Google Gemini API (Required)

**Purpose**: AI Chat, Review Analysis, Competitive Intelligence, Smart Tags

**Setup**:

1. Go to https://aistudio.google.com/apikey
2. Create a new API key
3. Add to `server/.env`:
   ```
   API_KEY=your_gemini_api_key_here
   ```

**Cost**: Free tier available, pay-as-you-go after

---

### 2. Supabase (Required)

**Purpose**: License management, subscriptions, device binding

**Setup**:

1. Go to https://supabase.com
2. Create a new project
3. Get your Project URL and anon key
4. Add to `server/.env`:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   ```
5. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor

**Cost**: Free tier available

---

### 3. Stripe (Required for Payments)

**Purpose**: Payment processing, subscription management

**Setup**:

1. Go to https://stripe.com
2. Create account and get API keys
3. Create a product with yearly price (£120)
4. Get the Price ID
5. Add to `server/.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_PRICE_ID=price_...
   STRIPE_WEBHOOK_SECRET=whsec_... (from webhook endpoint)
   ```
6. Set up webhook endpoint: `https://your-domain.com/api/stripe/webhook`
7. Listen for: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

**Cost**: 2.9% + 30¢ per transaction

---

### 4. Resend (Required for Email)

**Purpose**: Sending license keys to customers

**Setup**:

1. Go to https://resend.com
2. Create account and get API key
3. Add to `server/.env`:
   ```
   EMAIL_HOST=smtp.resend.com
   EMAIL_PORT=587
   EMAIL_USER=resend
   EMAIL_PASSWORD=re_your_api_key_here
   ```

**Cost**: Free tier: 3,000 emails/month, then $20/month for 50k

---

## Optional APIs (Frontend - `.env`)

### 5. DeepL API (Optional - for Keyword Translations)

**Purpose**: Translate keywords in non-English countries

**Setup** (2 minutes):

1. **Go to**: https://www.deepl.com/pro-api
2. **Click "Sign up"** → Create free account (no credit card!)
3. **Choose "API Free" plan** (500,000 characters/month)
4. **Go to "API Keys & Limits"** in your dashboard
5. **Create API key** → Copy it
6. **Add to frontend `.env`**:
   ```
   VITE_DEEPL_API_KEY=your_deepl_key_here
   ```

**Note**: If not set, translations gracefully degrade (no errors, just no translations)

**Cost**: **100% FREE** - 500,000 characters/month (plenty for keyword translations!)

**Quick Setup**: Takes 2 minutes, completely free, enhances ASO feature

---

## Backend Environment Variables (`server/.env`)

```env
# Required
API_KEY=your_gemini_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=587
EMAIL_USER=resend
EMAIL_PASSWORD=re_your_resend_key

# Optional
SERPAPI_API_KEY=your_serpapi_key (if using SerpAPI for additional data)
```

## Frontend Environment Variables (`.env`)

```env
# Required
VITE_API_URL=http://localhost:3002 (or your backend URL)

# Optional
VITE_DEEPL_API_KEY=your_deepl_key (for translations)
```

---

## Testing

### Test Mode Setup

1. Use Stripe test mode keys (starts with `sk_test_` and `pk_test_`)
2. Use test webhook endpoint: `stripe listen --forward-to localhost:3002/api/stripe/webhook`
3. Test payments with card: `4242 4242 4242 4242`

### Production Setup

1. Replace all test keys with live keys
2. Update webhook endpoint to production URL
3. Update `VITE_API_URL` to production backend URL

---

## Notes

- **Gemini API**: Required for all AI features
- **Supabase**: Required for license system
- **Stripe**: Required for payments (can use test mode for development)
- **Resend**: Required for sending license keys
- **DeepL**: Optional - enhances keyword feature but not required

All APIs have free tiers except Stripe (which takes a percentage of payments).
