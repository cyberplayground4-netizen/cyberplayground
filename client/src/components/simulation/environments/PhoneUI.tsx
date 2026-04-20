import React from 'react';

interface PhoneUIProps {
  environment: any;
}

export function PhoneUI({ environment }: PhoneUIProps) {
  return (
    <div style={{
      width: '320px',
      margin: '0 auto',
      background: '#000',
      color: '#fff',
      borderRadius: '36px',
      overflow: 'hidden',
      height: '600px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 0 0 4px #333, 0 10px 20px rgba(0,0,0,0.5)',
      position: 'relative'
    }}>
      {/* Screen area */}
      <div style={{ flexGrow: 1, background: '#111', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.25rem', color: '#888', marginBottom: '8px' }}>Incoming Call...</div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '40px' }}>{environment.callerId}</div>
        
        {/* Call Animation */}
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(57, 255, 20, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px', animation: 'pulse 1.5s infinite' }}>
           <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--neon-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             ✆
           </div>
        </div>

        {/* Voice Simulation */}
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--neon-cyan)' }}>
          <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px', textAlign: 'left' }}>Transcribed Voice Audio</div>
          <p style={{ margin: 0, fontStyle: 'italic', textAlign: 'left' }}>"{environment.voiceText}"</p>
        </div>
      </div>
    </div>
  );
}
