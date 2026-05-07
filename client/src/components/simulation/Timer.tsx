import { useEffect, useState } from 'react';
import { formatTime } from '../../utils/utils';

interface TimerProps {
  initialSeconds: number;
  onExpire: () => void;
  isRunning: boolean;
}

const RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function Timer({ initialSeconds, onExpire, isRunning }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setTimeLeft(initialSeconds); }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(id); onExpire(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, onExpire]); // eslint-disable-line react-hooks/exhaustive-deps

  const pct      = Math.max(timeLeft / initialSeconds, 0);
  const offset   = CIRCUMFERENCE * (1 - pct);

  const isUrgent   = timeLeft <= Math.floor(initialSeconds * 0.33) && timeLeft > 10;
  const isCritical = timeLeft <= 10;

  const strokeColor = isCritical ? 'var(--neon-red)' : isUrgent ? 'var(--neon-yellow)' : 'var(--neon-green)';
  const textColor   = isCritical ? 'var(--neon-red)' : isUrgent ? 'var(--neon-yellow)' : 'var(--text-main)';

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 12px',
      background: isCritical ? 'var(--neon-red-dim)' : 'rgba(255,255,255,0.05)',
      borderRadius: 10,
      border: `1px solid ${isCritical ? 'rgba(255,77,77,0.3)' : 'rgba(255,255,255,0.08)'}`,
      animation: isCritical ? 'pulse 0.9s ease infinite' : 'none',
    }}>
      {/* SVG ring */}
      <svg width={52} height={52} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
        {/* Track */}
        <circle
          cx={26} cy={26} r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={3.5}
        />
        {/* Progress arc */}
        <circle
          cx={26} cy={26} r={RADIUS}
          fill="none"
          stroke={strokeColor}
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.4s ease' }}
        />
      </svg>
      {/* Label */}
      <span style={{
        fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem',
        color: textColor, transition: 'color 0.3s', minWidth: 44,
      }}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
}
