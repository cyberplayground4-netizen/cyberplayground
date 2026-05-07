import { motion } from 'framer-motion';
import { Card, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import {
  AlertTriangle, CheckCircle2, XCircle, Lightbulb,
  Shield, RotateCcw, ChevronRight,
} from 'lucide-react';

interface Choice {
  id: string;
  text: string;
  isSafe: boolean;
  consequence: string;
}

interface Explanation {
  bestPractice: string;
  redFlags: string[];
}

interface ReplayViewProps {
  scenarioTitle: string;
  module: string;
  narrative: { setting: string; urgency?: string };
  choices: Choice[];
  selectedChoiceId: string;
  explanation: Explanation;
  timeTaken: number;
  timerSeconds: number;
  usedHint: boolean;
  onClose: () => void;
  onRestart: () => void;
}

export function ReplayView({
  scenarioTitle,
  module,
  narrative,
  choices,
  selectedChoiceId,
  explanation,
  timeTaken,
  timerSeconds,
  usedHint,
  onClose,
  onRestart,
}: ReplayViewProps) {
  const selectedChoice = choices.find((c) => c.id === selectedChoiceId);
  const isSafe = selectedChoice?.isSafe ?? false;
  const timeUsedPercent = Math.min(100, Math.round((timeTaken / timerSeconds) * 100));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 8000,
        background: 'rgba(8,11,18,0.92)',
        backdropFilter: 'blur(12px)',
        overflowY: 'auto',
        padding: '32px 20px',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: 28 }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
          }}>
            <Shield size={22} color="var(--neon-cyan)" />
            <span style={{
              fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.12em', color: 'var(--neon-cyan)',
            }}>
              Simulation Replay — Analysis
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', margin: '0 0 4px' }}>
            {scenarioTitle}
          </h1>
          <span style={{
            fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600,
          }}>
            {module}
          </span>
        </motion.div>

        {/* Step 1: The Situation */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ marginBottom: 20 }}
        >
          <StepHeader number={1} label="The Situation" />
          <Card>
            <CardContent style={{ padding: '20px 24px' }}>
              <p style={{
                color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, margin: 0,
              }}>
                {narrative.setting}
              </p>
              {narrative.urgency && (
                <div style={{
                  marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 12px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700,
                  background: narrative.urgency === 'high'
                    ? 'var(--neon-red-dim)' : narrative.urgency === 'medium'
                    ? 'var(--neon-yellow-dim)' : 'rgba(255,255,255,0.06)',
                  color: narrative.urgency === 'high'
                    ? 'var(--neon-red)' : narrative.urgency === 'medium'
                    ? 'var(--neon-yellow)' : 'var(--text-muted)',
                  border: `1px solid ${
                    narrative.urgency === 'high'
                      ? 'rgba(255,77,77,0.25)' : narrative.urgency === 'medium'
                      ? 'rgba(255,214,10,0.25)' : 'rgba(255,255,255,0.08)'
                  }`,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  Urgency: {narrative.urgency}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Step 2: Your Decision */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{ marginBottom: 20 }}
        >
          <StepHeader number={2} label="Your Decision" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {choices.map((choice) => {
              const isSelected = choice.id === selectedChoiceId;
              const borderColor = isSelected
                ? choice.isSafe ? 'var(--neon-green)' : 'var(--neon-red)'
                : 'rgba(255,255,255,0.06)';
              const bgOverlay = isSelected
                ? choice.isSafe ? 'rgba(0,255,171,0.04)' : 'rgba(255,77,77,0.04)'
                : 'transparent';

              return (
                <Card key={choice.id} style={{
                  border: `1.5px solid ${borderColor}`,
                  background: bgOverlay,
                }}>
                  <CardContent style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      {/* Choice indicator */}
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isSelected
                          ? choice.isSafe ? 'var(--neon-green-dim)' : 'var(--neon-red-dim)'
                          : 'rgba(255,255,255,0.06)',
                        marginTop: 2,
                      }}>
                        {isSelected ? (
                          choice.isSafe
                            ? <CheckCircle2 size={16} color="var(--neon-green)" />
                            : <XCircle size={16} color="var(--neon-red)" />
                        ) : (
                          <span style={{
                            fontSize: '0.7rem', fontWeight: 800,
                            color: choice.isSafe ? 'var(--neon-green)' : 'var(--text-muted)',
                          }}>
                            {choice.id}
                          </span>
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.5,
                          marginBottom: isSelected ? 10 : 0,
                          color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                        }}>
                          {choice.text}
                          {!isSelected && choice.isSafe && (
                            <span style={{
                              marginLeft: 8, fontSize: '0.65rem', fontWeight: 800,
                              color: 'var(--neon-green)', textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                            }}>
                              ✓ Correct
                            </span>
                          )}
                        </div>

                        {/* Show consequence for selected choice */}
                        {isSelected && (
                          <div style={{
                            padding: '10px 14px', borderRadius: 10,
                            background: choice.isSafe ? 'rgba(0,255,171,0.06)' : 'rgba(255,77,77,0.06)',
                            border: `1px solid ${choice.isSafe ? 'rgba(0,255,171,0.15)' : 'rgba(255,77,77,0.15)'}`,
                            fontSize: '0.82rem', lineHeight: 1.6,
                            color: choice.isSafe ? 'var(--neon-green)' : 'var(--neon-red)',
                          }}>
                            <strong>{choice.isSafe ? '✓ Safe outcome:' : '✗ Consequence:'}</strong>{' '}
                            {choice.consequence}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Step 3: Performance Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ marginBottom: 20 }}
        >
          <StepHeader number={3} label="Performance" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            <Card>
              <CardContent style={{ padding: '14px 16px', textAlign: 'center' }}>
                <div style={{
                  fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4,
                }}>Result</div>
                <div style={{
                  fontSize: '1rem', fontWeight: 800,
                  color: isSafe ? 'var(--neon-green)' : 'var(--neon-red)',
                }}>
                  {isSafe ? 'SAFE' : 'COMPROMISED'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent style={{ padding: '14px 16px', textAlign: 'center' }}>
                <div style={{
                  fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4,
                }}>Time Used</div>
                <div style={{
                  fontSize: '1rem', fontWeight: 800,
                  color: timeUsedPercent > 80 ? 'var(--neon-red)' : 'var(--neon-green)',
                }}>
                  {timeTaken}s / {timerSeconds}s
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent style={{ padding: '14px 16px', textAlign: 'center' }}>
                <div style={{
                  fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4,
                }}>Hint Used</div>
                <div style={{
                  fontSize: '1rem', fontWeight: 800,
                  color: usedHint ? 'var(--neon-yellow)' : 'var(--neon-green)',
                }}>
                  {usedHint ? 'YES' : 'NO'}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Step 4: Red Flags */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={{ marginBottom: 20 }}
        >
          <StepHeader number={4} label="Red Flags You Should Have Spotted" />
          <Card style={{ borderLeft: '3px solid var(--neon-red)' }}>
            <CardContent style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {explanation.redFlags.map((flag, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}
                  >
                    <AlertTriangle size={15} color="var(--neon-red)" style={{ flexShrink: 0, marginTop: 3 }} />
                    <span style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
                      {flag}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Step 5: Best Practice */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          style={{ marginBottom: 36 }}
        >
          <StepHeader number={5} label="Best Practice" />
          <Card style={{ borderLeft: '3px solid var(--neon-green)' }}>
            <CardContent style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <Lightbulb size={22} color="var(--neon-green)" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{
                fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-main)', margin: 0,
              }}>
                {explanation.bestPractice}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', paddingBottom: 32 }}
        >
          <Button variant="outline" onClick={onRestart} style={{ gap: 8 }}>
            <RotateCcw size={14} /> Retry Simulation
          </Button>
          <Button variant="primary" onClick={onClose} style={{ gap: 8 }}>
            Continue <ChevronRight size={14} />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* Step Header sub-component */
function StepHeader({ number, label }: { number: number; label: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%',
        background: 'var(--neon-cyan-dim)',
        color: 'var(--neon-cyan)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.7rem', fontWeight: 800, flexShrink: 0,
      }}>
        {number}
      </div>
      <span style={{
        fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.1em',
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
    </div>
  );
}
