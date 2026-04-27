import React from 'react';
import { Monitor, Router as RouterIcon, Box, MousePointer, Trash2 } from 'lucide-react';

const devices = [
  { type: 'pc',     label: 'PC',           Icon: Monitor,    color: '#818cf8', desc: 'End device' },
  { type: 'router', label: 'Router',       Icon: RouterIcon, color: '#f59e0b', desc: 'Layer 3' },
  { type: 'switch', label: 'Switch',       Icon: Box,        color: '#2dd4bf', desc: 'Layer 2' },
];

export default function DevicePalette({ onDragStart }) {
  return (
    <div style={{
      width: 80,
      background: 'var(--surface-panel)',
      borderRight: '1px solid var(--surface-card)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '12px 0',
      gap: 4,
      flexShrink: 0,
      zIndex: 20,
    }}>
      <div style={{ fontSize: 9, color: 'var(--content-muted)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4, paddingRight: 4, textAlign: 'center' }}>
        Devices
      </div>

      {devices.map(({ type, label, Icon, color, desc }) => (
        <div
          key={type}
          draggable
          onDragStart={(e) => onDragStart(e, type)}
          title={label + ' — ' + desc + '\nDrag to canvas'}
          style={{
            width: 60,
            padding: '10px 6px',
            borderRadius: 10,
            border: '1px solid var(--surface-card)',
            background: 'var(--surface-card)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 5,
            cursor: 'grab',
            transition: 'all 0.15s',
            userSelect: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = color;
            e.currentTarget.style.background = 'var(--surface-card)';
            e.currentTarget.style.boxShadow = '0 0 12px ' + color + '44';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--surface-card)';
            e.currentTarget.style.background = 'var(--surface-card)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Icon size={20} color={color} />
          <span style={{ fontSize: 10, color: 'var(--content-secondary)', fontWeight: 600 }}>{label}</span>
        </div>
      ))}

      <div style={{ flex: 1 }} />

      <div style={{ borderTop: '1px solid var(--surface-card)', paddingTop: 8, textAlign: 'center', paddingLeft: 4, paddingRight: 4 }}>
        <div style={{ fontSize: 9, color: 'var(--border-default)', marginBottom: 4 }}>
          Drag to add
        </div>
        <MousePointer size={14} color="var(--border-default)" />
      </div>
    </div>
  );
}
