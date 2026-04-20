import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { SkeletonCard, SkeletonStat } from '../components/common/SkeletonLoader';
import { Award, TrendingUp, Target, Zap, AlertTriangle, ChevronRight, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const BADGE_COLORS: Record<string, string> = {
  'First Blood':       'var(--neon-red)',
  'Streak Master':     'var(--neon-yellow)',
  'Phishing Expert':   'var(--neon-green)',
  'Social Defender':   'var(--neon-purple)',
  'Speed Demon':       'var(--blue-action)',
};
const BADGE_BG: Record<string, string> = {
  'First Blood':       'rgba(255,77,77,0.1)',
  'Streak Master':     'rgba(255,214,10,0.1)',
  'Phishing Expert':   'rgba(0,255,171,0.1)',
  'Social Defender':   'rgba(155,89,255,0.1)',
  'Speed Demon':       'rgba(59,130,246,0.1)',
};

export default function ProgressPage() {
  const [stats, setStats]   = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/progress/stats'),
      api.get('/api/progress/badges'),
    ]).then(([sRes, bRes]) => {
      setStats(sRes.data);
      setBadges(bRes.data.badges);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ── Skeleton loading ── */
  if (loading) return (
    <div style={{ padding: '36px 40px' }}>
      <div style={{ height: 28, width: 200, background: 'rgba(255,255,255,0.07)', borderRadius: 8, marginBottom: 32 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[...Array(4)].map((_, i) => <SkeletonStat key={i} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );

  if (!stats) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>No data available yet.</div>;

  const o = stats.overview;
  const levelXp    = stats.levels[o.levelIndex]?.xp ?? 0;
  const nextLevelXp = o.nextLevelXp ?? levelXp + 500;
  const progressPct = o.nextLevelXp
    ? Math.round(((o.totalXp - levelXp) / (nextLevelXp - levelXp)) * 100)
    : 100;

  return (
    <div style={{ padding: '36px 40px' }}>
      <h1 style={{ fontSize: '1.9rem', marginBottom: 6 }}>Training Progress</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Your performance analytics and achievements.</p>

      {/* ── Stat row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { icon: <Target size={18} />,    label: 'Simulations', value: o.totalSimulations, color: 'var(--neon-cyan)' },
          { icon: <TrendingUp size={18} />, label: 'Pass Rate',   value: `${o.passRate}%`,   color: o.passRate >= 70 ? 'var(--neon-green)' : 'var(--neon-red)' },
          { icon: <Zap size={18} />,        label: 'Total XP',    value: o.totalXp.toLocaleString(), color: 'var(--neon-green)' },
          { icon: <Award size={18} />,      label: 'Streak',      value: `${o.streak} days`, color: 'var(--neon-yellow)' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card>
              <CardContent style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  padding: 10, borderRadius: 10,
                  background: s.color.replace(')', ',0.12)').replace('var(--neon-green)', 'rgba(0,255,171').replace('var(--neon-red)', 'rgba(255,77,77').replace('var(--neon-cyan)', 'rgba(0,229,255').replace('var(--neon-yellow)', 'rgba(255,214,10').replace('var(--blue-action)', 'rgba(59,130,246'),
                  color: s.color, display: 'flex',
                }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }} className="two-col-grid">
        {/* Level progress card */}
        <Card>
          <CardContent style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Level Progress</h3>
              <span style={{ color: 'var(--neon-purple)', fontWeight: 700, fontSize: '0.85rem' }}>{o.level}</span>
            </div>
            <ProgressBar
              value={progressPct}
              max={100}
              label={`${o.totalXp} XP`}
              sublabel={o.nextLevelXp ? `${o.nextLevelXp} XP` : 'MAX'}
              height={10}
            />
            <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {stats.levels.map((lvl: any, i: number) => (
                <span key={i} style={{
                  padding: '3px 10px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 600,
                  background: i <= o.levelIndex ? 'var(--neon-purple-dim)' : 'rgba(255,255,255,0.04)',
                  color: i <= o.levelIndex ? 'var(--neon-purple)' : 'var(--text-muted)',
                  border: i === o.levelIndex ? '1px solid var(--neon-purple)' : '1px solid transparent',
                }}>
                  {lvl.title}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Badges card */}
        <Card>
          <CardContent style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 700 }}>Badges ({badges.length})</h3>
            {badges.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '28px 0' }}>
                <Trophy size={40} style={{ opacity: 0.25, marginBottom: 10 }} />
                <div style={{ fontSize: '0.875rem' }}>Complete simulations to earn your first badge!</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
                {badges.map((b, i) => (
                  <motion.div
                    key={b.name}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.07, type: 'spring', stiffness: 280 }}
                    style={{
                      background: BADGE_BG[b.name] ?? 'rgba(255,232,0,0.06)',
                      border: `1px solid ${(BADGE_COLORS[b.name] ?? 'var(--neon-yellow)').replace(')', ',0.25)').replace('var(', 'rgba(').replace('--neon-green', '0,255,171').replace('--neon-purple', '155,89,255').replace('--neon-red', '255,77,77').replace('--neon-yellow', '255,214,10').replace('--blue-action', '59,130,246')}`,
                      borderRadius: 14, padding: '14px 10px', textAlign: 'center',
                      boxShadow: `0 0 12px ${(BADGE_COLORS[b.name] ?? 'rgba(255,232,0,0.2)')}30`,
                    }}
                  >
                    <div style={{ fontSize: '1.75rem', marginBottom: 6 }}>🏅</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: BADGE_COLORS[b.name] ?? 'var(--neon-yellow)', marginBottom: 3, lineHeight: 1.3 }}>{b.name}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{b.description}</div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Module performance */}
      <Card style={{ marginBottom: 24 }}>
        <CardContent style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 700 }}>Module Performance</h3>
          {stats.moduleStats.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Play some scenarios first to see your performance breakdown.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {stats.moduleStats.map((mod: any) => (
                <div key={mod.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{mod.name}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: mod.passRate >= 80 ? 'var(--neon-green)' : mod.passRate >= 50 ? 'var(--neon-yellow)' : 'var(--neon-red)' }}>
                      {mod.passRate}% · {mod.safe}/{mod.total}
                    </span>
                  </div>
                  <ProgressBar
                    value={mod.passRate}
                    max={100}
                    showLabel={false}
                    height={7}
                    color={mod.passRate >= 80 ? 'green' : mod.passRate >= 50 ? 'yellow' : 'red'}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weak areas */}
      {stats.weakModules.length > 0 && (
        <Card style={{ borderLeft: '3px solid var(--neon-red)', marginBottom: 24 }}>
          <CardContent style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <AlertTriangle size={22} color="var(--neon-red)" style={{ flexShrink: 0 }} />
            <div style={{ flexGrow: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Areas for Improvement</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Pass rate below 60% in: <strong style={{ color: 'var(--text-main)' }}>{stats.weakModules.join(', ')}</strong>
              </div>
            </div>
            <Link to="/dashboard/simulations">
              <Button variant="primary" size="sm">Practice Now <ChevronRight size={14} /></Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Recent activity */}
      {stats.recent.length > 0 && (
        <Card>
          <CardContent style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 700 }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.recent.map((r: any, i: number) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px',
                  borderRadius: 8, background: 'rgba(255,255,255,0.02)',
                  borderBottom: i < stats.recent.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: r.result === 'safe' ? 'var(--neon-green)' : 'var(--neon-red)' }} />
                  <div style={{ flexGrow: 1, fontSize: '0.85rem' }}>{r.module}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: r.result === 'safe' ? 'var(--neon-green)' : 'var(--neon-red)' }}>
                    {r.result === 'safe' ? 'Passed' : 'Failed'}
                  </div>
                  <span className="xp-badge" style={{ fontSize: '0.68rem' }}>+{r.xp} XP</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
