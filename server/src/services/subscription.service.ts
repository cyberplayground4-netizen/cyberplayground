import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../config/database.js';
import { logger } from '../utils/logger.js';

// Lazily instantiated Razorpay client so the module can be imported even in
// environments where keys aren't present (e.g. test runners).
function getRazorpayClient() {
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID     || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
  });
}

// Mock mode when: no key set, key is the placeholder value, or explicitly starts with 'rzp_test_mock'
const RAZORPAY_KEY = process.env.RAZORPAY_KEY_ID || '';
const IS_MOCK =
  !RAZORPAY_KEY ||
  RAZORPAY_KEY.includes('xxxxxxxxxxxx') ||
  RAZORPAY_KEY.startsWith('rzp_test_mock') ||
  process.env.RAZORPAY_MOCK === 'true';

export class SubscriptionService {
  // ─── Create Razorpay subscription (called before checkout popup) ────────────
  static async createSubscription(userId: string) {
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const planId = process.env.RAZORPAY_PLAN_ID || '';

    let rzpSub: { id: string };

    if (IS_MOCK) {
      rzpSub = { id: `sub_mock_${Date.now()}` };
      logger.warn('Razorpay running in MOCK mode — no real charges made');
    } else {
      if (!planId) throw new Error('RAZORPAY_PLAN_ID is not configured');
      const client = getRazorpayClient();
      rzpSub = await client.subscriptions.create({
        plan_id:        planId,
        customer_notify: 1,
        total_count:    12,
      });
    }

    // Persist in DB as "created" (will become "active" after webhook or verify)
    const existing = await prisma.subscriptions.findFirst({
      where: { user_id: userId, razorpay_subscription_id: rzpSub.id },
    });

    if (!existing) {
      await prisma.subscriptions.create({
        data: {
          user_id:                  userId,
          razorpay_subscription_id: rzpSub.id,
          razorpay_plan_id:         planId || 'plan_mock',
          status:                   'created',
          current_period_start:     new Date(),
          current_period_end:       new Date(),
        },
      });
    }

    logger.info('Subscription created', { userId, subscriptionId: rzpSub.id, mock: IS_MOCK });
    return { subscription_id: rzpSub.id, key: process.env.RAZORPAY_KEY_ID || '' };
  }

  // ─── Verify payment after Razorpay checkout popup success ───────────────────
  // Razorpay sends razorpay_payment_id + razorpay_subscription_id + razorpay_signature.
  // We verify HMAC(payment_id|subscription_id, key_secret) === signature.
  static async verifyPayment(params: {
    razorpay_payment_id:      string;
    razorpay_subscription_id: string;
    razorpay_signature:       string;
    userId:                   string;
  }) {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, userId } = params;

    // In mock mode, skip signature check and activate directly
    if (!IS_MOCK) {
      const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
      const body      = `${razorpay_payment_id}|${razorpay_subscription_id}`;
      const expected  = crypto.createHmac('sha256', keySecret).update(body).digest('hex');

      if (expected !== razorpay_signature) {
        logger.error('Payment signature verification failed', { userId, razorpay_payment_id });
        throw new Error('Payment signature verification failed');
      }
    }

    // Record payment in payments table
    await prisma.payments.create({
      data: {
        user_id:              userId,
        razorpay_payment_id,
        razorpay_signature,
        amount:               29900, // ₹299 in paise
        currency:             'INR',
        status:               'captured',
        subscription_id:      razorpay_subscription_id,
      },
    });

    // Activate the subscription
    const now      = new Date();
    const monthEnd = new Date(now);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    await prisma.subscriptions.updateMany({
      where: { razorpay_subscription_id },
      data:  {
        status:               'active',
        current_period_start: now,
        current_period_end:   monthEnd,
      },
    });

    logger.info('Payment verified and subscription activated', { userId, razorpay_payment_id });
    return { success: true };
  }

  // ─── Webhook handler ────────────────────────────────────────────────────────
  static async handleWebhook(signature: string, payloadStr: string, payloadBase: Record<string, unknown>) {
    const secret = process.env.WEBHOOK_SECRET || '';

    // Verify webhook signature (skip only if no secret set — dev fallback)
    if (secret) {
      const expectedSig = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');
      if (expectedSig !== signature) {
        logger.error('Webhook signature mismatch');
        throw new Error('Invalid webhook signature');
      }
    } else {
      logger.warn('WEBHOOK_SECRET not set — skipping webhook signature verification');
    }

    const event           = payloadBase.event as string;
    const eventId         = (payloadBase.id as string) || `${event}_${Date.now()}`;
    const payloadObj      = payloadBase.payload as Record<string, { entity: Record<string, unknown> }>;
    const paymentEntity   = payloadObj?.subscription?.entity || payloadObj?.payment?.entity;

    // Idempotency guard
    const existing = await prisma.webhook_events.findUnique({ where: { event_id: eventId } });
    if (existing) {
      logger.info('Webhook already processed — skipping', { eventId });
      return;
    }

    await prisma.webhook_events.create({
      data: { event_id: eventId, event_type: event, payload: payloadBase as object, status: 'processing' },
    });

    try {
      if (event === 'subscription.activated' || event === 'subscription.charged') {
        const subId = paymentEntity?.id as string | undefined;
        if (subId) {
          const start = typeof paymentEntity?.current_start === 'number'
            ? new Date((paymentEntity.current_start as number) * 1000)
            : new Date();
          const end   = typeof paymentEntity?.current_end === 'number'
            ? new Date((paymentEntity.current_end as number) * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

          await prisma.subscriptions.updateMany({
            where: { razorpay_subscription_id: subId },
            data:  { status: 'active', current_period_start: start, current_period_end: end },
          });
          logger.info('Webhook: subscription activated', { subId, event });
        }
      } else if (event === 'payment.captured') {
        const paymentId = paymentEntity?.id as string | undefined;
        if (paymentId) {
          await prisma.payments.updateMany({
            where: { razorpay_payment_id: paymentId },
            data:  { status: 'captured' },
          });
        }
      } else if (event === 'subscription.halted' || event === 'subscription.cancelled') {
        const subId = paymentEntity?.id as string | undefined;
        if (subId) {
          await prisma.subscriptions.updateMany({
            where: { razorpay_subscription_id: subId },
            data:  { status: 'cancelled' },
          });
          logger.info('Webhook: subscription cancelled/halted', { subId, event });
        }
      } else if (event === 'payment.failed') {
        const paymentId = paymentEntity?.id as string | undefined;
        if (paymentId) {
          await prisma.payments.updateMany({
            where: { razorpay_payment_id: paymentId },
            data:  { status: 'failed' },
          });
        }
        logger.warn('Webhook: payment failed', { event });
      }

      // Mark processed
      await prisma.webhook_events.update({
        where: { event_id: eventId },
        data:  { status: 'processed' },
      });
    } catch (err) {
      await prisma.webhook_events.update({
        where: { event_id: eventId },
        data:  { status: 'error' },
      });
      throw err;
    }
  }

  // ─── Get subscription status ─────────────────────────────────────────────────
  static async getSubscriptionStatus(userId: string) {
    const sub = await prisma.subscriptions.findFirst({
      where: { user_id: userId, status: 'active' },
      orderBy: { created_at: 'desc' },
    });
    return sub;
  }
}
