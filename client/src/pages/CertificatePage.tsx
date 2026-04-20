import { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';
import { useToast } from '../components/common/Toast';
import { SkeletonCard } from '../components/common/SkeletonLoader';
import api from '../services/api';
import { Award, ShieldCheck, Share2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CertificatePage() {
  const [certs, setCerts]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api.get('/api/certificates')
      .then(r => setCerts(r.data.certificates))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleShare = (certId: string) => {
    const url = `${window.location.origin}/certificate/${certId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link Copied!', 'Certificate URL copied to clipboard.');
    }).catch(() => {
      toast.error('Copy Failed', 'Could not copy to clipboard.');
    });
  };

  if (loading) return (
    <div style={{ padding: '36px 40px' }}>
      <div style={{ height: 28, width: 220, background: 'rgba(255,255,255,0.07)', borderRadius: 8, marginBottom: 32 }} />
      <div style={{ display: 'grid', gap: 20 }}>
        {[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '36px 40px' }}>
      <h1 style={{ fontSize: '1.9rem', marginBottom: 8 }}>Certificates</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 36 }}>
        Earn XP to unlock cybersecurity awareness certificates.
      </p>

      {certs.length === 0 ? (
        /* ── Empty state ── */
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card style={{ maxWidth: 520, borderTop: '2px solid var(--neon-green)' }}>
            <CardContent style={{ padding: '52px 36px', textAlign: 'center' }}>
              {/* Illustration */}
              <div style={{
                width: 88, height: 88, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,255,171,0.12) 0%, transparent 70%)',
                border: '1.5px solid rgba(0,255,171,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 0 32px rgba(0,255,171,0.1)',
              }}>
                <Award size={40} color="var(--neon-green)" style={{ opacity: 0.7 }} />
              </div>

              <h3 style={{ marginBottom: 10, fontSize: '1.15rem' }}>No Certificates Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 8, lineHeight: 1.65 }}>
                Earn at least <strong style={{ color: 'var(--neon-green)' }}>100 XP</strong> by completing simulations to unlock your first certificate.
              </p>

              {/* Progress toward first cert (cosmetic) */}
              <div style={{ margin: '20px 0 28px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Progress toward first certificate</span>
                  <span style={{ color: 'var(--neon-green)' }}>0 / 100 XP</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                  <div style={{ width: '0%', height: '100%', background: 'linear-gradient(90deg, var(--neon-green), var(--neon-cyan))', borderRadius: 99 }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/dashboard/simulations">
                  <Button variant="primary"><Zap size={15} /> Start Training</Button>
                </Link>
                <Link to="/dashboard/pricing">
                  <Button variant="outline">Upgrade for More</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {certs.map((cert, idx) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div style={{
                background: 'linear-gradient(135deg, rgba(11,14,20,0.98) 0%, rgba(18,28,48,0.98) 100%)',
                border: '2px solid var(--neon-green)',
                borderRadius: 22,
                padding: '52px 48px',
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 0 40px rgba(0,255,171,0.08), 0 8px 48px rgba(0,0,0,0.5)',
              }}>
                {/* Corner ornaments */}
                {[
                  { top: 16, left: 16,  borderTop: true,  borderLeft: true },
                  { top: 16, right: 16, borderTop: true,  borderRight: true },
                  { bottom: 16, left: 16,  borderBottom: true, borderLeft: true },
                  { bottom: 16, right: 16, borderBottom: true, borderRight: true },
                ].map((pos, i) => (
                  <div key={i} style={{
                    position: 'absolute', width: 36, height: 36, opacity: 0.4,
                    ...(pos.top    !== undefined ? { top: pos.top }       : {}),
                    ...(pos.bottom !== undefined ? { bottom: pos.bottom } : {}),
                    ...(pos.left   !== undefined ? { left: pos.left }     : {}),
                    ...(pos.right  !== undefined ? { right: pos.right }   : {}),
                    borderTop:    pos.borderTop    ? '2.5px solid var(--neon-green)' : undefined,
                    borderBottom: pos.borderBottom ? '2.5px solid var(--neon-green)' : undefined,
                    borderLeft:   pos.borderLeft   ? '2.5px solid var(--neon-green)' : undefined,
                    borderRight:  pos.borderRight  ? '2.5px solid var(--neon-green)' : undefined,
                    borderRadius: pos.top !== undefined
                      ? (pos.left !== undefined ? '8px 0 0 0' : '0 8px 0 0')
                      : (pos.left !== undefined ? '0 0 0 8px' : '0 0 8px 0'),
                  }} />
                ))}

                {/* Background glow */}
                <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,255,171,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

                <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <motion.div
                    animate={{ boxShadow: ['0 0 0px rgba(0,255,171,0)', '0 0 24px rgba(0,255,171,0.4)', '0 0 12px rgba(0,255,171,0.2)'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                    style={{ display: 'inline-flex', marginBottom: 18 }}
                  >
                    <ShieldCheck size={52} color="var(--neon-green)" />
                  </motion.div>

                  <div style={{ fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--neon-green)', fontWeight: 700, marginBottom: 10 }}>
                    Certificate of Completion
                  </div>
                  <h2 style={{ fontSize: '1.8rem', margin: '0 0 10px', fontFamily: 'var(--font-heading)' }}>
                    {cert.title}
                  </h2>
                  <div style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 24px' }}>
                    This certifies that the holder has demonstrated competency in identifying<br />
                    and mitigating common cybersecurity threats through simulated training.
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: 36, marginBottom: 28, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Level Achieved', value: cert.level, color: 'var(--neon-purple)' },
                      { label: 'Issue Date', value: new Date(cert.issuedAt).toLocaleDateString(), color: 'var(--text-main)' },
                      { label: 'Cert ID', value: cert.id.split('-')[0].toUpperCase(), color: 'var(--neon-green)', mono: true },
                    ].map(d => (
                      <div key={d.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 4 }}>{d.label}</div>
                        <div style={{ fontWeight: 700, color: d.color, fontFamily: d.mono ? 'monospace' : undefined, fontSize: d.mono ? '0.85rem' : '1rem' }}>{d.value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <Button variant="outline" size="sm" onClick={() => handleShare(cert.id)}>
                      <Share2 size={14} /> Share Certificate
                    </Button>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                      Powered by CyberPlayground Training Platform
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
