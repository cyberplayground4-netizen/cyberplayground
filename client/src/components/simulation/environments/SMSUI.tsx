import React from 'react';

interface SMSUIProps { environment: any; }

export function SMSUI({ environment }: SMSUIProps) {
  return (
    <div style={{
      width: '100%', maxWidth: '380px', margin: '0 auto',
      background: '#1c1c1e', borderRadius: '28px',
      overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      {/* Status bar */}
      <div style={{ background: '#000', padding: '10px 20px 6px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#fff', fontWeight: 600 }}>
        <span>9:41 AM</span>
        <span>📶 🔋</span>
      </div>

      {/* Header */}
      <div style={{ background: '#2c2c2e', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ width: 38, height: 38, background: '#636366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#fff', fontWeight: 'bold' }}>
          {environment.sender?.charAt(0) ?? '?'}
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#fff', fontSize: '15px' }}>{environment.sender ?? 'Unknown'}</div>
          <div style={{ fontSize: '11px', color: '#8e8e93' }}>Mobile Number</div>
        </div>
      </div>

      {/* Message bubbles */}
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '280px', background: '#000' }}>
        {(environment.messages ?? []).map((msg: any, i: number) => (
          <div key={i} style={{
            alignSelf: msg.from === 'them' ? 'flex-start' : 'flex-end',
            maxWidth: '78%',
            background: msg.from === 'them' ? '#2c2c2e' : '#0a84ff',
            padding: '10px 14px',
            borderRadius: msg.from === 'them' ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
            color: '#fff',
            fontSize: '14px',
            lineHeight: '1.5',
          }}>
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div style={{ background: '#1c1c1e', padding: '10px 16px 16px', display: 'flex', gap: '8px', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ flexGrow: 1, background: '#2c2c2e', borderRadius: '20px', padding: '10px 16px', color: '#636366', fontSize: '14px' }}>
          Text Message
        </div>
        <div style={{ width: 32, height: 32, background: '#0a84ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px' }}>↑</div>
      </div>
    </div>
  );
}
