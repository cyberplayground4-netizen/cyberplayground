import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { logger } from './utils/logger.js';

// Route imports
import authRoutes         from './routes/auth.js';
import scenarioRoutes     from './routes/scenarios.js';
import subscriptionRoutes from './routes/subscription.js';
import webhookRoutes      from './routes/webhooks.js';
import certificateRoutes  from './routes/certificates.js';
import progressRoutes     from './routes/progress.js';
import dailyRoutes        from './routes/daily.js';

const app = express();

// ── HTTP Request Logger ────────────────────────────────────────────────────────
app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    skip: (_req, res) => res.statusCode < 400 && process.env.NODE_ENV === 'production',
  })
);

// ── Security Headers ───────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:  ["'self'"],
        scriptSrc:   ["'self'", 'https://checkout.razorpay.com'],
        frameSrc:    ["'self'", 'https://api.razorpay.com'],
        connectSrc:  ["'self'", 'https://api.razorpay.com', 'https://lumberjack.razorpay.com'],
        imgSrc:      ["'self'", 'data:', 'https:'],
        styleSrc:    ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Required for Razorpay iframe
  })
);

// ── CORS ───────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS policy: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// ── Webhook route MUST receive raw body for HMAC verification ──────────────────
app.use('/api/webhooks', express.raw({ type: 'application/json' }));

// ── Body Parsing ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ── Global Rate Limit ──────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs:       15 * 60 * 1000, // 15 minutes
  max:            200,
  standardHeaders: true,
  legacyHeaders:  false,
  message:        { error: 'Too many requests, please try again later' },
});
app.use(globalLimiter);

// ── Session Management ─────────────────────────────────────────────────────────
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
  logger.warn(
    'SESSION_SECRET is not set or too short. Using fallback — CHANGE THIS IN PRODUCTION.'
  );
}

app.use(
  session({
    secret:            SESSION_SECRET || 'fallback-secret-change-me-in-production-32chars',
    resave:            false,
    saveUninitialized: false,
    cookie: {
      secure:   process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge:   24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// ── Origin-based CSRF protection ───────────────────────────────────────────────
// State-mutating requests (non-GET/HEAD/OPTIONS) must originate from the known
// client origin. Webhook routes are excluded because they are authenticated via
// Razorpay HMAC signature instead.
app.use((req: Request, res: Response, next: NextFunction) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) return next();
  if (req.path.startsWith('/api/webhooks')) return next();

  const origin      = req.headers.origin || req.headers.referer || '';
  const clientUrl   = process.env.CLIENT_URL || 'http://localhost:5173';

  if (origin && !origin.startsWith(clientUrl)) {
    logger.warn('CSRF check failed', { origin, clientUrl, path: req.path });
    return res.status(403).json({ error: 'CSRF validation failed' });
  }
  next();
});

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/scenarios',    scenarioRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/webhooks',     webhookRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/progress',     progressRoutes);
app.use('/api/daily',        dailyRoutes);

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status:    'ok',
    timestamp: new Date().toISOString(),
    env:       process.env.NODE_ENV || 'development',
  });
});

// ── 404 Handler ────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global Error Handler ───────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

// ── Start ──────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  logger.info(`Server running`, { port: PORT, env: process.env.NODE_ENV || 'development' });
});
