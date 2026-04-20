import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: number | string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 520 }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={e => { if (e.target === overlayRef.current) onClose(); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 8000,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', damping: 22, stiffness: 380 }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              width: '100%',
              maxWidth,
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              position: 'relative',
            }}
          >
            {title && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>{title}</h3>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}
                >
                  <X size={18} />
                </button>
              </div>
            )}
            {!title && (
              <button
                onClick={onClose}
                aria-label="Close"
                style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}
              >
                <X size={18} />
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
