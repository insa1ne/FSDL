import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Monitor, Router as RouterIcon, Box } from 'lucide-react';
import useSimulatorStore from '../../store/useSimulatorStore';
import useThemeStore from '../../store/useThemeStore';

// Colors adapt: dark theme keeps the vivid palette; light theme uses muted versions
const typeColorsDark = {
  pc:     { bg: '#1e1b4b', border: '#4338ca', icon: '#818cf8', glow: 'rgba(99,102,241,0.4)'  },
  router: { bg: '#1c1107', border: '#92400e', icon: '#f59e0b', glow: 'rgba(245,158,11,0.35)' },
  switch: { bg: '#042f2e', border: '#065f5a', icon: '#2dd4bf', glow: 'rgba(20,184,166,0.35)' },
};
const typeColorsLight = {
  pc:     { bg: '#eef2ff', border: '#6366f1', icon: '#4f46e5', glow: 'rgba(99,102,241,0.2)'  },
  router: { bg: '#fffbeb', border: '#d97706', icon: '#b45309', glow: 'rgba(217,119,6,0.2)' },
  switch: { bg: '#f0fdfa', border: '#0d9488', icon: '#0f766e', glow: 'rgba(20,184,166,0.2)' },
};

// Remove the static getColors helper — we use the reactive theme store inside the component instead.

const typeIcons = { pc: Monitor, router: RouterIcon, switch: Box };

const GenericNode = ({ id, data, type, selected }) => {
  const isFailed  = data.status === 'offline';
  const isSelected = selected;

  // Reactive: re-renders whenever theme toggles
  const theme = useThemeStore((s) => s.theme);
  const colorMap = theme === 'dark' ? typeColorsDark : typeColorsLight;
  const colors = colorMap[type] || colorMap.pc;

  const Icon = typeIcons[type] || Monitor;
  const selectedNode = useSimulatorStore((s) => s.selectedNodeId);
  const setSelectedNode = useSimulatorStore((s) => s.setSelectedNode);

  const isHighlighted = selectedNode === id;

  return (
    <div
      onClick={() => setSelectedNode(isHighlighted ? null : id)}
      style={{
        position: 'relative',
        padding: '12px 14px',
        borderRadius: 14,
        border: '2px solid',
        borderColor: isFailed ? '#7f1d1d' : isHighlighted ? '#a5b4fc' : colors.border,
        background: isFailed ? '#1c0606' : colors.bg,
        boxShadow: isHighlighted
          ? '0 0 0 3px rgba(165,180,252,0.35), 0 4px 20px rgba(0,0,0,0.3)'
          : isFailed
          ? '0 0 12px rgba(239,68,68,0.25)'
          : '0 0 14px ' + colors.glow + ', 0 4px 12px rgba(0,0,0,0.12)',
        minWidth: 120,
        cursor: 'pointer',
        transition: 'all 0.2s',
        userSelect: 'none',
      }}
    >
      {/* All 4 handles — bidirectional so any port can connect to any other device */}
      <Handle type="source" id="top"    position={Position.Top}    style={{ width: 10, height: 10, background: 'var(--border-default)', border: '2px solid var(--content-muted)', top: -5 }} />
      <Handle type="target" id="top-t"  position={Position.Top}    style={{ width: 10, height: 10, background: 'var(--border-default)', border: '2px solid var(--content-muted)', top: -5, opacity: 0 }} />
      <Handle type="source" id="bottom" position={Position.Bottom} style={{ width: 10, height: 10, background: 'var(--border-default)', border: '2px solid var(--content-muted)', bottom: -5 }} />
      <Handle type="target" id="bottom-t" position={Position.Bottom} style={{ width: 10, height: 10, background: 'var(--border-default)', border: '2px solid var(--content-muted)', bottom: -5, opacity: 0 }} />
      <Handle type="source" id="left"   position={Position.Left}   style={{ width: 10, height: 10, background: 'var(--border-default)', border: '2px solid var(--content-muted)', left: -5 }} />
      <Handle type="target" id="left-t" position={Position.Left}   style={{ width: 10, height: 10, background: 'var(--border-default)', border: '2px solid var(--content-muted)', left: -5, opacity: 0 }} />
      <Handle type="source" id="right"  position={Position.Right}  style={{ width: 10, height: 10, background: 'var(--border-default)', border: '2px solid var(--content-muted)', right: -5 }} />
      <Handle type="target" id="right-t" position={Position.Right}  style={{ width: 10, height: 10, background: 'var(--border-default)', border: '2px solid var(--content-muted)', right: -5, opacity: 0 }} />

      {/* Status dot */}
      <div style={{
        position: 'absolute', top: 8, right: 8,
        width: 8, height: 8, borderRadius: '50%',
        background: isFailed ? '#ef4444' : '#22c55e',
        boxShadow: isFailed ? '0 0 8px #ef4444' : '0 0 8px #22c55e',
      }} />

      {/* Icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: isFailed ? '#450a0a' : 'var(--surface-hover)',
        border: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 8px auto',
        color: isFailed ? '#ef4444' : colors.icon,
      }}>
        <Icon size={22} />
      </div>

      {/* Label */}
      <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--content-primary)', marginBottom: 4 }}>
        {data.label}
      </div>

      {/* IP badge */}
      {data.ip && (
        <div style={{
          textAlign: 'center', fontSize: 10, fontFamily: 'monospace',
          color: 'var(--content-muted)', background: 'var(--surface-hover)',
          borderRadius: 4, padding: '1px 6px', border: '1px solid var(--border-default)',
        }}>
          {data.ip}
        </div>
      )}

      {/* Offline overlay */}
      {isFailed && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 12,
          background: 'rgba(239,68,68,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: 9, color: '#f87171', fontWeight: 700, letterSpacing: 1 }}>OFFLINE</span>
        </div>
      )}
    </div>
  );
};

export const PCNode     = (props) => <GenericNode {...props} type="pc" />;
export const RouterNode = (props) => <GenericNode {...props} type="router" />;
export const SwitchNode = (props) => <GenericNode {...props} type="switch" />;
