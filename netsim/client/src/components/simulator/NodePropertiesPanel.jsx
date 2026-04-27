import React, { useState } from 'react';
import { Monitor, Router as RouterIcon, Box, X, Wifi, WifiOff, Trash2, CheckCircle, Send, ArrowDownLeft } from 'lucide-react';
import useSimulatorStore from '../../store/useSimulatorStore';

const typeColors = {
  pc:     { color: '#818cf8', label: 'PC (End Device)' },
  router: { color: '#f59e0b', label: 'Router (Layer 3)' },
  switch: { color: '#2dd4bf', label: 'Switch (Layer 2)' },
};
const typeIcons = { pc: Monitor, router: RouterIcon, switch: Box };

export default function NodePropertiesPanel() {
  const {
    nodes, selectedNodeId, setSelectedNode,
    updateNodeData, updateNodeIp, removeNode, addLog, isIpInUse,
    packetHistory, clearPacketHistory,
  } = useSimulatorStore();
  const node = nodes.find((n) => n.id === selectedNodeId);
  const [editLabel, setEditLabel] = useState('');
  const [editIp, setEditIp]   = useState('');
  const [editing, setEditing]  = useState(false);
  const [tab, setTab]          = useState('info'); // 'info' | 'packets'

  if (!node) return null;

  const { color, label: typeLabel } = typeColors[node.type] || typeColors.pc;
  const Icon = typeIcons[node.type] || Monitor;
  const isOffline = node.data.status === 'offline';
  const history = packetHistory[node.id] || [];

  const startEdit = () => { setEditLabel(node.data.label); setEditIp(node.data.ip || ''); setEditing(true); };

  const saveEdit = () => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$|^$/;
    if (editIp && !ipRegex.test(editIp)) { addLog('error', 'Invalid IP address: ' + editIp); return; }
    if (editIp && isIpInUse(editIp, node.id)) { addLog('error', 'IP ' + editIp + ' is already in use.'); return; }
    updateNodeData(node.id, { label: editLabel, ip: editIp });
    addLog('info', node.data.label + ' renamed to ' + editLabel + ', IP set to ' + (editIp || 'none'));
    setEditing(false);
  };

  const toggleStatus = () => {
    const newStatus = isOffline ? 'online' : 'offline';
    updateNodeData(node.id, { status: newStatus });
    addLog(newStatus === 'offline' ? 'error' : 'success', node.data.label + ' is now ' + newStatus.toUpperCase() + '.');
  };

  return (
    <div style={{
      position: 'absolute', top: 8, right: 8, width: 260,
      background: 'var(--surface-panel)', border: '1px solid var(--border-default)',
      borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.25)', zIndex: 60, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', background: 'var(--surface-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={16} color={color} />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--content-primary)' }}>{typeLabel}</span>
        </div>
        <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--content-muted)', padding: 2 }}>
          <X size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-default)', background: 'var(--surface-card)' }}>
        {[['info', 'Properties'], ['packets', 'Packets (' + history.length + ')']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            flex: 1, padding: '7px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer',
            background: 'none', border: 'none',
            borderBottom: tab === key ? '2px solid ' + color : '2px solid transparent',
            color: tab === key ? color : 'var(--content-muted)',
            transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {/* Tab: Info */}
      {tab === 'info' && (
        <div style={{ padding: '12px 14px' }}>
          {editing ? (
            <>
              <label style={labelStyle}>Hostname / Label</label>
              <input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} style={inputStyle} autoFocus />
              <label style={{ ...labelStyle, marginTop: 8 }}>IP Address</label>
              <input value={editIp} onChange={(e) => setEditIp(e.target.value)} placeholder="e.g. 192.168.1.10" style={{ ...inputStyle, fontFamily: 'monospace' }} />
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <button onClick={saveEdit} style={btnStyle('#16a34a', '#052e16')}><CheckCircle size={12} /> Save</button>
                <button onClick={() => setEditing(false)} style={btnStyle('var(--content-muted)', 'var(--surface-card)')}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <Row label="Name"       value={node.data.label} />
              <Row label="Type"       value={node.type.toUpperCase()} />
              <Row label="IP Address" value={node.data.ip || '—'} mono />
              <Row label="Status"     value={isOffline ? 'OFFLINE' : 'ONLINE'} valueColor={isOffline ? '#f87171' : '#4ade80'} />
              <Row label="Node ID"    value={node.id} mono small />
              <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                <button onClick={startEdit} style={btnStyle('var(--accent-primary)')}>Edit</button>
                <button onClick={toggleStatus} style={isOffline ? btnStyle('#16a34a') : btnStyle('#dc2626')}>
                  {isOffline ? <><Wifi size={11}/> Online</> : <><WifiOff size={11}/> Offline</>}
                </button>
                <button onClick={() => removeNode(node.id)} style={btnStyle('#ef4444')}>
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab: Packet History */}
      {tab === 'packets' && (
        <div style={{ padding: '0' }}>
          {history.length === 0 ? (
            <div style={{ padding: '20px 14px', textAlign: 'center', color: 'var(--content-muted)', fontSize: 12, fontStyle: 'italic' }}>
              No packets sent or received yet.
            </div>
          ) : (
            <>
              <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                {history.map((entry) => (
                  <div key={entry.id} style={{
                    padding: '8px 14px', borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                  }}>
                    {/* Direction badge */}
                    <div style={{
                      flexShrink: 0, marginTop: 1, width: 22, height: 22, borderRadius: 6,
                      background: entry.direction === 'sent' ? 'rgba(56,189,248,0.15)' : 'rgba(74,222,128,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {entry.direction === 'sent'
                        ? <Send size={11} color="#38bdf8" />
                        : <ArrowDownLeft size={11} color="#4ade80" />
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--content-primary)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{entry.direction === 'sent' ? '→ ' : '← '}{entry.counterpartLabel}</span>
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                          background: entry.result === 'delivered' ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)',
                          color: entry.result === 'delivered' ? '#4ade80' : '#f87171',
                        }}>
                          {entry.result === 'delivered' ? '✓ OK' : '✕ FAIL'}
                        </span>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--content-muted)', marginTop: 1, display: 'flex', gap: 8 }}>
                        <span>{entry.hops} hop{entry.hops !== 1 ? 's' : ''}</span>
                        <span>{entry.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '6px 14px 10px', textAlign: 'right' }}>
                <button onClick={() => clearPacketHistory(node.id)} style={{ fontSize: 10, color: 'var(--content-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Clear history
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const Row = ({ label, value, mono, small, valueColor }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
    <span style={{ fontSize: 10, color: 'var(--content-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
    <span style={{ fontSize: small ? 9 : 11, color: valueColor || 'var(--content-primary)', fontWeight: 600, fontFamily: mono ? 'monospace' : 'inherit', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {value}
    </span>
  </div>
);

const labelStyle = { display: 'block', fontSize: 10, color: 'var(--content-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 };
const inputStyle = { width: '100%', background: 'var(--surface-root)', border: '1px solid var(--border-default)', borderRadius: 6, padding: '5px 8px', fontSize: 12, color: 'var(--content-primary)', outline: 'none', boxSizing: 'border-box' };

// Uses border + text color only — no dark backgrounds, works in both themes
const btnStyle = (color, bg) => ({
  display: 'flex', alignItems: 'center', gap: 4,
  background: bg || 'transparent',
  border: '1px solid ' + color,
  color: color,
  borderRadius: 6, padding: '4px 10px',
  fontSize: 11, fontWeight: 700,
  cursor: 'pointer', transition: 'all 0.15s',
});
