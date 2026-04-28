import React from 'react';
import { Monitor, Router as RouterIcon, Box, MousePointer } from 'lucide-react';

const devices = [
  { type: 'pc',     label: 'PC',     Icon: Monitor,    color: '#ddb7ff', desc: 'End device' },
  { type: 'router', label: 'Router', Icon: RouterIcon, color: '#ffaaf8', desc: 'Layer 3' },
  { type: 'switch', label: 'Switch', Icon: Box,        color: '#dcb8ff', desc: 'Layer 2' },
];

export default function DevicePalette({ onDragStart }) {
  return (
    <div style={{
      width: 80,
      background: 'var(--surface-panel)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '12px 0',
      gap: 4,
      flexShrink: 0,
      zIndex: 20,
    }}>
      <div style={{
        fontSize: 9, color: 'var(--content-muted)', fontWeight: 700,
        letterSpacing: 1, textTransform: 'uppercase',
        marginBottom: 8, paddingLeft: 4, paddingRight: 4,
        textAlign: 'center', fontFamily: "'Space Grotesk', sans-serif",
      }}>
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
            border: '1px solid var(--border-subtle)',
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
            e.currentTarget.style.boxShadow = '0 0 12px ' + color + '44';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Icon size={20} color={color} />
          <span style={{
            fontSize: 10, color: 'var(--content-secondary)', fontWeight: 600,
            fontFamily: "'Space Grotesk', sans-serif",
          }}>{label}</span>
        </div>
      ))}

      <div style={{ flex: 1 }} />

      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8, textAlign: 'center', paddingLeft: 4, paddingRight: 4 }}>
        <div style={{ fontSize: 9, color: 'var(--content-muted)', marginBottom: 4 }}>
          Drag to add
        </div>
        <MousePointer size={14} color="var(--content-muted)" />
      </div>
    </div>
  );
}
