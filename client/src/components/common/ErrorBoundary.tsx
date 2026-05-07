import { Component, type ReactNode } from 'react';
import { ShieldX, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'var(--bg-deep)',
        }}>
          <div style={{
            maxWidth: 480,
            textAlign: 'center',
            background: 'var(--bg-card)',
            border: '1px solid rgba(255,77,77,0.2)',
            borderRadius: 20,
            padding: '48px 36px',
            boxShadow: '0 8px 48px rgba(0,0,0,0.5)',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--neon-red-dim)',
              border: '1.5px solid rgba(255,77,77,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <ShieldX size={36} color="var(--neon-red)" />
            </div>

            <h1 style={{
              fontSize: '1.5rem',
              fontFamily: 'var(--font-heading)',
              marginBottom: 8,
              color: 'var(--neon-red)',
            }}>
              System Malfunction
            </h1>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              lineHeight: 1.7,
              marginBottom: 28,
            }}>
              Something went wrong in the CyberPlayground simulation environment.
              This error has been logged.
            </p>

            {this.state.error && (
              <pre style={{
                background: 'rgba(255,77,77,0.06)',
                border: '1px solid rgba(255,77,77,0.15)',
                borderRadius: 10,
                padding: '12px 16px',
                fontSize: '0.75rem',
                color: 'var(--neon-red)',
                textAlign: 'left',
                overflow: 'auto',
                maxHeight: 120,
                marginBottom: 24,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {this.state.error.message}
              </pre>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReset}
                className="cyber-button variant-outline size-sm"
                style={{ gap: 8 }}
              >
                <RotateCcw size={14} /> Try Again
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                className="cyber-button variant-primary size-sm"
                style={{ gap: 8 }}
              >
                <Home size={14} /> Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
