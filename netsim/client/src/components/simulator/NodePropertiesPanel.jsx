import React, { useState } from 'react';
import { Monitor, Router as RouterIcon, Box, X, Wifi, WifiOff, Trash2, CheckCircle } from 'lucide-react';
import useSimulatorStore from '../../store/useSimulatorStore';

const typeColors = {
  pc:     { color: '#818cf8', label: 'PC (End Device)' },
  router: { color: '#f59e0b', label: 'Router (Layer 3)' },
  switch: { color: '#2dd4bf', label: 'Switch (Layer 2)' },
};
const typeIcons = { pc: Monitor, router: RouterIcon, switch: Box };

export default function NodePropertiesPanel() {
  const { nodes, selectedNodeId, setSelectedNode, updateNodeData, updateNodeIp, removeNode, addLog, isIpInUse } = useSimulatorStore();
  const node = nodes.find((n) => n.id === selectedNodeId);
  const [editLabel, setEditLabel] = useState('');
  const [editIp, setEditIp] = useState('');
  const [editing, setEditing] = useState(false);

  if (!node) return null;

  const { color, label: typeLabel } = typeColors[node.type] || typeColors.pc;
  const Icon = typeIcons[node.type] || Monitor;
  const isOffline = node.data.status === 'offline';

  const startEdit = () => {
    setEditLabel(node.data.label);
    setEditIp(node.data.ip || '');
    setEditing(true);
  };

  const saveEdit = () => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$|^$/;
    if (editIp && !ipRegex.test(editIp)) {
      addLog('error', 'Invalid IP address: ' + editIp);
      return;
    }
    if (editIp && isIpInUse(editIp, node.id)) {
      addLog('error', `IP ${editIp} is already in use by another device.`);
      return;
    }
    updateNodeData(node.id, { label: editLabel, ip: editIp });
    addLog('info', node.data.label + ' renamed to ' + editLabel + ', IP set to ' + (editIp || 'none'));
    setEditing(false);
  };

  const toggleStatus = () => {
    const newStatus = isOffline ? 'online' : 'offline';
    updateNodeData(node.id, { status: newStatus });
    addLog(
      newStatus === 'offline' ? 'error' : 'success',
      node.data.label + ' is now ' + newStatus.toUpperCase() + '.'
    );
  };

  return (
    <div style={{
      position: 'absolute',
      top: 8,
      right: 8,
      width: 240,
      background: 'var(--surface-panel)',
      border: '1px solid var(--surface-card)',
      borderRadius: 14,
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      zIndex: 60,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        background: 'var(--surface-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-default)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={16} color={color} />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--content-primary)' }}>
            {typeLabel}
          </span>
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--content-muted)', padding: 2 }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Properties */}
      <div style={{ padding: '12px 14px' }}>

        {editing ? (
          <>
            <label style={labelStyle}>Hostname / Label</label>
            <input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              style={inputStyle}
              autoFocus
            />

            <label style={{ ...labelStyle, marginTop: 8 }}>IP Address</label>
            <input
              value={editIp}
              onChange={(e) => setEditIp(e.target.value)}
              placeholder="e.g. 192.168.1.10"
              style={{ ...inputStyle, fontFamily: 'monospace' }}
            />

            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <button onClick={saveEdit} style={btnStyle('#16a34a', '#052e16')}>
                <CheckCircle size={12} /> Save
              </button>
              <button onClick={() => setEditing(false)} style={btnStyle('var(--content-muted)', 'var(--surface-card)')}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <Row label="Name" value={node.data.label} />
            <Row label="Type" value={node.type.toUpperCase()} />
            <Row label="IP Address" value={node.data.ip || '—'} mono />
            <Row label="Status" value={isOffline ? 'OFFLINE' : 'ONLINE'} valueColor={isOffline ? '#f87171' : '#4ade80'} />
            <Row label="Node ID" value={node.id} mono small />

            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
              <button onClick={startEdit} style={btnStyle('var(--accent-primary)', '#1e1b4b')}>
                Edit
              </button>
              <button onClick={toggleStatus} style={isOffline ? btnStyle('#16a34a', '#052e16') : btnStyle('#7f1d1d', '#450a0a')}>
                {isOffline ? <><Wifi size={11}/> Online</> : <><WifiOff size={11}/> Offline</>}
              </button>
              <button
                onClick={() => { removeNode(node.id); }}
                style={btnStyle('#dc2626', '#450a0a')}
              >
                <Trash2 size={11} /> Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const Row = ({ label, value, mono, small, valueColor }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
    <span style={{ fontSize: 10, color: 'var(--content-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </span>
    <span style={{
      fontSize: small ? 9 : 11,
      color: valueColor || '#cbd5e1',
      fontWeight: 600,
      fontFamily: mono ? 'monospace' : 'inherit',
      maxWidth: 130,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }}>
      {value}
    </span>
  </div>
);

const labelStyle = { display: 'block', fontSize: 10, color: 'var(--content-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 };

const inputStyle = {
  width: '100%',
  background: 'var(--surface-root)',
  border: '1px solid var(--border-default)',
  borderRadius: 6,
  padding: '5px 8px',
  fontSize: 12,
  color: 'var(--content-primary)',
  outline: 'none',
  boxSizing: 'border-box',
};

const btnStyle = (border, bg) => ({
  display: 'flex', alignItems: 'center', gap: 4,
  background: bg, border: '1px solid ' + border,
  color: 'var(--content-primary)', borderRadius: 6,
  padding: '4px 10px', fontSize: 11, fontWeight: 600,
  cursor: 'pointer', transition: 'all 0.15s',
});
