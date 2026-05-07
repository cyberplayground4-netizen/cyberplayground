import { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useAppStore } from '../stores/useAppStore';
import { Zap, CheckCircle2, X, Lock, CreditCard, RefreshCw, Crown, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

/* ── Razorpay window type ────────────────────────────────────────────────── */
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
interface RazorpayOptions {
  key:             string;
  subscription_id: string;
  name:            string;
  description:     string;
  image?:          string;
  prefill?:        { name?: string; email?: string };
  theme?:          { color?: string };
  handler:         (response: RazorpayResponse) => void;
  modal?:          { ondismiss?: () => void };
}
interface RazorpayInstance { open(): void }
interface RazorpayResponse {
  razorpay_payment_id:      string;
  razorpay_subscription_id: string;
  razorpay_signature:       string;
}

/* ── Load Razorpay checkout.js dynamically ───────────────────────────────── */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script    = document.createElement('script');
    script.src      = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload   = () => resolve(true);
    script.onerror  = () => resolve(false);
    document.body.appendChild(script);
  });
}

const freeFeatures    = ['3 Free Scenarios', 'Basic XP Tracking', 'Community Leaderboard'];
const premiumFeatures = ['Unlimited Scenarios', 'All 6 Attack Modules', 'Daily Challenges', 'Verified Certificate', 'Priority Support', 'Advanced Analytics'];
const comparisonRows  = [
  ['Scenario Access',   '3 Basic',  'Unlimited'],
  ['Attack Modules',    '1',        'All 6'],
  ['Daily Challenges',  false,      true],
  ['XP Tracking',       true,       true],
  ['Certificates',      false,      true],
  ['Analytics',         'Basic',    'Advanced'],
];

type PaymentState = 'idle' | 'loading' | 'processing' | 'success' | 'failed';

export default function PricingPage() {
  const { user }       = useAuth();
  const { setSubscription } = useAppStore();
  const toast          = useToast();
  const [state, setState] = useState<PaymentState>('idle');
  const [failMsg, setFailMsg] = useState('');

  const handleUpgrade = useCallback(async () => {
    setState('loading');

    // 1. Load Razorpay checkout.js
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error('Payment Error', 'Could not load payment gateway. Check your connection.');
      setState('failed');
      setFailMsg('Could not load payment gateway. Please disable ad blockers and try again.');
      return;
    }

    try {
      // 2. Create subscription on server
      const { data } = await api.post<{ subscription_id: string; key: string }>('/api/subscription/create');
      const { subscription_id, key } = data;

      // 3. Open Razorpay checkout popup
      setState('processing');
      await new Promise<void>((resolve, reject) => {
        const options: RazorpayOptions = {
          key:             key || import.meta.env.VITE_RAZORPAY_KEY || '',
          subscription_id,
          name:            'CyberPlayground',
          description:     'Premium · ₹299/month',
          prefill:         { name: user?.name, email: user?.email },
          theme:           { color: '#00ffab' },
          handler: async (response: RazorpayResponse) => {
            try {
              // 4. Verify payment server-side (HMAC check)
              await api.post('/api/subscription/verify', {
                razorpay_payment_id:      response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature:       response.razorpay_signature,
              });

              // 5. Update local subscription state
              setSubscription({ isActive: true, plan: 'premium', simulationsLimit: Infinity });
              setState('success');
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => {
              // User closed the popup without paying
              setState('idle');
              resolve();
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      setFailMsg(msg);
      setState('failed');
      toast.error('Payment Failed', msg);
    }
  }, [user, setSubscription, toast]);

  const resetState = () => { setState('idle'); setFailMsg(''); };

  /* ── Success screen ── */
  if (state === 'success') {
    return (
      <div style={{ padding: '80px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,255,171,0.25) 0%, rgba(0,255,171,0.05) 100%)',
            border: '2px solid var(--neon-green)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Crown size={46} color="var(--neon-green)" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 style={{ fontSize: '2rem', marginBottom: 12, color: 'var(--neon-green)' }}>Welcome to Premium!</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 420, margin: '0 auto 28px' }}>
            Your subscription is now active. You have unlimited access to all scenarios, daily challenges, and analytics.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {premiumFeatures.map(f => (
              <span key={f} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'var(--neon-green-dim)', color: 'var(--neon-green)',
                padding: '6px 14px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600,
              }}>
                <CheckCircle2 size={13} /> {f}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Failed screen ── */
  if (state === 'failed') {
    return (
      <div style={{ padding: '80px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
          <div style={{
            width: 90, height: 90, borderRadius: '50%',
            background: 'rgba(255,59,48,0.1)', border: '2px solid rgba(255,59,48,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertCircle size={42} color="var(--neon-red)" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: 10 }}>Payment Failed</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto 28px', fontSize: '0.9rem' }}>
            {failMsg || 'Something went wrong. Your card was not charged.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button variant="primary" onClick={handleUpgrade} isLoading={state === 'loading'}>
              <RefreshCw size={15} /> Retry Payment
            </Button>
            <Button variant="outline" onClick={resetState}>
              Go Back
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Main pricing page ── */
  return (
    <div style={{ padding: '40px 36px' }}>
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: 10 }}>Unlock Elite Training</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>
            Upgrade to Premium for unlimited simulations, daily challenges, and verified certificates.
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
            fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.06em', whiteSpace: 'nowrap', zIndex: 1,
          }}>
            ✦ MOST POPULAR
          </div>
          <Card style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            background: 'linear-gradient(145deg, rgba(14,20,32,1) 0%, rgba(20,26,44,1) 100%)',
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
                    <CheckCircle2 size={16} color="var(--neon-green)" style={{ flexShrink: 0 }} />
                    <strong>{f}</strong>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <AnimatePresence mode="wait">
                <motion.div key={state} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%' }}>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleUpgrade}
                    isLoading={state === 'loading' || state === 'processing'}
                    disabled={state === 'loading' || state === 'processing'}
                  >
                    <Zap size={16} />
                    {state === 'loading'     && 'Preparing checkout…'}
                    {state === 'processing'  && 'Processing payment…'}
                    {state === 'idle'        && 'Upgrade Now — ₹299/mo'}
                  </Button>
                </motion.div>
              </AnimatePresence>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* ── Trust indicators ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 48 }}>
        {[
          { icon: <Lock size={14} />,         label: 'Secure Payment' },
          { icon: <CheckCircle2 size={14} />,  label: 'No Hidden Charges' },
          { icon: <RefreshCw size={14} />,     label: 'Cancel Anytime' },
          { icon: <CreditCard size={14} />,    label: 'Razorpay Powered' },
        ].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--neon-green)' }}>{t.icon}</span>
            {t.label}
          </div>
        ))}
      </div>

      {/* ── Feature comparison table ── */}
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
                    <td style={{ padding: '12px 20px', fontSize: '0.875rem' }}>{feature}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.875rem' }}>
                      {typeof free === 'boolean'
                        ? free ? <CheckCircle2 size={16} color="var(--neon-green)" /> : <X size={16} color="var(--neon-red)" style={{ opacity: 0.5 }} />
                        : <span style={{ color: 'var(--text-muted)' }}>{free}</span>}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.875rem' }}>
                      {typeof premium === 'boolean'
                        ? premium ? <CheckCircle2 size={16} color="var(--neon-green)" /> : <X size={16} color="var(--neon-red)" />
                        : <span style={{ color: 'var(--neon-green)', fontWeight: 700 }}>{premium}</span>}
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
