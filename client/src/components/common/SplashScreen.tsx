import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onDone: () => void;
}

export function SplashScreen({ onDone }: SplashScreenProps) {
  const [phase, setPhase] = useState<'logo' | 'tagline' | 'exit'>('logo');
  const tagline = 'Train Your Brain Against Cyber Attacks';
  const [typed, setTyped] = useState('');

  useEffect(() => {
    // Phase 1: logo appears → 0.6s
    const t1 = setTimeout(() => setPhase('tagline'), 600);
    return () => clearTimeout(t1);
  }, []);

  // Typewriter when in tagline phase
  useEffect(() => {
    if (phase !== 'tagline') return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTyped(tagline.slice(0, i));
      if (i >= tagline.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [phase]);

  // Start exit after full tagline + 0.5s pause
  useEffect(() => {
    if (phase !== 'tagline') return;
    const delay = 600 + tagline.length * 30 + 600;
    const t = setTimeout(() => {
      setPhase('exit');
      setTimeout(onDone, 400);
    }, delay);
    return () => clearTimeout(t);
  }, [phase, onDone]);

  return (
    <AnimatePresence>
      {phase !== 'exit' && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'var(--bg-deep)',
            backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,255,171,0.06) 0%, transparent 70%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 32,
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 16, stiffness: 300 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
          >
            <motion.div
              animate={{ boxShadow: ['0 0 0px rgba(0,255,171,0)', '0 0 40px rgba(0,255,171,0.5)', '0 0 20px rgba(0,255,171,0.3)'] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}
              style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'var(--neon-green-dim)',
                border: '2px solid rgba(0,255,171,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ShieldCheck size={40} color="var(--neon-green)" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              style={{
                fontSize: '1.75rem', fontWeight: 900,
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.02em',
                color: 'var(--text-main)',
              }}
            >
              CyberPlayground
            </motion.div>
          </motion.div>

          {/* Tagline typewriter */}
          {phase === 'tagline' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                fontSize: '1.05rem', color: 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                maxWidth: 340, textAlign: 'center', lineHeight: 1.6,
                minHeight: '1.6em',
              }}
            >
              {typed}
              <span style={{
                borderRight: '2px solid var(--neon-green)',
                marginLeft: 2,
                animation: 'typeCursor 0.7s step-end infinite',
                display: 'inline-block',
                height: '1em',
                verticalAlign: 'middle',
              }} />
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
