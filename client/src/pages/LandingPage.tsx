import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ShieldAlert, Crosshair, Trophy, Zap, Lock, BrainCircuit, Users, Star, Award, ChevronRight, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const modules = [
  { icon: '📧', label: 'Phishing Detection',  desc: 'Spot fake emails before you click',       color: 'var(--neon-green)',  border: 'rgba(0,255,171,0.25)' },
  { icon: '📱', label: 'OTP Scam Protection', desc: 'Never be tricked into sharing OTPs',      color: 'var(--blue-action)', border: 'rgba(59,130,246,0.25)' },
  { icon: '📞', label: 'Social Engineering',  desc: 'Detect manipulation over voice calls',    color: 'var(--neon-purple)', border: 'rgba(155,89,255,0.25)' },
  { icon: '🌐', label: 'Fake Website',        desc: 'Identify lookalike & spoofed domains',    color: 'var(--neon-yellow)', border: 'rgba(255,214,10,0.25)' },
  { icon: '📶', label: 'Public WiFi Risks',   desc: 'Stay safe on open networks',              color: 'var(--neon-cyan)',   border: 'rgba(0,229,255,0.25)' },
  { icon: '💾', label: 'Malware Downloads',   desc: 'Avoid trojanised software traps',         color: 'var(--neon-red)',    border: 'rgba(255,77,77,0.25)' },
];

const stats = [
  { value: '10K+', label: 'Agents Trained' },
  { value: '98%',  label: 'Report Improved Awareness' },
  { value: '6',    label: 'Attack Categories' },
  { value: '20+',  label: 'Real-world Scenarios' },
];

export default function LandingPage() {
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)' }}>

      {/* ── Nav ── */}
      <nav className="landing-nav" style={{
        padding: '18px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'sticky', top: 0, background: 'rgba(8,11,18,0.92)', backdropFilter: 'blur(14px)', zIndex: 50,
      }}>
        <div className="landing-nav-brand" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <ShieldAlert color="var(--neon-green)" size={22} />
          <span style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, letterSpacing: '-0.01em' }}>
            CyberPlayground
          </span>
        </div>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }} className="desktop-nav-actions">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">Start Free</Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          id="mobile-menu-toggle"
          onClick={() => setMobileNav(v => !v)}
          aria-label="Toggle menu"
          style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: 4 }}
          className="mobile-hamburger"
        >
          {mobileNav ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile nav drawer */}
      {mobileNav && (
        <div style={{
          position: 'fixed', top: 60, left: 0, right: 0, zIndex: 49,
          background: 'var(--bg-panel)', borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <Link to="/login" onClick={() => setMobileNav(false)}>
            <Button variant="ghost" size="md" fullWidth>Sign In</Button>
          </Link>
          <Link to="/register" onClick={() => setMobileNav(false)}>
            <Button variant="primary" size="md" fullWidth>Start Free — It's Free</Button>
          </Link>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="hero-section" style={{ textAlign: 'center', padding: '100px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '15%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(0,255,171,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', right: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 18px', background: 'var(--neon-green-dim)', color: 'var(--neon-green)',
            borderRadius: 99, fontWeight: 700, fontSize: '0.78rem', marginBottom: 30,
            border: '1px solid rgba(0,255,171,0.25)', letterSpacing: '0.06em',
          }}>
            <Zap size={13} /> GAMIFIED CYBERSECURITY TRAINING · FREE TO START
          </div>

          <h1 className="hero-h1" style={{
            fontSize: 'clamp(2.8rem, 7vw, 5rem)', lineHeight: 1.05,
            marginBottom: 24, maxWidth: 860, margin: '0 auto 24px',
          }}>
            Experience Real Cyberattacks.{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--neon-green), var(--neon-cyan))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Without the Risk.
            </span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.75 }}>
            Realistic simulations of phishing, social engineering, and malware attacks. Make mistakes safely. Build unbreakable cyber habits.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register">
              <Button size="lg" variant="primary">
                <Zap size={18} /> Play For Free
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">Sign In</Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Stats strip ── */}
      <section style={{ padding: '0 24px 64px' }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2,
          background: 'rgba(255,255,255,0.03)', borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}>
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              style={{
                padding: '28px 20px', textAlign: 'center',
                borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--neon-green)', lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 6 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Feature pills ── */}
      <section style={{ display: 'flex', justifyContent: 'center', gap: 24, padding: '0 24px 60px', flexWrap: 'wrap' }}>
        {[
          { icon: <Crosshair size={16} color="var(--neon-red)" />,    label: 'Realistic attack simulations' },
          { icon: <BrainCircuit size={16} color="var(--neon-purple)" />, label: 'Adaptive difficulty' },
          { icon: <Trophy size={16} color="var(--neon-yellow)" />,    label: 'XP, levels & badges' },
          { icon: <Lock size={16} color="var(--neon-green)" />,       label: 'No real risk to your data' },
          { icon: <Users size={16} color="var(--blue-action)" />,     label: '10K+ agents trained' },
          { icon: <Star size={16} color="var(--neon-cyan)" />,        label: 'Earn certificates' },
        ].map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {f.icon} {f.label}
          </div>
        ))}
      </section>

      {/* ── Training Modules grid ── */}
      <section style={{ padding: '0 24px 80px', maxWidth: 1120, margin: '0 auto', width: '100%' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: 8 }}>Training Modules</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 52, fontSize: '1rem' }}>
            6 attack categories. Interactive environments. Real consequences.
          </p>
        </motion.div>

        <div className="module-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {modules.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div style={{
                background: 'var(--bg-card)', borderRadius: 16,
                padding: '24px 22px',
                border: `1px solid rgba(255,255,255,0.06)`,
                borderTop: `3px solid ${m.color}`,
                display: 'flex', gap: 18, alignItems: 'flex-start',
                transition: 'box-shadow 0.2s ease',
                height: '100%',
              }}>
                <div style={{
                  fontSize: '1.8rem', lineHeight: 1, width: 48, height: 48, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `rgba(0,0,0,0.2)`, borderRadius: 12,
                  border: `1px solid ${m.border}`,
                }}>
                  {m.icon}
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6, color: 'var(--text-main)' }}>
                    {m.label}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: 14 }}>
                    {m.desc}
                  </div>
                  <Link to="/register" style={{
                    fontSize: '0.78rem', fontWeight: 700, color: m.color,
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}>
                    Start Free <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section style={{
        margin: '0 24px 80px', borderRadius: 24, padding: '64px 32px',
        background: 'linear-gradient(135deg, rgba(0,255,171,0.07) 0%, rgba(59,130,246,0.07) 50%, rgba(155,89,255,0.07) 100%)',
        border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-40%', left: '50%', transform: 'translateX(-50%)', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,255,171,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Award size={40} color="var(--neon-green)" style={{ marginBottom: 16, opacity: 0.9 }} />
        <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', marginBottom: 12 }}>Ready to test your instincts?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 36, fontSize: '1rem' }}>
          3 free simulations — no credit card needed.
        </p>
        <Link to="/register">
          <Button size="lg" variant="primary">
            Enroll Now — It's Free
          </Button>
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        padding: '28px 48px', borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldAlert color="var(--neon-green)" size={16} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>© 2025 CyberPlayground</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy', 'Terms', 'Support'].map(l => (
            <span key={l} style={{ color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-main)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
