import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../common/Card';
import { Flame, Clock, CheckCircle2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const ENV_EMOJI: Record<string, string> = {
  email: '📧', sms: '📱', phone: '📞', browser: '🌐', wifi: '📶',
};

function useCountdown(expiresAt: string) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Expired'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return timeLeft;
}

export function DailyChallengeWidget() {
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/daily/today')
      .then(r => setChallenge(r.data.challenge))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const timeLeft = useCountdown(challenge?.expiresAt ?? new Date().toISOString());

  if (loading || !challenge) return null;

  if (challenge.alreadyCompleted) {
    return (
      <Card style={{ borderLeft: '3px solid var(--neon-green)' }}>
        <CardContent style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <CheckCircle2 size={28} color="var(--neon-green)" />
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--neon-green)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Daily Challenge</div>
            <div style={{ fontWeight: 600, marginTop: 2 }}>Completed today! +{challenge.bonusXp} XP bonus earned 🎉</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card style={{
        borderLeft: '3px solid var(--neon-yellow)',
        background: 'linear-gradient(135deg, rgba(255,232,0,0.04) 0%, var(--bg-card) 100%)',
      }}>
        <CardContent style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={18} color="var(--neon-yellow)" />
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--neon-yellow)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Daily Challenge
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              <Clock size={12} /> {timeLeft}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: '1.5rem' }}>{ENV_EMOJI[challenge.scenario.environment_type] ?? '🎯'}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>{challenge.scenario.title}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{challenge.scenario.module}</div>
            </div>
            <div style={{
              marginLeft: 'auto', background: 'rgba(255,232,0,0.12)',
              border: '1px solid rgba(255,232,0,0.3)', borderRadius: 10,
              padding: '6px 12px', textAlign: 'center', flexShrink: 0,
            }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--neon-yellow)', fontWeight: 700, textTransform: 'uppercase' }}>Bonus</div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--neon-yellow)' }}>+{challenge.bonusXp}</div>
            </div>
          </div>

          <Link
            to={`/dashboard/simulations/engine/${challenge.scenario.id}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 10, fontWeight: 800, fontSize: '0.875rem',
              background: 'linear-gradient(90deg, var(--neon-yellow), #ff9f00)',
              color: '#000', textDecoration: 'none', fontFamily: 'var(--font-heading)',
              transition: 'opacity 0.15s',
            }}
          >
            <Zap size={14} /> Play Today's Challenge
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
