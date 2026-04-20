import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────────────── */
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error:   (title: string, message?: string) => void;
  info:    (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

/* ─── Context ────────────────────────────────────────────────────────────────── */
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} color="var(--neon-green)" />,
  error:   <XCircle      size={18} color="var(--neon-red)" />,
  info:    <Info         size={18} color="var(--blue-action)" />,
  warning: <AlertTriangle size={18} color="var(--neon-yellow)" />,
};

/* ─── Provider ───────────────────────────────────────────────────────────────── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
  }, []);

  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const duration = opts.duration ?? 3500;
    setToasts(prev => [...prev.slice(-4), { ...opts, id }]);
    const timer = setTimeout(() => dismiss(id), duration);
    timers.current.set(id, timer);
  }, [dismiss]);

  const success = useCallback((title: string, message?: string) => toast({ type: 'success', title, message }), [toast]);
  const error   = useCallback((title: string, message?: string) => toast({ type: 'error',   title, message }), [toast]);
  const info    = useCallback((title: string, message?: string) => toast({ type: 'info',    title, message }), [toast]);
  const warning = useCallback((title: string, message?: string) => toast({ type: 'warning', title, message }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}

      {/* Portal-free — just a fixed container */}
      <div className="toast-container" role="alert" aria-live="polite">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast toast-${t.type}`}
            onClick={() => dismiss(t.id)}
          >
            <span className="toast-icon">{ICONS[t.type]}</span>
            <div className="toast-body">
              <div className="toast-title">{t.title}</div>
              {t.message && <div className="toast-message">{t.message}</div>}
            </div>
            <button
              className="toast-close"
              onClick={e => { e.stopPropagation(); dismiss(t.id); }}
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ─── Hook ───────────────────────────────────────────────────────────────────── */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
