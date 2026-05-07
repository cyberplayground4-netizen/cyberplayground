import { create } from 'zustand';

/* ── Types ── */

export interface UserData {
  id: string;
  name: string;
  email: string;
  level: string;
  xp: number;
  streak: number;
}

export interface SubscriptionInfo {
  isActive: boolean;
  plan: 'free' | 'premium';
  simulationsUsed: number;
  simulationsLimit: number;
}

export interface SimulationProgress {
  scenarioId: string;
  result: 'safe' | 'compromised';
  xpEarned: number;
  choiceId: string;
  timeTaken: number;
  usedHint: boolean;
}

/* ── Level thresholds — must match server ── */
export const LEVELS = [
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

export function getLevelForXp(xp: number) {
  let current = LEVELS[0];
  let idx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) { current = LEVELS[i]; idx = i; break; }
  }
  const next = idx < LEVELS.length - 1 ? LEVELS[idx + 1].xp : null;
  return { title: current.title, index: idx, currentXp: current.xp, nextXp: next };
}

export function getXpProgressPercent(xp: number): number {
  const info = getLevelForXp(xp);
  if (info.nextXp === null) return 100; // Max level
  const range = info.nextXp - info.currentXp;
  const progress = xp - info.currentXp;
  return Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
}

/* ── Store ── */

interface AppState {
  /* Subscription */
  subscription: SubscriptionInfo;
  setSubscription: (sub: Partial<SubscriptionInfo>) => void;

  /* Last simulation result — for replay */
  lastSimulation: SimulationProgress | null;
  setLastSimulation: (sim: SimulationProgress | null) => void;

  /* Free plan tracking */
  incrementUsage: () => void;
  canPlaySimulation: () => boolean;

  /* Hydration flag */
  isHydrated: boolean;
  setHydrated: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  subscription: {
    isActive: false,
    plan: 'free',
    simulationsUsed: 0,
    simulationsLimit: 3,
  },
  setSubscription: (sub) =>
    set((s) => ({ subscription: { ...s.subscription, ...sub } })),

  lastSimulation: null,
  setLastSimulation: (sim) => set({ lastSimulation: sim }),

  incrementUsage: () =>
    set((s) => ({
      subscription: {
        ...s.subscription,
        simulationsUsed: s.subscription.simulationsUsed + 1,
      },
    })),

  canPlaySimulation: () => {
    const { subscription } = get();
    if (subscription.plan === 'premium' || subscription.isActive) return true;
    return subscription.simulationsUsed < subscription.simulationsLimit;
  },

  isHydrated: false,
  setHydrated: (v) => set({ isHydrated: v }),
}));
