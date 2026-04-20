import prisma from '../config/database.js';

/* ─── Level thresholds ─────────────────────────────────────────────────────── */
const LEVELS = [
  { xp: 0,      title: 'Recruit' },
  { xp: 200,    title: 'Awareness Trainee' },
  { xp: 500,    title: 'Security Novice' },
  { xp: 1000,   title: 'Cyber Cadet' },
  { xp: 2000,   title: 'Threat Analyst' },
  { xp: 4000,   title: 'Security Sentinel' },
  { xp: 7000,   title: 'Cyber Guardian' },
  { xp: 11000,  title: 'Digital Defender' },
  { xp: 16000,  title: 'Elite Operator' },
  { xp: 22000,  title: 'Cyber Hero' },
];

export function getLevelForXp(xp: number): { title: string; index: number; nextXp: number | null } {
  let current = LEVELS[0];
  let idx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) { current = LEVELS[i]; idx = i; break; }
  }
  const next = idx < LEVELS.length - 1 ? LEVELS[idx + 1].xp : null;
  return { title: current.title, index: idx, nextXp: next };
}

/* ─── Streak management ───────────────────────────────────────────────────── */
export async function updateStreak(userId: string) {
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) return;

  const now = new Date();
  const last = new Date(user.last_active);

  // Same day → no change
  const sameDay = now.toDateString() === last.toDateString();
  if (sameDay) return;

  // Yesterday → increment streak
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const wasYesterday = yesterday.toDateString() === last.toDateString();

  await prisma.users.update({
    where: { id: userId },
    data: {
      streak: wasYesterday ? user.streak + 1 : 1,
      last_active: now,
    },
  });
}

/* ─── Update user level after XP change ───────────────────────────────────── */
export async function syncLevel(userId: string): Promise<{ leveledUp: boolean; newLevel: string; prevLevel: string }> {
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) return { leveledUp: false, newLevel: '', prevLevel: '' };

  const prev = user.level;
  const { title } = getLevelForXp(user.xp);

  if (title !== prev) {
    await prisma.users.update({ where: { id: userId }, data: { level: title } });
    return { leveledUp: true, newLevel: title, prevLevel: prev };
  }
  return { leveledUp: false, newLevel: title, prevLevel: prev };
}

/* ─── Badge checking ──────────────────────────────────────────────────────── */
const BADGE_DEFS = [
  { name: 'First Blood',       description: 'Complete your first simulation',         check: (stats: any) => stats.total >= 1 },
  { name: 'Sharpshooter',      description: 'Complete 5 simulations correctly',       check: (stats: any) => stats.safe >= 5 },
  { name: 'Veteran',           description: 'Complete 10 simulations',                 check: (stats: any) => stats.total >= 10 },
  { name: 'Speedster',         description: 'Complete a scenario in under 15 seconds', check: (stats: any) => stats.fastestSafe < 15 },
  { name: 'No Crutch',         description: 'Complete 3 scenarios without hints',       check: (stats: any) => stats.noHintWins >= 3 },
  { name: 'Streak Master',     description: 'Reach a 7-day streak',                    check: (stats: any) => stats.streak >= 7 },
  { name: 'Phishing Expert',   description: 'Complete all Phishing Detection modules', check: (stats: any) => stats.byModule['Phishing Detection']?.safe >= 2 },
  { name: 'Social Shield',     description: 'Complete all Social Engineering modules', check: (stats: any) => stats.byModule['Social Engineering']?.safe >= 1 },
];

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) return [];

  const progress = await prisma.user_progress.findMany({
    where: { user_id: userId },
    include: { scenario: true },
  });

  // Compute stats
  const total = progress.length;
  const safe = progress.filter(p => p.result === 'safe').length;
  const fastestSafe = Math.min(...progress.filter(p => p.result === 'safe').map(p => p.time_taken_seconds), 9999);
  const noHintWins = progress.filter(p => p.result === 'safe' && !p.used_hint).length;
  const byModule: Record<string, { total: number; safe: number }> = {};
  for (const p of progress) {
    const mod = p.scenario.module;
    if (!byModule[mod]) byModule[mod] = { total: 0, safe: 0 };
    byModule[mod].total++;
    if (p.result === 'safe') byModule[mod].safe++;
  }

  const stats = { total, safe, fastestSafe, noHintWins, streak: user.streak, byModule };

  // Get existing badges
  const existing = await prisma.user_badges.findMany({
    where: { user_id: userId },
    include: { badge: true },
  });
  const existingNames = new Set(existing.map(b => b.badge.name));

  const newBadges: string[] = [];

  for (const def of BADGE_DEFS) {
    if (existingNames.has(def.name)) continue;
    if (!def.check(stats)) continue;

    // Find or create badge record
    let badge = await prisma.badges.findUnique({ where: { name: def.name } });
    if (!badge) {
      badge = await prisma.badges.create({
        data: { name: def.name, description: def.description, icon: '🏅', criteria_type: 'auto', criteria_value: 0 },
      });
    }

    await prisma.user_badges.create({
      data: { user_id: userId, badge_id: badge.id },
    });
    newBadges.push(def.name);
  }

  return newBadges;
}

export { LEVELS, BADGE_DEFS };
