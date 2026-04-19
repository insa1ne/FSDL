import React, { useState } from 'react';
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
      background: '#0f172a', borderLeft: '1px solid #1e293b',
      boxShadow: '-4px 0 30px rgba(0,0,0,0.6)',
      display: 'flex', flexDirection: 'column', zIndex: 50,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        background: '#1e293b', borderBottom: '1px solid #334155',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
          IP Configuration
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
          <X size={16} />
        </button>
      </div>

      {/* Auto-assign */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #1e293b', background: 'rgba(30,41,59,0.3)' }}>
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
            background: '#4f46e5', color: '#fff', border: 'none',
            borderRadius: 6, padding: '5px 10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
          }}>
            <RefreshCw size={11} /> Auto
          </button>
        </div>
        {errorMsg && <p style={{ fontSize: 11, color: '#f87171', margin: '4px 0 0' }}>{errorMsg}</p>}
        {successMsg && <p style={{ fontSize: 11, color: '#4ade80', margin: '4px 0 0' }}>✓ {successMsg}</p>}
        <p style={{ fontSize: 10, color: '#334155', margin: '6px 0 0' }}>
          First device gets .1, second .2, etc.
        </p>
      </div>

      {/* Per-node list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
        <label style={{ ...lbl, marginBottom: 10 }}>Manual IP Assignment</label>
        {nodes.length === 0 ? (
          <p style={{ fontSize: 12, color: '#334155', fontStyle: 'italic' }}>
            No devices on canvas.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {nodes.map((node) => (
              <div key={node.id}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 3 }}>
                  {node.data.label}
                  <span style={{ color: '#334155', fontWeight: 400 }}> — {node.type}</span>
                </div>
                <input
                  type="text"
                  value={node.data.ip || ''}
                  onChange={(e) => updateNodeIp(node.id, e.target.value)}
                  placeholder="e.g. 192.168.1.1"
                  style={{ ...inp, fontFamily: 'monospace' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const lbl = { display: 'block', fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 };
const inp = {
  width: '100%', background: '#020817', border: '1px solid #334155',
  borderRadius: 6, padding: '5px 8px', fontSize: 12, color: '#e2e8f0',
  outline: 'none', boxSizing: 'border-box',
};
