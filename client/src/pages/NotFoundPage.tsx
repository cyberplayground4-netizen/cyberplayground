import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'var(--bg-deep)',
      backgroundImage: `
        radial-gradient(ellipse 70% 60% at 50% 0%, rgba(255,77,77,0.05) 0%, transparent 70%),
        radial-gradient(ellipse 50% 40% at 80% 80%, rgba(155,89,255,0.04) 0%, transparent 70%)
      `,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative glow orbs */}
      <div style={{ position: 'absolute', top: '20%', left: '15%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,77,77,0.04)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 250, height: 250, borderRadius: '50%', background: 'rgba(155,89,255,0.04)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', maxWidth: 520, zIndex: 1 }}
      >
        {/* Shield icon */}
        <motion.div
          animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
          transition={{ duration: 1.5, delay: 0.3 }}
          style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'rgba(255,77,77,0.08)',
            border: '1.5px solid rgba(255,77,77,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px',
            boxShadow: '0 0 32px rgba(255,77,77,0.1)',
          }}
        >
          <ShieldAlert size={44} color="var(--neon-red)" style={{ opacity: 0.8 }} />
        </motion.div>

        {/* Error code */}
        <div style={{
          fontSize: 'clamp(5rem, 12vw, 8rem)',
          fontWeight: 900,
          fontFamily: 'var(--font-heading)',
          lineHeight: 1,
          marginBottom: 8,
          background: 'linear-gradient(135deg, var(--neon-red), var(--neon-purple))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          404
        </div>

        <h1 style={{
          fontSize: '1.4rem',
          fontFamily: 'var(--font-heading)',
          marginBottom: 12,
        }}>
          Sector Not Found
        </h1>

        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.95rem',
          lineHeight: 1.7,
          marginBottom: 36,
          maxWidth: 400,
          margin: '0 auto 36px',
        }}>
          The page you're looking for doesn't exist or has been moved.
          It might have been part of a simulated attack — stay alert.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/">
            <Button variant="primary" style={{ gap: 8 }}>
              <Home size={16} /> Back to Base
            </Button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="cyber-button variant-outline size-md"
            style={{ gap: 8 }}
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
