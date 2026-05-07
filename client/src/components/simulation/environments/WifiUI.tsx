import { Wifi, TriangleAlert, Lock } from 'lucide-react';

interface WifiNetwork {
  signalStrength: number;
  ssid: string;
  isMalicious?: boolean;
  isOpen: boolean;
}

interface WifiEnvironment {
  networks?: WifiNetwork[];
}

interface WifiUIProps { environment: WifiEnvironment; }

export function WifiUI({ environment }: WifiUIProps) {
  const networks: WifiNetwork[] = environment.networks ?? [];

  return (
    <div style={{
      background: '#1c1c1e', borderRadius: '20px',
      overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
      border: '1px solid rgba(255,255,255,0.08)', maxWidth: '380px', margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ background: '#2c2c2e', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '17px', fontFamily: 'Arial, sans-serif' }}>Wi-Fi</div>
        <div style={{ color: '#8e8e93', fontSize: '12px', marginTop: '2px' }}>Choose a network to join</div>
      </div>

      {/* Network list */}
      <div style={{ padding: '8px 0' }}>
        {networks.map((net: WifiNetwork, i: number) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: i < networks.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            cursor: 'default',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Wifi size={20} color={net.signalStrength > 66 ? '#30d158' : net.signalStrength > 33 ? '#ffd60a' : '#ff453a'} />
              <div>
                <div style={{ color: '#fff', fontSize: '15px', fontFamily: 'Arial, sans-serif' }}>{net.ssid}</div>
                {net.isMalicious && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <TriangleAlert size={11} color="#ff9f0a" />
                    <span style={{ color: '#ff9f0a', fontSize: '11px' }}>Unverified network</span>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {net.isOpen
                ? <span style={{ fontSize: '11px', color: '#ff453a', background: 'rgba(255,69,58,0.15)', padding: '2px 8px', borderRadius: '10px' }}>Open</span>
                : <Lock size={14} color="#8e8e93" />
              }
              <span style={{ color: '#8e8e93', fontSize: '18px' }}>›</span>
            </div>
          </div>
        ))}
      </div>

      {/* Info tip */}
      <div style={{ background: '#2c2c2e', margin: '8px 12px', borderRadius: '10px', padding: '12px 14px' }}>
        <div style={{ fontSize: '12px', color: '#8e8e93', fontFamily: 'Arial, sans-serif', lineHeight: '1.5' }}>
          Your device will automatically join known networks. Open networks provide no security.
        </div>
      </div>
    </div>
  );
}
