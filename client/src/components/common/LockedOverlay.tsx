import { Link } from 'react-router-dom';
import { Lock, Crown } from 'lucide-react';
import { Button } from './Button';
import React from 'react';

interface LockedOverlayProps {
  message?: string;
  ctaLabel?: string;
  ctaTo?: string;
  upgradeHref?: string;     // alias for ctaTo
  children?: React.ReactNode;
}

export function LockedOverlay({
  message = "You've reached your free limit",
  ctaLabel = 'Unlock Full Access',
  ctaTo,
  upgradeHref,
  children,
}: LockedOverlayProps) {
  const href = ctaTo ?? upgradeHref ?? '/dashboard/pricing';

  /* If children passed → wrap children with blur + overlay */
  if (children) {
    return (
      <div className="locked-wrapper">
        <div className="locked-content-blur">{children}</div>
        <div className="locked-overlay">
          <OverlayContent message={message} ctaLabel={ctaLabel} href={href} />
        </div>
      </div>
    );
  }

  /* Standalone overlay (used inside an already-positioned parent) */
  return (
    <div className="locked-overlay">
      <OverlayContent message={message} ctaLabel={ctaLabel} href={href} />
    </div>
  );
}

function OverlayContent({ message, ctaLabel, href }: { message: string; ctaLabel: string; href: string }) {
  return (
    <>
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: 'var(--neon-purple-dim)',
        border: '1px solid rgba(155,89,255,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
      }}>
        <Lock size={22} color="var(--neon-purple)" />
      </div>
      <p style={{
        fontWeight: 700, fontSize: '0.95rem', marginBottom: 6,
        fontFamily: 'var(--font-heading)', color: 'var(--text-main)',
      }}>
        Premium Content
      </p>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
        {message}
      </p>
      <Link to={href}>
        <Button variant="secondary" size="sm" style={{ gap: 7 }}>
          <Crown size={14} /> {ctaLabel}
        </Button>
      </Link>
    </>
  );
}

/* ── Backward-compat wrapper ───────────────────────────────────────────────── */
export function LockedWrapper({
  children,
  locked,
  ...overlayProps
}: LockedOverlayProps & { children: React.ReactNode; locked: boolean }) {
  if (!locked) return <>{children}</>;
  return <LockedOverlay {...overlayProps}>{children}</LockedOverlay>;
}
