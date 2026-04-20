interface EmailUIProps {
  environment: any;
}

export function EmailUI({ environment }: EmailUIProps) {
  return (
    <div style={{
      background: '#fff',
      color: '#000',
      borderRadius: 'var(--radius-sm)',
      overflow: 'hidden',
      height: '100%',
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
    }}>
      {/* Email Client Header */}
      <div style={{ background: '#f0f2f5', padding: '12px 16px', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
        <span style={{ marginLeft: '12px', color: '#666', fontSize: '14px', fontWeight: 500 }}>SecureMail Inbox</span>
      </div>
      
      {/* Email Headers */}
      <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
        <h2 style={{ fontSize: '1.5rem', margin: '0 0 16px 0', fontFamily: 'Arial, sans-serif' }}>{environment.subject}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: '#ccc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', color: '#fff' }}>
            {environment.senderName.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 'bold' }}>{environment.senderName}</div>
            <div style={{ color: '#666', fontSize: '0.875rem' }}>&lt;{environment.senderEmail}&gt;</div>
          </div>
        </div>
      </div>

      {/* Email Body */}
      <div style={{ padding: '20px', flexGrow: 1, whiteSpace: 'pre-wrap', fontFamily: 'Arial, sans-serif', fontSize: '15px', lineHeight: '1.6' }}>
        {environment.body}
      </div>
    </div>
  );
}
