import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import prisma from '../config/database.js';
import { syncLevel, updateStreak, checkAndAwardBadges, getLevelForXp } from '../services/gamification.service.js';

const router = express.Router();

// ── List scenarios (premium-filtered) ──────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.session.userId },
      include: { subscriptions: { where: { status: 'active' } } },
    });
    const hasPremium = user?.subscriptions && user.subscriptions.length > 0;

    const scenarios = await prisma.scenarios.findMany({
      where: hasPremium ? {} : { is_premium: false },
      select: {
        id: true, module: true, title: true, description: true,
        difficulty: true, is_premium: true, environment_type: true,
      },
      orderBy: [{ module: 'asc' }, { difficulty: 'asc' }],
    });

    // Attach completion status per scenario for this user
    const progress = await prisma.user_progress.findMany({
      where: { user_id: req.session.userId },
      select: { scenario_id: true, result: true },
    });
    const completionMap: Record<string, string> = {};
    for (const p of progress) completionMap[p.scenario_id] = p.result;

    const enriched = scenarios.map(s => ({
      ...s,
      completed: !!completionMap[s.id],
      completionResult: completionMap[s.id] ?? null,
    }));

    res.json({ scenarios: enriched });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scenarios' });
  }
});

// ── Get a single scenario to play ──────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    const scenario = await prisma.scenarios.findUnique({ where: { id } });
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });

    if (scenario.is_premium) {
      const user = await prisma.users.findUnique({
        where: { id: req.session.userId },
        include: { subscriptions: { where: { status: 'active' } } },
      });
      if (!user?.subscriptions?.length) {
        return res.status(403).json({ error: 'Premium subscription required' });
      }
    }

    res.json({ scenario });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load scenario' });
  }
});

// ── Submit scenario outcome ────────────────────────────────────────────────
router.post('/:id/submit', requireAuth, async (req, res) => {
  try {
    const { isSafe, timeTaken, usedHint } = req.body;
    const userId = req.session.userId!;

    const id = req.params.id as string;
    const scenario = await prisma.scenarios.findUnique({ where: { id } });
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });

    const content = scenario.content_json as any;
    let xp = isSafe ? (content.xpReward || 100) : 10;
    const bonuses: string[] = [];

    if (isSafe) {
      if (timeTaken < 30) { xp += 20; bonuses.push('Speed Bonus +20'); }
      if (!usedHint)       { xp += 25; bonuses.push('No Hint +25'); }
    }

    // Update streak + apply streak bonus
    await updateStreak(userId);
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (user && isSafe) {
      if (user.streak >= 7)      { xp += 50; bonuses.push('Streak ×7 +50'); }
      else if (user.streak >= 3) { xp += 25; bonuses.push('Streak ×3 +25'); }
    }

    // Save progress
    await prisma.user_progress.create({
      data: {
        user_id: userId,
        scenario_id: scenario.id,
        result: isSafe ? 'safe' : 'compromised',
        xp_earned: xp,
        time_taken_seconds: timeTaken ?? 0,
        used_hint: usedHint ?? false,
      },
    });

    // Award XP
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { xp: { increment: xp } },
    });

    // Sync level
    const levelResult = await syncLevel(userId);

    // Check badges
    const newBadges = await checkAndAwardBadges(userId);

    // Build level info
    const levelInfo = getLevelForXp(updatedUser.xp);

    res.json({
      xpEarned: xp,
      bonuses,
      newTotalXp: updatedUser.xp,
      level: levelResult.newLevel,
      leveledUp: levelResult.leveledUp,
      prevLevel: levelResult.prevLevel,
      newBadges,
      nextLevelXp: levelInfo.nextXp,
    });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
