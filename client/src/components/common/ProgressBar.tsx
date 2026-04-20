import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;          // 0–100 percentage
  max?: number;           // optional, for display only — value is already a percentage
  height?: number;
  color?: 'green' | 'blue' | 'red' | 'yellow' | 'purple';
  animated?: boolean;
  label?: string;
  sublabel?: string;
  showLabel?: boolean;    // alias for showPercent
  showPercent?: boolean;
  className?: string;
}

const FILL_CLASS: Record<string, string> = {
  green:  '',
  blue:   'progress-fill-blue',
  red:    'progress-fill-red',
  yellow: 'progress-fill-yellow',
  purple: 'progress-fill-purple',
};

export function ProgressBar({
  value,
  height = 8,
  color = 'green',
  animated = true,
  label,
  sublabel,
  showLabel = true,
  showPercent,
  className = '',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  const displayPercent = showPercent ?? (showLabel && !label && !sublabel);

  return (
    <div className={className}>
      {(label || sublabel || displayPercent) && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 6,
        }}>
          {label && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {label}
            </span>
          )}
          {sublabel && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {sublabel}
            </span>
          )}
          {displayPercent && !sublabel && (
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div className="progress-track" style={{ height }}>
        {animated ? (
          <motion.div
            className={`progress-fill ${FILL_CLASS[color] ?? ''}`}
            style={{ height: '100%' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: [0.25, 0.8, 0.25, 1] }}
          />
        ) : (
          <div
            className={`progress-fill ${FILL_CLASS[color] ?? ''}`}
            style={{ height: '100%', width: `${pct}%` }}
          />
        )}
      </div>
    </div>
  );
}
