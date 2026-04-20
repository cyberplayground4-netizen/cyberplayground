import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';

// Route imports (must be at top-level in ESM)
import authRoutes from './routes/auth.js';
import scenarioRoutes from './routes/scenarios.js';
import subscriptionRoutes from './routes/subscription.js';
import webhookRoutes from './routes/webhooks.js';
import certificateRoutes from './routes/certificates.js';
import progressRoutes from './routes/progress.js';
import dailyRoutes from './routes/daily.js';

const app = express();

// ── Security Headers ───────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://checkout.razorpay.com'],
        frameSrc: ["'self'", 'https://api.razorpay.com'],
      },
    },
  })
);

// ── CORS ───────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// ── Body Parsing ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Global Rate Limit ──────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// ── Session Management ─────────────────────────────────────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-me-in-production-32chars',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/daily', dailyRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 Handler ────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Start ──────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅  Server running on http://localhost:${PORT}`);
});
