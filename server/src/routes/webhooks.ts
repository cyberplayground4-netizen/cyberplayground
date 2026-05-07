import express from 'express';
import { SubscriptionService } from '../services/subscription.service.js';

const router = express.Router();

// Webhook route uses raw body (configured in index.ts before json middleware).
// This ensures signature verification uses the exact bytes received from Razorpay.
router.post('/razorpay', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    
    // req.body is a Buffer since we use express.raw() for this route in index.ts
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    const payloadStr = rawBody.toString('utf8');
    const payloadBase = JSON.parse(payloadStr);

    await SubscriptionService.handleWebhook(signature || '', payloadStr, payloadBase);
    res.status(200).send('OK');
  } catch (error) {
    console.error('[Webhook Error]', error instanceof Error ? error.message : error);
    res.status(500).send('Webhook failed');
  }
});

export default router;
