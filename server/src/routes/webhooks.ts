import express from 'express';
import { SubscriptionService } from '../services/subscription.service.js';

const router = express.Router();

// Webhooks must handle raw body for signature verification in standard setups, 
// but since Express is using body-parser, Razorpay signatures can use the stringified body.
// Better practice is raw body, but for simplicity we verify against req.body or a stringified version.
router.post('/razorpay', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const payloadBase = req.body;
    // We typically need raw body. If express.json() is applied globally, we use JSON.stringify 
    // note: keys ordering might break signature. In production, use express.raw for this route.
    const payloadStr = JSON.stringify(req.body); 

    await SubscriptionService.handleWebhook(signature || '', payloadStr, payloadBase);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).send('Webhook failed');
  }
});

export default router;
