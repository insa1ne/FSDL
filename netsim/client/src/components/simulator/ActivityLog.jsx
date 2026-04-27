import React, { useRef } from 'react';
import { Trash2, X } from 'lucide-react';
import useSimulatorStore from '../../store/useSimulatorStore';

const logColors = {
  info:    { dot: '#3b82f6', text: '#93c5fd', bg: 'transparent' },
  success: { dot: '#22c55e', text: '#86efac', bg: 'transparent' },
  warning: { dot: '#f59e0b', text: '#fcd34d', bg: 'transparent' },
  error:   { dot: '#ef4444', text: '#fca5a5', bg: 'transparent' },
};

const logPrefixes = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  error: '✕',
};

export default function ActivityLog({ height = 160 }) {
  const { activityLog, clearLog } = useSimulatorStore();
  const listRef = useRef(null);

  return (
    <div style={{
      height,
      background: 'var(--surface-root)',
      borderTop: '1px solid var(--surface-card)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '6px 14px',
        background: 'var(--surface-panel)',
        borderBottom: '1px solid var(--surface-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--content-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>
            Activity Log
          </span>
          <span style={{ fontSize: 10, color: 'var(--border-default)', background: 'var(--surface-card)', padding: '1px 6px', borderRadius: 10 }}>
            {activityLog.length}
          </span>
        </div>
        <button
          onClick={clearLog}
          title="Clear log"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--border-default)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, padding: 2 }}
        >
          <Trash2 size={11} /> Clear
        </button>
      </div>

      {/* Log entries */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '4px 0',
          fontFamily: 'monospace',
        }}
      >
        {activityLog.length === 0 ? (
          <div style={{ padding: '12px 14px', fontSize: 11, color: 'var(--border-default)', fontStyle: 'italic' }}>
            No activity yet. Generate a topology or add a device.
          </div>
        ) : (
          activityLog.map((entry) => {
            const c = logColors[entry.type] || logColors.info;
            return (
              <div
                key={entry.id}
                style={{
                  padding: '3px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  fontSize: 11,
                }}
              >
                <span style={{ color: 'var(--border-default)', flexShrink: 0, paddingTop: 1, fontSize: 10 }}>
                  {entry.time}
                </span>
                <span style={{ color: c.dot, fontWeight: 700, flexShrink: 0, paddingTop: 1 }}>
                  {logPrefixes[entry.type]}
                </span>
                <span style={{ color: c.text, lineHeight: 1.4 }}>
                  {entry.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
