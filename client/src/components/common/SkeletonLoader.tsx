import React from 'react';

/* ─── Base shimmer block ────────────────────────────────────────────────────── */
function Shimmer({ width = '100%', height = 14, style }: {
  width?: string | number;
  height?: number;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className="skeleton-base"
      style={{ width, height, display: 'block', borderRadius: 6, ...style }}
    />
  );
}

/* ─── Skeleton Stat card ────────────────────────────────────────────────────── */
export function SkeletonStat() {
  return (
    <div className="skeleton-stat">
      <Shimmer width={44} height={44} style={{ borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Shimmer width="50%" height={11} />
        <Shimmer width="70%" height={22} />
      </div>
    </div>
  );
}

/* ─── Skeleton scenario card ─────────────────────────────────────────────────── */
export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div style={{ display: 'flex', gap: 8 }}>
        <Shimmer width={60} height={22} style={{ borderRadius: 99 }} />
        <Shimmer width={80} height={22} style={{ borderRadius: 99 }} />
      </div>
      <Shimmer width="80%" height={18} />
      <Shimmer width="100%" height={13} />
      <Shimmer width="90%"  height={13} />
      <Shimmer width="100%" height={40} style={{ borderRadius: 10, marginTop: 8 }} />
    </div>
  );
}

/* ─── Skeleton text lines ────────────────────────────────────────────────────── */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer
          key={i}
          width={i === lines - 1 ? '70%' : '100%'}
          height={14}
        />
      ))}
    </div>
  );
}

/* ─── Skeleton page header ───────────────────────────────────────────────────── */
export function SkeletonHeader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
      <Shimmer width="40%" height={32} />
      <Shimmer width="60%" height={16} />
    </div>
  );
}

/* ─── Full loading page ──────────────────────────────────────────────────────── */
export function PageLoadingSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div style={{ padding: '40px 40px' }}>
      <SkeletonHeader />
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16, marginBottom: 32 }}>
        {Array.from({ length: cols }).map((_, i) => <SkeletonStat key={i} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}
