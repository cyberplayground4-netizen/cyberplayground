import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { SkeletonCard } from '../components/common/SkeletonLoader';
import { LockedOverlay } from '../components/common/LockedOverlay';
import { PlayCircle, Lock, Search, AlertCircle, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAppStore } from '../stores/useAppStore';

const ENV_ICONS: Record<string, string> = {
  email: '📧', sms: '📱', phone: '📞', browser: '🌐', wifi: '📶', malware: '💾',
};
const ENV_LABELS: Record<string, string> = {
  email: 'Email', sms: 'SMS', phone: 'Phone', browser: 'Browser', wifi: 'WiFi', malware: 'Malware',
};

const DIFF_LABELS = ['', 'Beginner', 'Intermediate', 'Advanced'];
const DIFF_COLORS = ['', 'var(--neon-green)', 'var(--neon-yellow)', 'var(--neon-red)'];
const DIFF_BG     = ['', 'var(--neon-green-dim)', 'var(--neon-yellow-dim)', 'var(--neon-red-dim)'];

const MODULE_COLORS: Record<string, string> = {
  'Phishing Detection':     'var(--neon-green)',
  'OTP Scam Protection':    'var(--blue-action)',
  'Social Engineering':     'var(--neon-purple)',
  'Fake Website Detection': 'var(--neon-yellow)',
  'Public WiFi Risks':      'var(--neon-cyan)',
  'Malware Downloads':      'var(--neon-red)',
  'Password Security':      'var(--blue-action)',
};

interface Scenario {
  id: string;
  module: string;
  title: string;
  description: string;
  is_premium: boolean;
  environment_type: string;
  difficulty: number;
  xp_reward?: number;
}

export default function SimulationsList() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [filter, setFilter]       = useState('');

  const setSubscription = useAppStore((s) => s.setSubscription);

  interface PlanData {
    isPremium: boolean;
    simulationsUsed: number;
    simulationsLimit: number;
  }
  const [plan, setPlan] = useState<PlanData | null>(null);

  useEffect(() => {
    api.get('/api/scenarios')
      .then(r => {
        setScenarios(r.data.scenarios);
        if (r.data.plan) {
          setPlan(r.data.plan);
          setSubscription({
            plan: r.data.plan.isPremium ? 'premium' : 'free',
            isActive: r.data.plan.isPremium,
            simulationsUsed: r.data.plan.simulationsUsed,
            simulationsLimit: r.data.plan.simulationsLimit,
          });
        }
      })
      .catch(() => setError('Failed to load scenarios'))
      .finally(() => setLoading(false));
  }, [setSubscription]);

  /* ── Skeleton loading ── */
  if (loading) return (
    <div style={{ padding: '40px' }}>
      <div style={{ height: 28, width: 220, background: 'rgba(255,255,255,0.07)', borderRadius: 8, marginBottom: 12 }} />
      <div style={{ height: 16, width: 320, background: 'rgba(255,255,255,0.04)', borderRadius: 8, marginBottom: 48 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );

  if (error) return <div style={{ padding: 40, color: 'var(--neon-red)' }}>{error}</div>;

  /* ── Filter & group ── */
  const filtered = filter
    ? scenarios.filter(s =>
        s.module.toLowerCase().includes(filter.toLowerCase()) ||
        s.title.toLowerCase().includes(filter.toLowerCase())
      )
    : scenarios;

  const grouped = filtered.reduce((acc: Record<string, Scenario[]>, s: Scenario) => {
    if (!acc[s.module]) acc[s.module] = [];
    acc[s.module].push(s);
    return acc;
  }, {});

  return (
    <div style={{ padding: '36px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', marginBottom: 6 }}>Training Modules</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Complete simulations to earn XP and build cyber defence skills.
          </p>
        </div>

        {/* Free plan usage tracker */}
        {plan && !plan.isPremium && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 18px', borderRadius: 12,
            background: plan.simulationsUsed >= plan.simulationsLimit
              ? 'rgba(255,77,77,0.08)' : 'rgba(0,255,171,0.06)',
            border: `1px solid ${plan.simulationsUsed >= plan.simulationsLimit
              ? 'rgba(255,77,77,0.2)' : 'rgba(0,255,171,0.15)'}`,
          }}>
            {plan.simulationsUsed >= plan.simulationsLimit ? (
              <AlertCircle size={16} color="var(--neon-red)" />
            ) : (
              <PlayCircle size={16} color="var(--neon-green)" />
            )}
            <span style={{
              fontSize: '0.82rem', fontWeight: 700,
              color: plan.simulationsUsed >= plan.simulationsLimit
                ? 'var(--neon-red)' : 'var(--text-main)',
            }}>
              {plan.simulationsUsed >= plan.simulationsLimit
                ? 'Free limit reached'
                : `${plan.simulationsUsed}/${plan.simulationsLimit} free simulations used`}
            </span>
            {plan.simulationsUsed >= plan.simulationsLimit && (
              <Link to="/dashboard/pricing" style={{ textDecoration: 'none' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '4px 12px', borderRadius: 99, fontSize: '0.72rem',
                  fontWeight: 800, background: 'var(--neon-purple)',
                  color: '#fff',
                }}>
                  <Crown size={10} /> Upgrade
                </span>
              </Link>
            )}
          </div>
        )}
        {/* Search/filter */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <input
            id="sim-search"
            className="cyber-input"
            style={{ paddingLeft: 38, width: 240, minHeight: 40 }}
            placeholder="Filter by module…"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        </div>
      </div>

      {Object.keys(grouped).length === 0 && (
        <div style={{ color: 'var(--text-muted)', padding: '32px 0' }}>No scenarios match your search.</div>
      )}

      {Object.entries(grouped).map(([module, items]) => {
        const accent = MODULE_COLORS[module] ?? 'var(--neon-green)';
        return (
          <div key={module} style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ height: 18, width: 3, background: accent, borderRadius: 2 }} />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                {module}
              </h2>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 99 }}>
                {items.length} scenario{items.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {items.map((s: Scenario, i: number) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4, transition: { duration: 0.18 } }}
                >
                  {s.is_premium ? (
                    <LockedOverlay upgradeHref="/dashboard/pricing">
                      <ScenarioCard s={s} accent={accent} />
                    </LockedOverlay>
                  ) : (
                    <ScenarioCard s={s} accent={accent} />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ScenarioCard({ s, accent }: { s: Scenario; accent: string }) {
  return (
    <Card style={{ height: '100%', borderTop: `2px solid ${accent}` }}>
      <CardContent style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Tags row */}
        <div style={{ display: 'flex', gap: 7, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '1.1rem' }}>{ENV_ICONS[s.environment_type] ?? '🔐'}</span>
          <span className="badge badge-muted">{ENV_LABELS[s.environment_type] ?? s.environment_type}</span>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, padding: '3px 9px', borderRadius: 99,
            background: DIFF_BG[s.difficulty] ?? 'rgba(255,255,255,0.06)',
            color: DIFF_COLORS[s.difficulty] ?? '#fff',
          }}>
            {DIFF_LABELS[s.difficulty] ?? 'Expert'}
          </span>
          {s.is_premium && (
            <span className="badge badge-purple"><Lock size={9} /> Premium</span>
          )}
          <span className="xp-badge" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>+{s.xp_reward ?? 100} XP</span>
        </div>

        <h3 style={{ fontSize: '0.975rem', fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{s.title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, flexGrow: 1, marginBottom: 18 }}>
          {s.description}
        </p>

        {s.is_premium ? (
          <Link to="/dashboard/pricing">
            <Button variant="outline" size="sm" fullWidth style={{ borderColor: 'var(--neon-purple)', color: 'var(--neon-purple)', gap: 8 }}>
              <Lock size={13} /> Unlock with Premium
            </Button>
          </Link>
        ) : (
          <Link to={`/dashboard/simulations/engine/${s.id}`}>
            <Button variant="primary" size="sm" fullWidth style={{ gap: 8 }}>
              <PlayCircle size={15} /> Start Simulation
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
