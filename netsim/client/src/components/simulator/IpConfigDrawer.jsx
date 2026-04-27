import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import useSimulatorStore from '../../store/useSimulatorStore';

const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$|^$/;

export default function IpConfigDrawer({ isOpen, onClose }) {
  const { nodes, updateNodeIp, autoAssignIps } = useSimulatorStore();
  const [baseIp, setBaseIp] = useState('192.168.1.0');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleAutoAssign = () => {
    if (baseIp && !ipRegex.test(baseIp)) {
      setErrorMsg('Invalid IP — example: 192.168.1.0');
      setSuccessMsg('');
      return;
    }
    setErrorMsg('');
    autoAssignIps(baseIp);
    setSuccessMsg('Assigned ' + nodes.length + ' IPs from ' + baseIp);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, height: '100%', width: 280,
      background: 'var(--surface-panel)', borderLeft: '1px solid var(--surface-card)',
      boxShadow: '-4px 0 30px rgba(0,0,0,0.6)',
      display: 'flex', flexDirection: 'column', zIndex: 50,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--surface-card)', borderBottom: '1px solid var(--border-default)',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--content-primary)' }}>
          IP Configuration
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--content-muted)' }}>
          <X size={16} />
        </button>
      </div>

      {/* Auto-assign */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--surface-card)', background: 'var(--surface-card)' }}>
        <label style={lbl}>Auto-Assign Base Network</label>
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          <input
            type="text"
            value={baseIp}
            onChange={(e) => { setBaseIp(e.target.value); setErrorMsg(''); }}
            placeholder="192.168.1.0"
            style={inp}
          />
          <button onClick={handleAutoAssign} style={{
            background: 'var(--accent-primary)', color: '#fff', border: 'none',
            borderRadius: 6, padding: '5px 10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
          }}>
            <RefreshCw size={11} /> Auto
          </button>
        </div>
        {errorMsg && <p style={{ fontSize: 11, color: '#f87171', margin: '4px 0 0' }}>{errorMsg}</p>}
        {successMsg && <p style={{ fontSize: 11, color: '#4ade80', margin: '4px 0 0' }}>✓ {successMsg}</p>}
        <p style={{ fontSize: 10, color: 'var(--border-default)', margin: '6px 0 0' }}>
          First device gets .1, second .2, etc.
        </p>
      </div>

      {/* Per-node list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
        <label style={{ ...lbl, marginBottom: 10 }}>Manual IP Assignment</label>
        {nodes.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--border-default)', fontStyle: 'italic' }}>
            No devices on canvas.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {nodes.map((node) => (
              <NodeIpRow key={node.id} node={node} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NodeIpRow({ node }) {
  const { updateNodeIp, isIpInUse, addLog } = useSimulatorStore();
  const [val, setVal] = useState(node.data.ip || '');
  const [err, setErr] = useState(false);

  useEffect(() => {
    setVal(node.data.ip || '');
  }, [node.data.ip]);

  const handleBlur = () => {
    if (val === node.data.ip) return;
    if (val && isIpInUse(val, node.id)) {
      addLog('error', `IP ${val} is already assigned to another device.`);
      setVal(node.data.ip || ''); 
      setErr(true);
      setTimeout(() => setErr(false), 2000);
      return;
    }
    if (val && !ipRegex.test(val)) {
      addLog('error', `Invalid IP format: ${val}`);
      setVal(node.data.ip || '');
      setErr(true);
      setTimeout(() => setErr(false), 2000);
      return;
    }
    updateNodeIp(node.id, val);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--content-muted)', fontWeight: 600, marginBottom: 3 }}>
        {node.data.label}
        <span style={{ color: 'var(--border-default)', fontWeight: 400 }}> — {node.type}</span>
      </div>
      <input
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="e.g. 192.168.1.1"
        style={{ ...inp, fontFamily: 'monospace', borderColor: err ? '#f87171' : 'var(--border-default)' }}
      />
    </div>
  );
}

const lbl = { display: 'block', fontSize: 10, color: 'var(--content-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 };
const inp = {
  width: '100%', background: 'var(--surface-root)', border: '1px solid var(--border-default)',
  borderRadius: 6, padding: '5px 8px', fontSize: 12, color: 'var(--content-primary)',
  outline: 'none', boxSizing: 'border-box',
};
