import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/common/Toast';
import api from '../services/api';
import { ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

/* ── Password strength ──────────────────────────────────────────────────────── */
function getStrength(pw: string): { score: 0 | 1 | 2 | 3; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['', 'Weak', 'Medium', 'Strong'] as const;
  const colors = ['', 'var(--neon-red)', 'var(--neon-yellow)', 'var(--neon-green)'] as const;
  return { score: score as 0|1|2|3, label: labels[score], color: colors[score] };
}

export default function RegisterPage() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [nameErr, setNameErr]   = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [pwErr, setPwErr]       = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const toast    = useToast();
  const strength = getStrength(password);

  /* ── Validation ── */
  const validateName  = (v: string) => (!v ? 'Name is required' : '');
  const validateEmail = (v: string) => (!v ? 'Email is required' : !/\S+@\S+\.\S+/.test(v) ? 'Invalid email' : '');
  const validatePw    = (v: string) => {
    if (!v) return 'Password is required';
    if (v.length < 8) return 'Min 8 characters';
    if (!/[A-Z]/.test(v) || !/[a-z]/.test(v)) return 'Mix uppercase & lowercase';
    if (!/[0-9]/.test(v)) return 'Include at least one number';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nErr = validateName(name);
    const eErr = validateEmail(email);
    const pErr = validatePw(password);
    setNameErr(nErr); setEmailErr(eErr); setPwErr(pErr);
    if (nErr || eErr || pErr) return;

    setIsLoading(true);
    try {
      await api.post('/api/auth/register', { name, email, password });
      toast.success('Account created!', 'Redirecting to login in 3 seconds…');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error('Registration failed', error.response?.data?.error || 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
      background: 'var(--bg-deep)',
      backgroundImage: `
        radial-gradient(ellipse 70% 60% at 50% 0%, rgba(59,130,246,0.07) 0%, transparent 70%),
        radial-gradient(ellipse 50% 40% at 20% 80%, rgba(0,255,171,0.05) 0%, transparent 70%)
      `,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '10%', right: '12%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(59,130,246,0.05)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', left: '8%', width: 240, height: 240, borderRadius: '50%', background: 'rgba(0,255,171,0.04)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
        style={{ width: '100%', maxWidth: 420, zIndex: 1 }}
      >
        <div style={{
          background: 'var(--glass-bg)',
          border: 'var(--glass-border)',
          backdropFilter: 'blur(20px)',
          borderRadius: 24,
          padding: '40px 36px 36px',
          boxShadow: '0 8px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--blue-action-dim)',
              border: '1.5px solid rgba(59,130,246,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 20px rgba(59,130,246,0.12)',
            }}>
              <ShieldCheck size={26} color="var(--blue-action)" />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', fontWeight: 800, margin: '0 0 6px' }}>
              Join CyberPlayground
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Start your elite cybersecurity training
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Name */}
            <div>
              <label className="cyber-label" htmlFor="reg-name">Agent Name / Callsign</label>
              <input
                className={`cyber-input${nameErr ? ' error' : ''}`}
                id="reg-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={e => { setName(e.target.value); if (nameErr) setNameErr(''); }}
                onBlur={e => setNameErr(validateName(e.target.value))}
                placeholder="Neo"
              />
              {nameErr && <div className="input-error-msg"><AlertCircle size={12} /> {nameErr}</div>}
            </div>

            {/* Email */}
            <div>
              <label className="cyber-label" htmlFor="reg-email">Email Address</label>
              <input
                className={`cyber-input${emailErr ? ' error' : ''}`}
                id="reg-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => { setEmail(e.target.value); if (emailErr) setEmailErr(''); }}
                onBlur={e => setEmailErr(validateEmail(e.target.value))}
                placeholder="agent@cyberplayground.com"
              />
              {emailErr && <div className="input-error-msg"><AlertCircle size={12} /> {emailErr}</div>}
            </div>

            {/* Password */}
            <div>
              <label className="cyber-label" htmlFor="reg-password">Password</label>
              <div className="input-wrapper">
                <input
                  className={`cyber-input${pwErr ? ' error' : ''}`}
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (pwErr) setPwErr(''); }}
                  onBlur={e => setPwErr(validatePw(e.target.value))}
                  placeholder="StrongPassword1!"
                  style={{ paddingRight: 44 }}
                />
                <button type="button" className="input-icon-right" onClick={() => setShowPw(p => !p)} aria-label="Toggle password">
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {pwErr && <div className="input-error-msg"><AlertCircle size={12} /> {pwErr}</div>}

              {/* Strength bars */}
              {password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2, transition: 'background 0.3s',
                        background: strength.score >= i ? strength.color : 'rgba(255,255,255,0.1)',
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: strength.color, fontWeight: 600 }}>
                    {strength.label}
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" variant="secondary" fullWidth isLoading={isLoading} style={{ marginTop: 4 }}>
              Enroll Now
            </Button>
          </form>

          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 24 }}>
            Already enlisted?{' '}
            <Link to="/login" style={{ color: 'var(--neon-green)', fontWeight: 700 }}>
              Login here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
