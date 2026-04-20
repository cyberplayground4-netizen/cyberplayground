import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useToast } from '../components/common/Toast';
import { Zap, CheckCircle2, X, Lock, CreditCard, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const freeFeatures     = ['3 Basic Scenarios', 'Basic XP Tracking', 'Community Leaderboard'];
const premiumFeatures  = ['Unlimited Scenarios', 'All 6 Attack Modules', 'Daily Challenges', 'Verified Certificate', 'Priority Support', 'Advanced Analytics'];
const comparisonRows   = [
  ['Scenario Access',     '3 Basic',    'Unlimited'],
  ['Attack Modules',      '1',          'All 6'],
  ['Daily Challenges',    false,        true],
  ['XP Tracking',        true,         true],
  ['Certificates',        false,        true],
  ['Analytics',           'Basic',      'Advanced'],
];

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/subscription/create');
      const subscriptionId = response.data.subscription_id;
      toast.success('Checkout Initiated!', `Mock Mode · Sub ID: ${subscriptionId}`);
    } catch {
      toast.error('Upgrade Failed', 'Could not initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 36px' }}>
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: 10 }}>Unlock Elite Training</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>
            Upgrade to Premium to access all scenarios and daily challenges.
          </p>
        </motion.div>
      </div>

      {/* ── Plan cards ── */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}>
        {/* Free */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} style={{ width: 300 }}>
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--text-muted)' }}>Recruit</CardTitle>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-heading)', margin: '14px 0 0' }}>
                ₹0<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span>
              </div>
            </CardHeader>
            <CardContent style={{ flexGrow: 1 }}>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {freeFeatures.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: '0.9rem' }}>
                    <CheckCircle2 size={16} color="var(--neon-green)" style={{ flexShrink: 0 }} /> {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" fullWidth disabled>Current Plan</Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Premium */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} style={{ width: 320, position: 'relative' }}>
          <div style={{
            position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
            background: 'linear-gradient(90deg, var(--blue-action), var(--neon-green))',
            color: '#fff', padding: '5px 18px', borderRadius: 99,
            fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.06em', whiteSpace: 'nowrap',
            zIndex: 1,
          }}>
            ✦ MOST POPULAR
          </div>
          <Card style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            background: 'linear-gradient(145deg, rgba(14,20,32,1) 0%, rgba(20,26,44,1) 100%)',
            border: '1.5px solid transparent',
            backgroundClip: 'padding-box',
            boxShadow: '0 0 0 1.5px var(--blue-action), 0 0 24px rgba(59,130,246,0.15), 0 0 48px rgba(0,255,171,0.08)',
          }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--neon-green)' }}>Cyber Hero</CardTitle>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-heading)', margin: '14px 0 0' }}>
                ₹299<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span>
              </div>
            </CardHeader>
            <CardContent style={{ flexGrow: 1 }}>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {premiumFeatures.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: '0.9rem' }}>
                    <CheckCircle2 size={16} color="var(--neon-green)" style={{ flexShrink: 0 }} />{' '}
                    <strong>{f}</strong>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="primary" fullWidth onClick={handleUpgrade} isLoading={loading}>
                <Zap size={16} /> Upgrade Now
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* ── Trust indicators ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 48 }}>
        {[
          { icon: <Lock size={14} />,        label: 'Secure Payment' },
          { icon: <CheckCircle2 size={14} />, label: 'No Hidden Charges' },
          { icon: <RefreshCw size={14} />,   label: 'Cancel Anytime' },
          { icon: <CreditCard size={14} />,  label: 'Razorpay Powered' },
        ].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--neon-green)' }}>{t.icon}</span>
            {t.label}
          </div>
        ))}
      </div>

      {/* ── Comparison table ── */}
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.25rem', marginBottom: 20 }}>Feature Comparison</h2>
        <Card>
          <CardContent style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', width: '40%' }}>Feature</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', width: '30%' }}>Recruit</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--neon-green)', width: '30%' }}>Cyber Hero</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map(([feature, free, premium], i) => (
                  <tr key={i} style={{ borderBottom: i < comparisonRows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <td style={{ padding: '12px 20px', fontSize: '0.875rem', color: 'var(--text-main)' }}>{feature}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.875rem' }}>
                      {typeof free === 'boolean'
                        ? free
                          ? <CheckCircle2 size={16} color="var(--neon-green)" />
                          : <X size={16} color="var(--neon-red)" style={{ opacity: 0.5 }} />
                        : <span style={{ color: 'var(--text-muted)' }}>{free}</span>
                      }
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.875rem' }}>
                      {typeof premium === 'boolean'
                        ? premium
                          ? <CheckCircle2 size={16} color="var(--neon-green)" />
                          : <X size={16} color="var(--neon-red)" />
                        : <span style={{ color: 'var(--neon-green)', fontWeight: 700 }}>{premium}</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
