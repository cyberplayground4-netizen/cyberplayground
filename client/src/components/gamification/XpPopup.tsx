import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, TrendingUp, Zap, Award } from 'lucide-react';

interface XpPopupProps {
  xpEarned: number;
  bonuses: string[];
  leveledUp: boolean;
  newLevel: string;
  prevLevel: string;
  newBadges: string[];
  onClose: () => void;
}

export function XpPopup({ xpEarned, bonuses, leveledUp, newLevel, prevLevel, newBadges, onClose }: XpPopupProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => { setShow(false); setTimeout(onClose, 400); }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{
            position: 'fixed', bottom: 32, right: 32, zIndex: 9000,
            background: 'linear-gradient(135deg, rgba(11,14,20,0.97) 0%, rgba(20,25,36,0.97) 100%)',
            border: '1px solid rgba(0,240,255,0.3)',
            borderRadius: 20, padding: '24px 28px', minWidth: 300,
            boxShadow: '0 0 40px rgba(0,240,255,0.15), 0 20px 60px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* XP Earned */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: bonuses.length > 0 ? 16 : 0 }}>
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ background: 'var(--neon-cyan-dim)', borderRadius: 12, padding: 10 }}
            >
              <Star size={24} color="var(--neon-cyan)" />
            </motion.div>
            <div>
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10, stiffness: 400, delay: 0.1 }}
                style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--neon-cyan)', fontFamily: 'var(--font-heading)' }}
              >
                +{xpEarned} XP
              </motion.div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Experience Points Earned</div>
            </div>
          </div>

          {/* Bonuses list */}
          {bonuses.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: leveledUp ? 16 : 0 }}>
              {bonuses.map((b, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  style={{
                    padding: '3px 10px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700,
                    background: 'rgba(255,232,0,0.12)', color: 'var(--neon-yellow)',
                    border: '1px solid rgba(255,232,0,0.2)',
                  }}
                >
                  <Zap size={10} style={{ marginRight: 3, verticalAlign: 'middle' }} />{b}
                </motion.span>
              ))}
            </div>
          )}

          {/* Level Up */}
          {leveledUp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              style={{
                padding: '12px 16px', borderRadius: 14, marginBottom: newBadges.length > 0 ? 16 : 0,
                background: 'linear-gradient(135deg, rgba(157,0,255,0.15) 0%, rgba(0,240,255,0.1) 100%)',
                border: '1px solid var(--neon-purple)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <TrendingUp size={20} color="var(--neon-purple)" />
                <div>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--neon-purple)', fontWeight: 700 }}>Level Up!</div>
                  <div style={{ color: '#fff', fontWeight: 700 }}>
                    <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', marginRight: 8 }}>{prevLevel}</span>
                    → {newLevel}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* New badges */}
          {newBadges.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {newBadges.map((badge, i) => (
                <motion.div
                  key={badge}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.15 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px', borderRadius: 10,
                    background: 'rgba(255,232,0,0.08)', border: '1px solid rgba(255,232,0,0.2)',
                  }}
                >
                  <Award size={18} color="var(--neon-yellow)" />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--neon-yellow)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Badge Earned</div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>🏅 {badge}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
