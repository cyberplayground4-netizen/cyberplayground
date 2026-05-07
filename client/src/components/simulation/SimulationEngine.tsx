import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Timer } from './Timer';
import { EmailUI } from './environments/EmailUI';
import { PhoneUI } from './environments/PhoneUI';
import { SMSUI } from './environments/SMSUI';
import { BrowserUI } from './environments/BrowserUI';
import { WifiUI } from './environments/WifiUI';
import { XpPopup } from '../gamification/XpPopup';
import { ReplayView } from './ReplayView';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useAppStore } from '../../stores/useAppStore';
import {
  ShieldCheck, ShieldX, Lightbulb, ArrowLeft,
  RotateCcw, Star, Clock, PlayCircle, FileSearch,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Phase = 'loading' | 'narrative' | 'playing' | 'outcome' | 'error';

const DIFF_LABELS = ['', 'Beginner', 'Intermediate', 'Advanced'];
const DIFF_COLORS = ['', 'var(--neon-green)', 'var(--neon-yellow)', 'var(--neon-red)'];
const DIFF_BG     = ['', 'var(--neon-green-dim)', 'var(--neon-yellow-dim)', 'var(--neon-red-dim)'];

interface ScenarioChoice {
  id: string; text: string; isSafe: boolean; consequence: string;
}

interface ScenarioContext {
  environment: Record<string, unknown>;
  narrative: { setting: string; urgency?: string };
  timerSeconds: number;
  xpReward: number;
  hints: string[];
  explanation: { bestPractice: string; redFlags: string[] };
  choices: ScenarioChoice[];
}

interface ScenarioData {
  id: string; title: string; module: string; environment_type: string; difficulty: number;
  content_json: ScenarioContext;
}

interface ResultData {
  newTotalXp: number; level: string; prevLevel: string; xpEarned: number;
  bonuses: string[]; leveledUp: boolean; newBadges: string[];
}

export default function SimulationEngine() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const { updateUser } = useAuth();
  const incrementUsage = useAppStore((s) => s.incrementUsage);

  const [scenario,  setScenario]  = useState<ScenarioData | null>(null);
  const [phase,     setPhase]     = useState<Phase>('loading');
  const [errorMsg,  setErrorMsg]  = useState('');

  /* ── Game state ── */
  const [timerActive,      setTimerActive]      = useState(false);
  const [usedHint,         setUsedHint]         = useState(false);
  const [showHint,         setShowHint]         = useState(false);
  const startTimeRef = useRef<number>(0);
  const [outcome,          setOutcome]          = useState<'safe' | 'compromised' | null>(null);
  const [resultData,       setResultData]       = useState<ResultData | null>(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [submitting,       setSubmitting]       = useState(false);
  const [showXpPopup,      setShowXpPopup]      = useState(false);
  const [flashClass,       setFlashClass]       = useState('');
  const [showReplay,       setShowReplay]       = useState(false);

  /* ── Load scenario ── */
  useEffect(() => {
    if (!id) return;
    api.get(`/api/scenarios/${id}`)
      .then(r => { setScenario(r.data.scenario); setPhase('narrative'); })
      .catch(err => {
        setErrorMsg(err.response?.data?.error ?? 'Failed to load scenario');
        setPhase('error');
      });
  }, [id]);

  /* ── Start playing ── */
  const startPlaying = () => {
    setTimerActive(true);
    startTimeRef.current = Date.now();
    setPhase('playing');
  };

  /* ── Handle a choice ── */
  const handleChoice = useCallback(async (choiceId: string, isSafe: boolean) => {
    if (phase !== 'playing' || submitting) return;
    setSubmitting(true);
    setTimerActive(false);
    setSelectedChoiceId(choiceId);

    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);

    /* Flash the whole screen */
    setFlashClass(isSafe ? 'flash-green' : 'flash-red');
    setTimeout(() => setFlashClass(''), 600);

    try {
      const r = await api.post(`/api/scenarios/${id}/submit`, {
        isSafe, timeTaken: elapsed, usedHint,
      });
      setResultData(r.data);
      updateUser({ xp: r.data.newTotalXp, level: r.data.level });
      setShowXpPopup(true);
      incrementUsage();
    } catch { /* non-critical */ }

    setOutcome(isSafe ? 'safe' : 'compromised');
    setPhase('outcome');
    setSubmitting(false);
  }, [id, phase, submitting, usedHint, updateUser]);

  /* ── Timer expire → auto-fail ── */
  const handleExpire = useCallback(() => {
    handleChoice('timeout', false);
  }, [handleChoice]);

  /* ── Hint ── */
  const requestHint = () => { setUsedHint(true); setShowHint(true); };

  /* ── Render environment ── */
  const renderEnv = (content: ScenarioContext) => {
    switch (scenario?.environment_type) {
      case 'email':   return <EmailUI   environment={content.environment as any} />;
      case 'sms':     return <SMSUI     environment={content.environment as any} />;
      case 'browser': return <BrowserUI environment={content.environment as any} />;
      case 'wifi':    return <WifiUI    environment={content.environment as any} />;
      case 'phone':   return <PhoneUI   environment={content.environment as any} />;
      default: return <div style={{ padding: 24, color: 'var(--text-muted)' }}>Unknown environment</div>;
    }
  };

  /* ── Loading ── */
  if (phase === 'loading') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="loader" style={{ width: 48, height: 48 }} />
    </div>
  );

  if (phase === 'error') return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <ShieldX size={64} color="var(--neon-red)" style={{ marginBottom: 16 }} />
      <h2 style={{ color: 'var(--neon-red)', marginBottom: 8 }}>Access Denied</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{errorMsg}</p>
      <Link to="/dashboard/simulations"><Button variant="outline">Back to Modules</Button></Link>
    </div>
  );

  const content = scenario?.content_json;
  const diff    = scenario?.difficulty ?? 1;

  if (!content) return null;

  /* ════════════════════════════════════════════════════════════
     NARRATIVE PHASE — immersive full-screen card
  ════════════════════════════════════════════════════════════ */
  if (phase === 'narrative') return (
    <div style={{ padding: '36px 40px', maxWidth: 680, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/dashboard/simulations" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 28, textDecoration: 'none',
        }}>
          <ArrowLeft size={15} /> Back to Modules
        </Link>

        {/* Module + difficulty badges */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <span style={{
            display: 'inline-block', padding: '4px 14px',
            background: 'var(--neon-purple-dim)', color: 'var(--neon-purple)',
            borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            {scenario?.module}
          </span>
          <span style={{
            display: 'inline-block', padding: '4px 14px',
            background: DIFF_BG[diff] ?? 'rgba(255,255,255,0.06)',
            color: DIFF_COLORS[diff] ?? '#fff',
            borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
          }}>
            {DIFF_LABELS[diff] ?? 'Expert'}
          </span>
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: 20, lineHeight: 1.2 }}>{scenario?.title}</h1>

        <Card style={{ marginBottom: 28, borderLeft: '3px solid var(--neon-green)' }}>
          <CardContent style={{ padding: 24 }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--neon-green)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              📋 Situation Brief
            </div>
            <p style={{ color: 'var(--text-main)', lineHeight: 1.8, margin: 0, fontSize: '0.95rem' }}>
              {content?.narrative?.setting}
            </p>
          </CardContent>
        </Card>

        {/* Info chips */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
          {[
            { icon: <Clock size={14} />,    label: `${content?.timerSeconds}s limit` },
            { icon: <Star size={14} />,     label: `${content?.xpReward ?? 100} XP reward` },
            { icon: <Lightbulb size={14} />, label: `${content?.hints?.length ?? 0} hint(s)` },
          ].map((chip, i) => (
            <div key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 99,
              color: 'var(--text-muted)', fontSize: '0.82rem',
            }}>
              {chip.icon} {chip.label}
            </div>
          ))}
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button size="lg" fullWidth onClick={startPlaying} style={{ position: 'relative', overflow: 'hidden' }}>
            <motion.div
              animate={{ boxShadow: ['0 0 0px rgba(0,255,171,0)', '0 0 16px rgba(0,255,171,0.5)', '0 0 0px rgba(0,255,171,0)'] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              style={{ position: 'absolute', inset: 0, borderRadius: 'inherit' }}
            />
            <PlayCircle size={20} /> Begin Simulation
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════
     PLAYING & OUTCOME phases
  ════════════════════════════════════════════════════════════ */
  return (
    <div className={`sim-container ${flashClass}`} style={{ padding: '20px 28px', maxWidth: 1280, margin: '0 auto' }}>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <span style={{
            display: 'inline-block', padding: '3px 10px',
            background: 'var(--neon-purple-dim)', color: 'var(--neon-purple)',
            borderRadius: 99, fontSize: '0.68rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5,
          }}>
            {scenario?.module}
          </span>
          <h2 style={{ margin: 0, fontSize: '1.05rem' }}>{scenario?.title}</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {phase === 'playing' && (
            <Timer initialSeconds={content.timerSeconds} onExpire={handleExpire} isRunning={timerActive} />
          )}
          {phase === 'outcome' && (
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                padding: '6px 16px', borderRadius: 10, fontSize: '0.875rem', fontWeight: 700,
                background: outcome === 'safe' ? 'var(--neon-green-dim)' : 'var(--neon-red-dim)',
                color: outcome === 'safe' ? 'var(--neon-green)' : 'var(--neon-red)',
                border: `1px solid ${outcome === 'safe' ? 'rgba(0,255,171,0.3)' : 'rgba(255,77,77,0.3)'}`,
              }}
            >
              {outcome === 'safe' ? '✓ THREAT AVERTED' : '✗ COMPROMISED'}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="scenario-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 24, alignItems: 'start' }}>

        {/* Left — environment */}
        <div style={{ position: 'relative', minHeight: 460 }}>
          <AnimatePresence>
            {phase === 'outcome' && (
              <motion.div
                key="outcome-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: 'absolute', inset: 0, zIndex: 20,
                  background: outcome === 'safe'
                    ? 'rgba(8,11,18,0.88)'
                    : 'rgba(8,11,18,0.92)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 12,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', padding: 32, textAlign: 'center',
                  border: `1px solid ${outcome === 'safe' ? 'rgba(0,255,171,0.15)' : 'rgba(255,77,77,0.15)'}`,
                }}
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                >
                  {outcome === 'safe'
                    ? <ShieldCheck size={88} color="var(--neon-green)" style={{ marginBottom: 16 }} />
                    : <ShieldX     size={88} color="var(--neon-red)"   style={{ marginBottom: 16, animation: 'shakeX 0.5s ease' }} />
                  }
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  style={{
                    fontSize: '2.4rem', margin: '0 0 10px',
                    color: outcome === 'safe' ? 'var(--neon-green)' : 'var(--neon-red)',
                    textShadow: outcome === 'safe'
                      ? '0 0 30px rgba(0,255,171,0.5)'
                      : '0 0 30px rgba(255,77,77,0.5)',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {outcome === 'safe' ? 'Safe Choice!' : 'You Got Phished!'}
                </motion.h2>

                {/* Consequence text */}
                {selectedChoiceId && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    style={{ color: 'var(--text-muted)', maxWidth: 380, marginBottom: 16, lineHeight: 1.65, fontSize: '0.9rem' }}
                  >
                    {content.choices.find((c: ScenarioChoice) => c.id === selectedChoiceId)?.consequence}
                  </motion.p>
                )}

                {/* XP earned */}
                {resultData && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.35, type: 'spring', stiffness: 280 }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      fontSize: '1.6rem', fontWeight: 900,
                      color: 'var(--neon-green)',
                      background: 'var(--neon-green-dim)',
                      border: '1px solid rgba(0,255,171,0.25)',
                      borderRadius: 14, padding: '10px 28px', marginBottom: 24,
                    }}
                  >
                    <Star size={20} /> +{resultData.xpEarned} XP
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}
                >
                  <Button variant="outline" size="sm" onClick={() => setShowReplay(true)} style={{ gap: 8 }}>
                    <FileSearch size={14} /> Replay Analysis
                  </Button>
                  <Link to="/dashboard/simulations">
                    <Button variant="outline" size="sm">
                      <RotateCcw size={14} /> Play Another
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="primary" size="sm">Dashboard</Button>
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {renderEnv(content)}
        </div>

        {/* Right — decision panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Decision choices */}
          <Card>
            <CardContent style={{ padding: 22 }}>
              <h3 style={{
                fontSize: '0.72rem', fontWeight: 700, marginBottom: 18,
                color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                {phase === 'playing' ? '⚡ Choose Your Action' : '📋 Action Analysis'}
              </h3>

              {phase === 'playing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {content.choices.map((choice: ScenarioChoice, i: number) => (
                    <motion.button
                      key={choice.id}
                      id={`choice-${choice.id}`}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      disabled={submitting}
                      onClick={() => handleChoice(choice.id, choice.isSafe)}
                      whileHover={!submitting ? {
                        background: 'rgba(0,255,171,0.06)',
                        borderColor: 'rgba(0,255,171,0.35)',
                        y: -2,
                        transition: { duration: 0.15 },
                      } : {}}
                      whileTap={!submitting ? { scale: 0.97 } : {}}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        padding: '13px 16px',
                        borderRadius: 10,
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9rem',
                        lineHeight: 1.5, width: '100%',
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        opacity: submitting ? 0.6 : 1,
                      }}
                    >
                      <span style={{
                        background: 'var(--neon-green-dim)', color: 'var(--neon-green)',
                        fontWeight: 800, fontSize: '0.75rem', width: 22, height: 22,
                        borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: 1,
                      }}>
                        {choice.id}
                      </span>
                      {choice.text}
                    </motion.button>
                  ))}
                </div>
              )}

              {phase === 'outcome' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ padding: 16, background: 'var(--neon-green-dim)', border: '1px solid rgba(0,255,171,0.25)', borderRadius: 10 }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--neon-green)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                      ✓ Best Practice
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--text-main)' }}>
                      {content.explanation.bestPractice}
                    </p>
                  </div>
                  <div style={{ padding: 16, background: 'var(--neon-red-dim)', border: '1px solid rgba(255,77,77,0.25)', borderRadius: 10 }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--neon-red)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                      ⚑ Red Flags
                    </div>
                    <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {content.explanation.redFlags.map((f: string, i: number) => (
                        <li key={i} style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hint — only during playing */}
          {phase === 'playing' && (
            <Card>
              <CardContent style={{ padding: 16 }}>
                {!showHint ? (
                  <button
                    id="hint-btn"
                    onClick={requestHint}
                    style={{
                      width: '100%', background: 'none',
                      border: '1px dashed rgba(255,214,10,0.4)',
                      color: 'var(--neon-yellow)', padding: '11px',
                      borderRadius: 10, cursor: 'pointer',
                      fontFamily: 'var(--font-body)', fontSize: '0.875rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,214,10,0.06)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <Lightbulb size={15} /> Use Hint (−25 XP bonus)
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      padding: '12px 14px', background: 'var(--neon-yellow-dim)',
                      borderRadius: 10, border: '1px solid rgba(255,214,10,0.25)',
                    }}
                  >
                    <Lightbulb size={16} color="var(--neon-yellow)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <p style={{ margin: 0, color: 'var(--neon-yellow)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                      {content.hints?.[0] ?? 'No hint available.'}
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* XP Popup */}
      {showXpPopup && resultData && (
        <XpPopup
          xpEarned={resultData.xpEarned}
          bonuses={resultData.bonuses ?? []}
          leveledUp={resultData.leveledUp ?? false}
          newLevel={resultData.level ?? ''}
          prevLevel={resultData.prevLevel ?? ''}
          newBadges={resultData.newBadges ?? []}
          onClose={() => setShowXpPopup(false)}
        />
      )}

      {/* Replay Analysis Overlay */}
      {showReplay && scenario && selectedChoiceId && (
        <ReplayView
          scenarioTitle={scenario.title}
          module={scenario.module}
          narrative={content.narrative}
          choices={content.choices}
          selectedChoiceId={selectedChoiceId}
          explanation={content.explanation}
          timeTaken={Math.round((Date.now() - startTimeRef.current) / 1000)}
          timerSeconds={content.timerSeconds}
          usedHint={usedHint}
          onClose={() => setShowReplay(false)}
          onRestart={() => {
            setShowReplay(false);
            navigate(0); // reload the simulation
          }}
        />
      )}
    </div>
  );
}
