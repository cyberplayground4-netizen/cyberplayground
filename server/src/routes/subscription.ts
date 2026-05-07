import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { SubscriptionService } from '../services/subscription.service.js';
import { z } from 'zod';
import prisma from '../config/database.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// ── Create subscription (called before Razorpay checkout popup opens) ─────────
router.post('/create', requireAuth, async (req, res) => {
  try {
    const result = await SubscriptionService.createSubscription(req.session.userId!);
    res.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to create subscription';
    logger.error('Subscription create failed', { error: msg, stack: error instanceof Error ? error.stack : undefined });
    res.status(500).json({ error: msg });
  }
});

// ── Verify payment (called after Razorpay checkout popup succeeds) ─────────────
// Client sends: razorpay_payment_id, razorpay_subscription_id, razorpay_signature
const verifySchema = z.object({
  razorpay_payment_id:      z.string().min(1),
  razorpay_subscription_id: z.string().min(1),
  razorpay_signature:       z.string().min(1),
});

router.post('/verify', requireAuth, async (req, res) => {
  try {
    const parsed = verifySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    await SubscriptionService.verifyPayment({
      ...parsed.data,
      userId: req.session.userId!,
    });

    res.json({ success: true, message: 'Payment verified. Premium access activated!' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Payment verification failed';
    // Use 400 for signature failures (client-visible), 500 for unexpected errors
    const status = msg.includes('signature') ? 400 : 500;
    res.status(status).json({ error: msg });
  }
});

// ── Get subscription + payment history ───────────────────────────────────────
router.get('/status', requireAuth, async (req, res) => {
  try {
    const sub = await SubscriptionService.getSubscriptionStatus(req.session.userId!);

    // Also return recent payment records
    const payments = await prisma.payments.findMany({
      where:   { user_id: req.session.userId },
      orderBy: { created_at: 'desc' },
      take:    10,
      select: {
        id: true, status: true, amount: true, currency: true,
        razorpay_payment_id: true, created_at: true,
      },
    });

    res.json({
      isActive:     !!sub,
      subscription: sub,
      payments,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check subscription status' });
  }
});

// ── Cancel subscription ────────────────────────────────────────────────────────
router.post('/cancel', requireAuth, async (req, res) => {
  try {
    const sub = await prisma.subscriptions.findFirst({
      where: { user_id: req.session.userId, status: 'active' },
    });

    if (!sub) return res.status(404).json({ error: 'No active subscription found' });

    // In production: also call Razorpay API to cancel the subscription
    await prisma.subscriptions.update({
      where: { id: sub.id },
      data:  { status: 'cancelled' },
    });

    res.json({ success: true, message: 'Subscription cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

export default router;
