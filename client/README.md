# 🛡️ CyberPlayground

An interactive cybersecurity learning platform with simulation-based gameplay and subscription access.

## ⚡ Quick Start (Local Dev)

```bash
# 1. Clone
git clone https://github.com/cyberplayground4-netizen/cyberplayground.git
cd cyberplayground

# 2. One-command setup (installs deps, creates .env files, seeds DB)
npm run setup

# 3. Start both servers
npm run dev
```

> **App** → http://localhost:5173  
> **API** → http://localhost:3001/api/health

---

## 🔑 Razorpay Setup (for payments)

After running setup, edit `server/.env` and fill in:

```env
RAZORPAY_KEY_ID=rzp_test_...      # from dashboard.razorpay.com/app/keys
RAZORPAY_KEY_SECRET=...
RAZORPAY_PLAN_ID=plan_...         # create a ₹299/month plan
WEBHOOK_SECRET=...                 # from dashboard.razorpay.com/app/webhooks
```

Also set `VITE_RAZORPAY_KEY` in `client/.env` to the same `RAZORPAY_KEY_ID`.

> **Without keys**: app runs in **mock mode** — payments are simulated, no real charges.

---

## 🚀 Deploy to Production

### Option A — Render (Backend + DB in one click)

1. Go to https://render.com → **New** → **Blueprint**
2. Connect your GitHub repo
3. Render reads `render.yaml` and automatically creates:
   - Express API server
   - PostgreSQL database
   - Secure auto-generated `SESSION_SECRET`
4. Set the remaining env vars in the Render dashboard:
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_PLAN_ID`, `WEBHOOK_SECRET`
   - `CLIENT_URL` (your Vercel URL, set after step B)

### Option B — Vercel (Frontend)

1. Go to https://vercel.com → **New Project** → Import from GitHub
2. Set **Root Directory** to `client`
3. Add environment variable: `VITE_RAZORPAY_KEY=rzp_live_...`
4. Deploy — Vercel detects Vite automatically

### Option C — Railway (Backend)

1. Go to https://railway.app → **New Project** → **Deploy from GitHub**
2. Select the `server/` directory
3. Railway reads `server/railway.json` — builds and deploys automatically
4. Add a **PostgreSQL** plugin from Railway dashboard
5. Set env vars in Railway Variables tab

---

## 📁 Project Structure

```
cyberplayground/
├── client/               # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── pages/        # Landing, Dashboard, Simulations, Pricing, Progress
│   │   ├── components/   # Reusable UI + simulation engine
│   │   ├── contexts/     # AuthContext
│   │   ├── stores/       # Zustand global state
│   │   └── services/     # Axios API client
│   └── vercel.json       # Vercel SPA config
│
├── server/               # Express + Node.js + TypeScript backend
│   ├── src/
│   │   ├── routes/       # auth, scenarios, subscription, webhooks, progress
│   │   ├── services/     # auth, subscription (Razorpay), gamification
│   │   ├── middleware/   # requireAuth session guard
│   │   ├── utils/        # structured logger
│   │   ├── lib/          # Razorpay singleton
│   │   └── types/        # Express type augmentations
│   ├── prisma/
│   │   ├── schema.prisma # DB schema (users, scenarios, subscriptions, payments)
│   │   └── seed.ts       # Scenario + badge + daily challenge data
│   ├── Dockerfile        # Multi-stage production Docker image
│   └── railway.json      # Railway auto-deploy config
│
├── render.yaml           # Render Blueprint (API + DB in one click)
├── setup.ps1             # Windows one-command setup script
└── .env.example          # All required env vars documented
```

---

## 🔒 Security Features

- bcrypt password hashing (cost factor 12)
- Account lockout after 5 failed logins
- Session-based auth (httpOnly cookies)
- CSRF protection via Origin validation
- Razorpay HMAC signature verification on payments AND webhooks
- Helmet.js security headers + CSP
- Zod input validation on all endpoints
- Rate limiting (global + per-route)
- Webhook idempotency (replay attack protection)

---

## 💳 Payment Flow

```
User clicks "Upgrade" 
  → POST /api/subscription/create  (server creates Razorpay subscription)
  → Razorpay checkout.js popup opens
  → User pays ₹299
  → POST /api/subscription/verify  (server verifies HMAC signature)
  → Premium activated ✅
  → Razorpay webhooks keep status in sync
```
