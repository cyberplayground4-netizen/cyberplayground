import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import { SplashScreen } from './components/common/SplashScreen';
import { SkeletonCard } from './components/common/SkeletonLoader';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

/* ── Page transition wrapper ──────────────────────────────────────────────── */
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      style={{ minHeight: '100vh' }}
    >
      {children}
    </motion.div>
  );
}

/* ── Protected route — shows full-screen skeleton while auth loads ─────────── */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg-deep)',
        display: 'flex', flexDirection: 'column', gap: 20,
        padding: 32, maxWidth: 1200, margin: '0 auto',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 8 }}>
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/* ── App ──────────────────────────────────────────────────────────────────── */
function App() {
  const [splashDone, setSplashDone] = useState(() => {
    return sessionStorage.getItem('splashSeen') === '1';
  });

  const handleSplashDone = () => {
    sessionStorage.setItem('splashSeen', '1');
    setSplashDone(true);
  };

  const location = useLocation();

  return (
    <>
      {/* Splash — only shows once per session */}
      {!splashDone && <SplashScreen onDone={handleSplashDone} />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
