import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import prisma from '../config/database.js';

const router = express.Router();

// Get today's daily challenge
router.get('/today', requireAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const challenge = await prisma.daily_challenges.findFirst({
      where: {
        challenge_date: { gte: today, lt: tomorrow },
      },
      include: {
        scenario: {
          select: {
            id: true,
            title: true,
            module: true,
            difficulty: true,
            environment_type: true,
          },
        },
      },
    });

    if (!challenge) return res.json({ challenge: null });

    // Check if user already completed it today
    const alreadyDone = await prisma.user_progress.findFirst({
      where: {
        user_id: req.session.userId,
        scenario_id: challenge.scenario_id,
        completed_at: { gte: today, lt: tomorrow },
      },
    });

    res.json({
      challenge: {
        id: challenge.id,
        scenario: challenge.scenario,
        bonusXp: challenge.bonus_xp,
        alreadyCompleted: !!alreadyDone,
        expiresAt: tomorrow.toISOString(),
      },
    });
  } catch (error) {
    console.error('Daily challenge error:', error);
    res.status(500).json({ error: 'Failed to load daily challenge' });
  }
});

export default router;
