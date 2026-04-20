import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/common/Toast';
import api from '../services/api';
import { ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [emailErr, setEmailErr] = useState('');
  const [pwErr, setPwErr]       = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();
  const toast      = useToast();

  /* ── Inline validation ── */
  const validateEmail = (v: string) => {
    if (!v) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(v)) return 'Enter a valid email address';
    return '';
  };
  const validatePw = (v: string) => {
    if (!v) return 'Password is required';
    if (v.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePw(password);
    setEmailErr(eErr);
    setPwErr(pErr);
    if (eErr || pErr) return;

    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      login(response.data.user);
      toast.success('Welcome back!', 'Redirecting to your dashboard…');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error('Login failed', err.response?.data?.error || 'Please check your credentials.');
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
        radial-gradient(ellipse 70% 60% at 50% 0%, rgba(0,255,171,0.07) 0%, transparent 70%),
        radial-gradient(ellipse 50% 40% at 80% 80%, rgba(59,130,246,0.06) 0%, transparent 70%)
      `,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative glow orbs */}
      <div style={{ position: 'absolute', top: '15%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(0,255,171,0.04)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '8%', width: 250, height: 250, borderRadius: '50%', background: 'rgba(59,130,246,0.05)', filter: 'blur(80px)', pointerEvents: 'none' }} />

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
              background: 'var(--neon-green-dim)',
              border: '1.5px solid rgba(0,255,171,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 20px rgba(0,255,171,0.15)',
            }}>
              <ShieldCheck size={26} color="var(--neon-green)" />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', fontWeight: 800, margin: '0 0 6px' }}>
              Welcome Back
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Enter your details to access the simulator
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Email field */}
            <div>
              <label className="cyber-label" htmlFor="login-email">Email Address</label>
              <input
                className={`cyber-input${emailErr ? ' error' : ''}`}
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => { setEmail(e.target.value); if (emailErr) setEmailErr(''); }}
                onBlur={e => setEmailErr(validateEmail(e.target.value))}
                placeholder="agent@cyberplayground.com"
              />
              {emailErr && (
                <div className="input-error-msg">
                  <AlertCircle size={12} /> {emailErr}
                </div>
              )}
            </div>

            {/* Password field */}
            <div>
              <label className="cyber-label" htmlFor="login-password">Password</label>
              <div className="input-wrapper">
                <input
                  className={`cyber-input${pwErr ? ' error' : ''}`}
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (pwErr) setPwErr(''); }}
                  onBlur={e => setPwErr(validatePw(e.target.value))}
                  placeholder="••••••••"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPw(p => !p)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {pwErr && (
                <div className="input-error-msg">
                  <AlertCircle size={12} /> {pwErr}
                </div>
              )}
            </div>

            <Button type="submit" fullWidth isLoading={isLoading} style={{ marginTop: 4 }}>
              Initialize Uplink
            </Button>
          </form>

          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 24 }}>
            New recruit?{' '}
            <Link to="/register" style={{ color: 'var(--neon-green)', fontWeight: 700 }}>
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
