import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import prisma from '../config/database.js';
import { getLevelForXp, LEVELS } from '../services/gamification.service.js';

const router = express.Router();

// ── Full user stats ────────────────────────────────────────────────────────
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const progress = await prisma.user_progress.findMany({
      where: { user_id: userId },
      include: { scenario: { select: { module: true, difficulty: true } } },
      orderBy: { completed_at: 'desc' },
    });

    const total = progress.length;
    const safe = progress.filter(p => p.result === 'safe').length;
    const compromised = total - safe;
    const passRate = total > 0 ? Math.round((safe / total) * 100) : 0;
    const totalXpEarned = progress.reduce((sum, p) => sum + p.xp_earned, 0);

    // Per-module breakdown
    const byModule: Record<string, { total: number; safe: number; xp: number }> = {};
    for (const p of progress) {
      const mod = p.scenario.module;
      if (!byModule[mod]) byModule[mod] = { total: 0, safe: 0, xp: 0 };
      byModule[mod].total++;
      if (p.result === 'safe') byModule[mod].safe++;
      byModule[mod].xp += p.xp_earned;
    }

    // Weak vs strong modules
    const moduleStats = Object.entries(byModule).map(([name, data]) => ({
      name,
      total: data.total,
      safe: data.safe,
      passRate: data.total > 0 ? Math.round((data.safe / data.total) * 100) : 0,
      xp: data.xp,
    }));
    const weakModules = moduleStats.filter(m => m.passRate < 60).map(m => m.name);
    const strongModules = moduleStats.filter(m => m.passRate >= 80).map(m => m.name);

    // Level info
    const levelInfo = getLevelForXp(user.xp);

    // Recent activity (last 10)
    const recent = progress.slice(0, 10).map(p => ({
      module: p.scenario.module,
      result: p.result,
      xp: p.xp_earned,
      date: p.completed_at,
    }));

    res.json({
      overview: {
        totalSimulations: total,
        safe,
        compromised,
        passRate,
        totalXp: user.xp,
        totalXpEarned,
        level: user.level,
        levelIndex: levelInfo.index,
        nextLevelXp: levelInfo.nextXp,
        streak: user.streak,
      },
      moduleStats,
      weakModules,
      strongModules,
      recent,
      levels: LEVELS,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

// ── User badges ────────────────────────────────────────────────────────────
router.get('/badges', requireAuth, async (req, res) => {
  try {
    const badges = await prisma.user_badges.findMany({
      where: { user_id: req.session.userId },
      include: { badge: true },
      orderBy: { earned_at: 'desc' },
    });
    res.json({
      badges: badges.map(b => ({
        name: b.badge.name,
        description: b.badge.description,
        icon: b.badge.icon,
        earnedAt: b.earned_at,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load badges' });
  }
});

// ── Adaptive Recommendation: prioritize weak areas ─────────────────────────
router.get('/recommend', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;

    // Get all user progress with module info
    const progress = await prisma.user_progress.findMany({
      where: { user_id: userId },
      include: { scenario: { select: { id: true, module: true } } },
    });
    const doneIds = new Set(progress.map(p => p.scenario_id));

    // Calculate per-module pass rates
    const moduleStats: Record<string, { total: number; safe: number }> = {};
    for (const p of progress) {
      const mod = p.scenario.module;
      if (!moduleStats[mod]) moduleStats[mod] = { total: 0, safe: 0 };
      moduleStats[mod].total++;
      if (p.result === 'safe') moduleStats[mod].safe++;
    }

    // Identify weak modules (pass rate < 60%)
    const weakModules = Object.entries(moduleStats)
      .filter(([, data]) => data.total > 0 && (data.safe / data.total) < 0.6)
      .sort((a, b) => (a[1].safe / a[1].total) - (b[1].safe / b[1].total))
      .map(([name]) => name);

    // Check premium status
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { subscriptions: { where: { status: 'active' } } },
    });
    const hasPremium = user?.subscriptions && user.subscriptions.length > 0;

    // Get all scenarios the user can access
    const all = await prisma.scenarios.findMany({
      where: hasPremium ? {} : { is_premium: false },
      orderBy: { difficulty: 'asc' },
    });

    // Strategy 1: Find unplayed scenarios in weak modules
    if (weakModules.length > 0) {
      for (const weakModule of weakModules) {
        const candidate = all.find(s => s.module === weakModule && !doneIds.has(s.id));
        if (candidate) {
          return res.json({
            recommendation: {
              id: candidate.id,
              title: candidate.title,
              module: candidate.module,
              difficulty: candidate.difficulty,
              reason: `Strengthen your weakest area: ${weakModule}`,
            },
            weakModules,
          });
        }
      }
    }

    // Strategy 2: Find any unplayed scenario
    const next = all.find(s => !doneIds.has(s.id));
    if (next) {
      return res.json({
        recommendation: {
          id: next.id,
          title: next.title,
          module: next.module,
          difficulty: next.difficulty,
          reason: 'Explore a new scenario',
        },
        weakModules,
      });
    }

    // Strategy 3: All done — suggest replaying the worst-performing scenario
    const worstResult = progress
      .filter(p => p.result === 'compromised')
      .sort((a, b) => a.xp_earned - b.xp_earned)[0];

    if (worstResult) {
      const replayScenario = all.find(s => s.id === worstResult.scenario_id);
      if (replayScenario) {
        return res.json({
          recommendation: {
            id: replayScenario.id,
            title: replayScenario.title,
            module: replayScenario.module,
            difficulty: replayScenario.difficulty,
            reason: 'Retry a scenario you previously failed',
            isReplay: true,
          },
          weakModules,
        });
      }
    }

    res.json({
      recommendation: null,
      message: 'Congratulations! You\'ve mastered all available scenarios.',
      weakModules,
    });
  } catch (error) {
    console.error('[Recommend Error]', error);
    res.status(500).json({ error: 'Failed to generate recommendation' });
  }
});

export default router;
