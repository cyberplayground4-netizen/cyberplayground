import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { SubscriptionService } from '../services/subscription.service.js';

const router = express.Router();

router.post('/create', requireAuth, async (req, res) => {
  try {
    const result = await SubscriptionService.createSubscription(req.session.userId!);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

router.get('/status', requireAuth, async (req, res) => {
  try {
    const sub = await SubscriptionService.getSubscriptionStatus(req.session.userId!);
    res.json({ isActive: !!sub, subscription: sub });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check status' });
  }
});

export default router;
