import { Lock, Unlock, TriangleAlert } from 'lucide-react';

interface BrowserUIProps { environment: any; }

export function BrowserUI({ environment }: BrowserUIProps) {
  const isSecure = environment.isSecure ?? false;
  const url: string = environment.url ?? 'http://unknown-site.com';

  return (
    <div style={{
      background: '#fff', borderRadius: '10px',
      overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      display: 'flex', flexDirection: 'column', minHeight: '460px',
    }}>
      {/* Chrome-like browser chrome */}
      <div style={{ background: '#f1f3f4', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Window controls */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
        </div>
        {/* Address bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#fff', borderRadius: '20px',
          padding: '6px 14px', border: '1px solid #dadce0',
        }}>
          {isSecure
            ? <Lock size={13} color="#1a73e8" />
            : <Unlock size={13} color="#d93025" />
          }
          <span style={{
            fontSize: '13px', fontFamily: 'monospace', flexGrow: 1,
            color: isSecure ? '#202124' : '#d93025',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {url}
          </span>
        </div>
      </div>

      {/* SSL warning banner (if not secure) */}
      {!isSecure && (
        <div style={{ background: '#fce8e6', padding: '8px 16px', display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid #f5c6c2' }}>
          <TriangleAlert size={16} color="#d93025" />
          <span style={{ fontSize: '12px', color: '#d93025', fontFamily: 'Arial, sans-serif' }}>
            Your connection to this site is not secure
          </span>
        </div>
      )}

      {/* Page content area */}
      <div style={{ flexGrow: 1, padding: '24px', fontFamily: 'Arial, sans-serif', color: '#202124' }}>
        {/* Fake page header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e8eaed' }}>
          <div style={{
            width: 40, height: 40, background: environment.brandColor ?? '#1a73e8',
            borderRadius: '8px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '18px',
          }}>
            {environment.brandLetter ?? 'B'}
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{environment.siteName ?? 'Bank Login'}</div>
            <div style={{ fontSize: '12px', color: '#5f6368' }}>{url}</div>
          </div>
        </div>

        {/* Fake login form */}
        <div style={{ maxWidth: '360px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '22px', marginBottom: '20px', fontWeight: 400 }}>{environment.pageTitle ?? 'Sign in'}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input type="email" placeholder="Email or phone" readOnly
              style={{ padding: '14px 16px', border: '1px solid #dadce0', borderRadius: '4px', fontSize: '14px', outline: 'none', cursor: 'not-allowed', background: '#f8f9fa' }} />
            <input type="password" placeholder="Enter your password" readOnly
              style={{ padding: '14px 16px', border: '1px solid #dadce0', borderRadius: '4px', fontSize: '14px', outline: 'none', cursor: 'not-allowed', background: '#f8f9fa' }} />
            <button style={{ padding: '12px', background: environment.brandColor ?? '#1a73e8', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '14px', cursor: 'not-allowed', fontWeight: 600 }}>
              {environment.ctaLabel ?? 'Sign In'}
            </button>
          </div>
          {environment.subText && (
            <p style={{ fontSize: '12px', color: '#5f6368', marginTop: '16px', textAlign: 'center' }}>{environment.subText}</p>
          )}
        </div>
      </div>
    </div>
  );
}
