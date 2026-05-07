import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { Card, CardContent } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';
import {
  LogOut, LayoutDashboard, User, Shield, Zap, Crown,
  BarChart3, Award, ChevronRight, PlayCircle, Menu, X, Flame,
} from 'lucide-react';
import { Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SimulationsList from './SimulationsList';
import SimulationEngine from '../components/simulation/SimulationEngine';
import PricingPage from './PricingPage';
import ProgressPage from './ProgressPage';
import CertificatePage from './CertificatePage';
import { DailyChallengeWidget } from '../components/gamification/DailyChallengeWidget';
import { getXpProgressPercent, getLevelForXp } from '../stores/useAppStore';
import api from '../services/api';



interface UserActivity {
  result: 'safe' | 'danger';
  module: string;
  xp: number;
}

interface DashboardStats {
  overview: { passRate: number };
  recent: UserActivity[];
}

interface RecommendedScenario {
  id: string;
  title: string;
  module: string;
  difficulty: number;
}

interface UserData {
  name: string;
  email: string;
  level: string;
  xp: number;
  streak: number;
}

const navLinkStyle = (isActive: boolean) => ({
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '10px 14px', borderRadius: '10px',
  color: isActive ? 'var(--neon-green)' : 'var(--text-muted)',
  background: isActive ? 'var(--neon-green-dim)' : 'transparent',
  fontWeight: isActive ? 700 : 500,
  transition: 'all 0.18s ease', textDecoration: 'none',
  fontSize: '0.875rem', border: 'none', cursor: 'pointer',
  fontFamily: 'var(--font-heading)',
});

function Sidebar({ sidebarOpen, setSidebarOpen, user, handleLogout }: { sidebarOpen: boolean, setSidebarOpen: (open: boolean) => void, user: UserData | null, handleLogout: () => void }) {
  return (
    <aside className={`dashboard-sidebar${sidebarOpen ? ' open' : ''}`} style={{
      width: 'var(--sidebar-width)', flexShrink: 0, background: 'var(--bg-panel)',
      borderRight: '1px solid rgba(255,255,255,0.04)',
      padding: '20px 14px', display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#fff' }}>
          <Shield color="var(--neon-green)" size={20} />
          <span style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>CyberPlayground</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
          className="sidebar-close-btn"
        >
          <X size={18} />
        </button>
      </div>

      <div className="section-label" style={{ marginBottom: 8 }}>Training</div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 24 }}>
        <NavLink to="/dashboard" end style={({ isActive }) => navLinkStyle(isActive)} onClick={() => setSidebarOpen(false)}>
          <LayoutDashboard size={16} /> Overview
        </NavLink>
        <NavLink to="/dashboard/simulations" style={({ isActive }) => navLinkStyle(isActive)} onClick={() => setSidebarOpen(false)}>
          <Zap size={16} /> Simulations
        </NavLink>
        <NavLink to="/dashboard/progress" style={({ isActive }) => navLinkStyle(isActive)} onClick={() => setSidebarOpen(false)}>
          <BarChart3 size={16} /> Progress
        </NavLink>
        <NavLink to="/dashboard/certificates" style={({ isActive }) => navLinkStyle(isActive)} onClick={() => setSidebarOpen(false)}>
          <Award size={16} /> Certificates
        </NavLink>
      </nav>

      <div className="section-label" style={{ marginBottom: 8 }}>Account</div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
        <NavLink to="/dashboard/profile" style={({ isActive }) => navLinkStyle(isActive)} onClick={() => setSidebarOpen(false)}>
          <User size={16} /> Profile
        </NavLink>
        <NavLink
          to="/dashboard/pricing"
          style={({ isActive }) => ({
            ...navLinkStyle(isActive),
            color: 'var(--neon-purple)',
            background: isActive ? 'var(--neon-purple-dim)' : 'transparent',
          })}
          onClick={() => setSidebarOpen(false)}
        >
          <Crown size={16} /> Upgrade
        </NavLink>
      </nav>

      {/* User card + XP bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 14 }}>
        <div style={{
          padding: '12px', background: 'var(--bg-card)', borderRadius: 12,
          marginBottom: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: 'var(--neon-green-dim)', border: '1.5px solid rgba(0,255,171,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, color: 'var(--neon-green)', fontSize: '0.85rem',
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden', flexGrow: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                {user?.level}
                {(user?.streak ?? 0) > 0 && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 2,
                    background: 'rgba(255,214,10,0.12)', color: 'var(--neon-yellow)',
                    padding: '1px 6px', borderRadius: 99, fontSize: '0.6rem', fontWeight: 700,
                  }}>
                    <Flame size={8} /> {user?.streak}d
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* XP mini progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>XP Progress</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--neon-green)', fontWeight: 700 }}>{user?.xp ?? 0} XP</span>
            </div>
            <div className="progress-track" style={{ height: 4 }}>
              <div className="progress-fill" style={{ width: `${getXpProgressPercent(user?.xp ?? 0)}%`, height: '100%' }} />
            </div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
          color: 'var(--text-muted)', cursor: 'pointer', padding: '6px 12px', width: '100%',
          borderRadius: 8, fontSize: '0.8rem', fontFamily: 'var(--font-body)', transition: 'all 0.15s',
        }}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      {/* Sidebar backdrop (mobile) */}
      <div
        className={`sidebar-backdrop${sidebarOpen ? ' active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} handleLogout={handleLogout} />

      {/* ── Main Content ── */}
      <main className="dashboard-main" style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Mobile top bar */}
        <div className="mobile-topbar" style={{ display: 'none' }}>
          <button
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Open sidebar"
            style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: 4 }}
          >
            <Menu size={22} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield color="var(--neon-green)" size={18} />
            <span style={{ fontWeight: 800, fontFamily: 'var(--font-heading)', fontSize: '0.95rem' }}>CyberPlayground</span>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'var(--neon-green-dim)', color: 'var(--neon-green)',
            padding: '4px 10px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 800,
          }}>
            <Zap size={11} /> {user?.xp ?? 0} XP
          </span>
        </div>

        <Routes>
          <Route path="/" element={<OverviewTab user={user} />} />
          <Route path="/simulations" element={<SimulationsList />} />
          <Route path="/simulations/engine/:id" element={<SimulationEngine />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/certificates" element={<CertificatePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/profile" element={<ProfileTab user={user} />} />
        </Routes>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Overview Tab                                                              */
/* ═══════════════════════════════════════════════════════════════════════════ */
function OverviewTab({ user }: { user: UserData | null }) {
  const [rec, setRec]     = useState<RecommendedScenario | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [counts, setCounts] = useState({ level: 0, xp: 0, streak: 0, pass: 0 });

  useEffect(() => {
    api.get('/api/progress/recommend').then(r => setRec(r.data.recommendation)).catch(() => {});
    api.get('/api/progress/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  /* ── Count-up animation ── */
  const countRef = useRef(false);
  useEffect(() => {
    if (countRef.current || !user) return;
    countRef.current = true;
    const targets = {
      level: parseInt(user?.level?.replace(/\D/g, '') || '1') || 1,
      xp: user?.xp ?? 0,
      streak: user?.streak ?? 0,
      pass: 0,
    };
    const duration = 900;
    const steps = 30;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const pct = Math.min(step / steps, 1);
      setCounts({
        level:  Math.round(targets.level   * pct),
        xp:     Math.round(targets.xp      * pct),
        streak: Math.round(targets.streak  * pct),
        pass:   0,
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [user]);

  const o = stats?.overview;
  const xpPct = getXpProgressPercent(user?.xp ?? 0);

  return (
    <div className="dashboard-content" style={{ padding: '36px 40px', flexGrow: 1 }}>
      {/* Hero welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(0,255,171,0.07) 0%, rgba(59,130,246,0.06) 100%)',
          border: '1px solid rgba(0,255,171,0.12)',
          borderRadius: 20, padding: '28px 32px', marginBottom: 28,
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: '-30%', right: '-5%', width: 200, height: 200, background: 'radial-gradient(circle, rgba(0,255,171,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--neon-green)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              Welcome Back
            </div>
            <h1 style={{ fontSize: '1.75rem', margin: '0 0 4px', fontFamily: 'var(--font-heading)' }}>
              {user?.name ?? 'Agent'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)', fontSize: '0.875rem', flexWrap: 'wrap' }}>
              <span style={{
                background: 'var(--neon-purple-dim)', color: 'var(--neon-purple)',
                padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
              }}>
                {user?.level ?? 'Recruit'}
              </span>
              {(user?.streak ?? 0) > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Flame size={15} color="var(--neon-yellow)" />
                  <span style={{ color: 'var(--neon-yellow)', fontWeight: 700 }}>{user?.streak}d streak</span>
                </span>
              )}
            </div>
          </div>
          <Link to="/dashboard/simulations">
            <Button variant="primary" size="md">
              <PlayCircle size={16} /> Continue Training
            </Button>
          </Link>
        </div>

        {/* XP progress bar */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>XP Progress to next level</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--neon-green)', fontWeight: 700 }}>{user?.xp ?? 0} XP · {xpPct}%</span>
          </div>
          <ProgressBar value={xpPct} max={100} showLabel={false} height={8} />
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="overview-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Level', val: user?.level ?? '—', accent: 'var(--neon-purple)', num: counts.level },
          { label: 'Total XP', val: `${counts.xp}`, accent: 'var(--neon-green)', num: counts.xp },
          { label: 'Streak', val: `${counts.streak}d`, accent: 'var(--neon-yellow)', num: counts.streak },
          { label: 'Pass Rate', val: o ? `${o.passRate}%` : '—', accent: o && o.passRate >= 70 ? 'var(--neon-green)' : 'var(--neon-yellow)', num: 0 },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
            <Card>
              <CardContent style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: s.accent, fontFamily: 'var(--font-heading)' }}>{s.val}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Daily Challenge */}
      <DailyChallengeWidget />

      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }} className="two-col-grid">
        {/* Recommended scenario */}
        <Card style={{ borderLeft: '3px solid var(--neon-green)' }}>
          <CardContent style={{ padding: 24 }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--neon-green)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              ✦ Recommended Next
            </div>
            {rec ? (
              <>
                <h3 style={{ fontSize: '1.05rem', marginBottom: 8 }}>{rec.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>{rec.module} · Level {rec.difficulty}</p>
                <Link to={`/dashboard/simulations/engine/${rec.id}`}>
                  <Button variant="primary" size="sm">
                    <PlayCircle size={14} /> Start Now
                  </Button>
                </Link>
              </>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>All free scenarios completed! 🎉 Upgrade for more.</p>
            )}
          </CardContent>
        </Card>

        {/* Quick links */}
        <Card>
          <CardContent style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Quick Access</div>
            {[
              { to: '/dashboard/simulations', icon: <Zap size={16} color="var(--neon-green)" />, label: 'All Simulations' },
              { to: '/dashboard/progress',    icon: <BarChart3 size={16} color="var(--neon-purple)" />, label: 'View Progress' },
              { to: '/dashboard/certificates',icon: <Award size={16} color="var(--neon-yellow)" />, label: 'Certificates' },
            ].map(l => (
              <Link key={l.to} to={l.to} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                color: 'var(--text-main)', textDecoration: 'none', transition: 'all 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{l.icon} {l.label}</span>
                <ChevronRight size={16} color="var(--text-muted)" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      {(stats?.recent?.length ?? 0) > 0 && (
        <Card>
          <CardContent style={{ padding: 24 }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Recent Activity</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {stats!.recent.slice(0, 5).map((r: UserActivity, i: number) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px',
                  borderRadius: 8, background: 'rgba(255,255,255,0.02)',
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: r.result === 'safe' ? 'var(--neon-green)' : 'var(--neon-red)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem', flexGrow: 1 }}>{r.module}</span>
                  <span style={{ fontSize: '0.72rem', color: r.result === 'safe' ? 'var(--neon-green)' : 'var(--neon-red)', fontWeight: 700 }}>
                    {r.result === 'safe' ? 'Pass' : 'Fail'}
                  </span>
                  <span className="xp-badge" style={{ fontSize: '0.7rem' }}>+{r.xp} XP</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ─── Profile tab ──────────────────────────────────────────────────────────── */
function ProfileTab({ user }: { user: UserData | null }) {
  const xpPct = getXpProgressPercent(user?.xp ?? 0);
  const nextXp = getLevelForXp(user?.xp ?? 0).nextXp ?? 'MAX';
  return (
    <div className="dashboard-content" style={{ padding: '36px 40px' }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: 28 }}>My Profile</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, maxWidth: 800 }} className="two-col-grid">
        {/* Avatar card */}
        <Card>
          <CardContent style={{ padding: 28, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--neon-green-dim)',
              border: '2px solid rgba(0,255,171,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.2rem', fontWeight: 900, color: 'var(--neon-green)',
              boxShadow: '0 0 24px rgba(0,255,171,0.15)',
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>{user?.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{user?.email}</div>
            </div>
            <span style={{
              background: 'var(--neon-purple-dim)', color: 'var(--neon-purple)',
              padding: '4px 14px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700,
              border: '1px solid rgba(155,89,255,0.25)',
            }}>
              {user?.level ?? 'Recruit'}
            </span>
          </CardContent>
        </Card>

        {/* Stats card */}
        <Card>
          <CardContent style={{ padding: 28 }}>
            <div style={{ display: 'flex', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
              {[
                { label: 'Total XP', value: `${user?.xp ?? 0}`, color: 'var(--neon-green)' },
                { label: 'Streak',   value: `${user?.streak ?? 0}d`, color: 'var(--neon-yellow)' },
                { label: 'Level',    value: user?.level ?? '—', color: 'var(--neon-purple)' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12, padding: '14px 20px', flexGrow: 1, textAlign: 'center',
                }}>
                  <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.25rem', color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>XP Progress</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--neon-green)', fontWeight: 700 }}>{xpPct}%</span>
              </div>
              <ProgressBar value={xpPct} max={100} showLabel={false} height={10} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>{user?.xp ?? 0} XP</span>
                <span>{nextXp} XP</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
