import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../config/database.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
  key_secret: process.env.RAZORPAY_SECRET || 'mock_secret'
});

export class SubscriptionService {
  static async createSubscription(userId: string) {
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    // Default premium plan ID - usually from env or DB
    const planId = process.env.RAZORPAY_PLAN_ID || 'plan_mock';

    // Call Razorpay API
    let rzpSub;
    if (process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_mock')) {
      // Mock mode for local dev without keys
      rzpSub = { id: `sub_mock_${Date.now()}` };
    } else {
      rzpSub = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: 12 // 1 year of months
      });
    }

    // Save initial pending subscription
    await prisma.subscriptions.create({
      data: {
        user_id: userId,
        razorpay_subscription_id: rzpSub.id,
        razorpay_plan_id: planId,
        status: 'created',
        current_period_start: new Date(),
        current_period_end: new Date(),
      }
    });

    return { subscription_id: rzpSub.id };
  }

  static async handleWebhook(signature: string, payloadStr: string, payloadBase: any) {
    const secret = process.env.WEBHOOK_SECRET || 'mock_webhook';

    if (secret !== 'mock_webhook') {
      const expectedSignature = crypto.createHmac('sha256', secret)
                                      .update(payloadStr)
                                      .digest('hex');
      
      if (expectedSignature !== signature) {
        throw new Error('Invalid signature');
      }
    }

    const event = payloadBase.event;
    const paymentEntity = payloadBase.payload.subscription?.entity || payloadBase.payload.payment?.entity;

    // Check idempotency
    const existingEvent = await prisma.webhook_events.findUnique({
      where: { event_id: payloadBase.id || `${event}_${Date.now()}` }
    });
    
    if (existingEvent) {
      return; // Already processed
    }

    await prisma.webhook_events.create({
      data: {
        event_id: payloadBase.id || `${event}_${Date.now()}`,
        event_type: event,
        payload: payloadBase,
        status: 'processed'
      }
    });

    if (event === 'subscription.activated' || event === 'subscription.charged') {
      const subId = paymentEntity.id;
      if (subId) {
        await prisma.subscriptions.update({
          where: { razorpay_subscription_id: subId },
          data: {
            status: 'active',
            current_period_start: new Date(paymentEntity.current_start * 1000),
            current_period_end: new Date(paymentEntity.current_end * 1000),
          }
        });
      }
    } else if (event === 'subscription.halted' || event === 'subscription.cancelled') {
        const subId = paymentEntity.id;
        if (subId) {
            await prisma.subscriptions.update({
                where: { razorpay_subscription_id: subId },
                data: {
                  status: 'cancelled',
                }
            });
        }
    }
  }

  static async getSubscriptionStatus(userId: string) {
    const sub = await prisma.subscriptions.findFirst({
        where: { user_id: userId, status: 'active' }
    });
    return sub;
  }
}
