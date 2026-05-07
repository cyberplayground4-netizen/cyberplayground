import express from 'express';
import { SubscriptionService } from '../services/subscription.service.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Webhook route consumes raw body (configured in index.ts before json middleware).
// Razorpay sends an HMAC-SHA256 signature in the X-Razorpay-Signature header.
router.post('/razorpay', async (req, res) => {
  try {
    const signature  = req.headers['x-razorpay-signature'] as string | undefined;
    const rawBody    = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(JSON.stringify(req.body));
    const payloadStr = rawBody.toString('utf8');
    const payload    = JSON.parse(payloadStr) as Record<string, unknown>;

    if (!signature) {
      logger.warn('Webhook received without signature header');
      return res.status(400).send('Missing signature');
    }

    await SubscriptionService.handleWebhook(signature, payloadStr, payload);

    res.status(200).send('OK');
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown webhook error';
    logger.error('Webhook processing failed', { error: msg });

    // Return 400 for signature errors (Razorpay will not retry), 500 for others
    const status = msg.includes('signature') ? 400 : 500;
    res.status(status).send(msg.includes('signature') ? 'Invalid signature' : 'Webhook failed');
  }
});

export default router;
