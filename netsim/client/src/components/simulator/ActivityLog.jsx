import React, { useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import useSimulatorStore from '../../store/useSimulatorStore';

// Stitch-style: terminal log matching the Network Log panel from simulator.html
// Colors: outline-variant timestamps, secondary/primary/error prefixes

const logColors = {
  info:    { prefix: '[SYS]',    prefixColor: 'var(--accent-hover)', textColor: 'var(--content-muted)' },
  success: { prefix: '[INFO]',   prefixColor: 'var(--accent-primary)', textColor: 'var(--content-secondary)' },
  warning: { prefix: '[WARN]',   prefixColor: '#fcd34d', textColor: 'var(--content-secondary)' },
  error:   { prefix: '[CRIT]',   prefixColor: '#ffb4ab', textColor: '#ffb4ab' },
};

export default function ActivityLog({ height = 192 }) {
  const { activityLog, clearLog } = useSimulatorStore();
  const listRef = useRef(null);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [activityLog]);

  return (
    <div style={{
      height,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      background: 'var(--panel-bg)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--border-subtle)',
    }}>
      {/* Header — matches Stitch's "Network Log" header */}
      <div style={{
        padding: '6px 16px',
        background: 'var(--surface-panel)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--content-muted)' }}>terminal</span>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--content-primary)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            Network Log
          </span>
          <span style={{
            fontSize: 10,
            color: 'var(--content-muted)',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            padding: '1px 7px',
            borderRadius: 99,
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            {activityLog.length}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={clearLog}
            title="Clear log"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--content-muted)', display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, padding: '2px 6px', borderRadius: 5,
              transition: 'color 0.15s',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--content-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--content-muted)'}
          >
            <Trash2 size={12} /> Clear
          </button>
        </div>
      </div>

      {/* Log scroll area */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 0',
          fontFamily: "'Space Grotesk', monospace",
        }}
      >
        {activityLog.length === 0 ? (
          <div style={{ padding: '10px 16px', fontSize: 12, color: 'var(--border-default)', fontStyle: 'italic' }}>
            Simulation engine ready. Add devices or generate a topology.
          </div>
        ) : (
          activityLog.map((entry) => {
            const c = logColors[entry.type] || logColors.info;
            return (
              <div
                key={entry.id}
                style={{
                  padding: '3px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  fontSize: 12,
                  lineHeight: 1.6,
                }}
              >
                <span style={{ color: 'var(--border-default)', flexShrink: 0, minWidth: 60, fontFamily: 'monospace', fontSize: 11 }}>
                  {entry.time}
                </span>
                <span style={{ color: c.prefixColor, fontWeight: 700, flexShrink: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                  {c.prefix}
                </span>
                <span style={{ color: c.textColor }}>
                  {entry.message}
                </span>
              </div>
            );
          })
        )}
        {/* Blinking cursor */}
        <div style={{ padding: '2px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'var(--border-default)', minWidth: 60, fontFamily: 'monospace', fontSize: 11 }}>&nbsp;</span>
          <span style={{
            display: 'inline-block', width: 8, height: 14,
            background: 'var(--accent-primary)',
            animation: 'blink 1.1s step-end infinite',
            verticalAlign: 'text-bottom',
          }} />
        </div>
        <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
      </div>
    </div>
  );
}
