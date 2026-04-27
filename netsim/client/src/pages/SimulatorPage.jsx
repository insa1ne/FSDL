import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow, Background, ReactFlowProvider,
  useReactFlow, Controls, MiniMap,
  ControlButton,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Sidebar from '../components/Sidebar';
import useSimulatorStore from '../store/useSimulatorStore';
import { PCNode, RouterNode, SwitchNode } from '../components/simulator/Nodes';
import SimulationEdge from '../components/simulator/SimulationEdge';
import PacketAnimator from '../components/simulator/PacketAnimator';
import IpConfigDrawer from '../components/simulator/IpConfigDrawer';
import DevicePalette from '../components/simulator/DevicePalette';
import NodePropertiesPanel from '../components/simulator/NodePropertiesPanel';
import ActivityLog from '../components/simulator/ActivityLog';
import api from '../api/axios';
import {
  Star, GripHorizontal, Circle, Zap, Settings,
  Info, Trash2, RotateCcw, Send, ChevronDown, Save,
} from 'lucide-react';

const nodeTypes = { pc: PCNode, router: RouterNode, switch: SwitchNode };
const edgeTypes = { simEdge: SimulationEdge };

// ─── Toast ────────────────────────────────────────────────────────────────────
const toastStyles = {
  success: { bg: '#052e16', border: '#16a34a', text: '#4ade80' },
  error:   { bg: '#450a0a', border: '#dc2626', text: '#f87171' },
  info:    { bg: '#0c1a2e', border: '#3b82f6', text: '#93c5fd' },
  warning: { bg: '#1c1107', border: '#d97706', text: '#fcd34d' },
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div style={{
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    pointerEvents: 'none', userSelect: 'none',
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: 'var(--surface-card)', border: '1px solid var(--border-default)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px',
      }}>
        <svg width="28" height="28" fill="none" stroke="var(--content-muted)" strokeWidth={2} viewBox="0 0 24 24">
          <rect x="16" y="16" width="6" height="6" rx="1" />
          <rect x="2" y="16" width="6" height="6" rx="1" />
          <rect x="9" y="2" width="6" height="6" rx="1" />
          <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
          <path d="M12 12V8" />
        </svg>
      </div>
      <p style={{ color: 'var(--content-muted)', fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>Canvas is empty</p>
      <p style={{ color: 'var(--border-default)', fontSize: 13, maxWidth: 260 }}>
        Drag a device from the left panel, or click{' '}
        <span style={{ color: '#818cf8' }}>Star</span>,{' '}
        <span style={{ color: '#22d3ee' }}>Ring</span>, or{' '}
        <span style={{ color: '#f59e0b' }}>Bus</span> to generate a topology
      </p>
    </div>
  </div>
);

// ─── Packet send modal ────────────────────────────────────────────────────────
function PacketSendModal({ nodes, onSend, onClose }) {
  const [src, setSrc] = useState('');
  const [dst, setDst] = useState('');

  const send = () => {
    if (!src || !dst) return;
    onSend(src, dst);
    onClose();
  };

  const selStyle = {
    width: '100%', background: 'var(--surface-root)', border: '1px solid var(--border-default)',
    borderRadius: 6, padding: '6px 10px', color: 'var(--content-primary)', fontSize: 12,
    outline: 'none', cursor: 'pointer',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200,
    }}>
      <div style={{
        background: 'var(--surface-panel)', border: '1px solid var(--surface-card)',
        borderRadius: 16, padding: 24, width: 320,
        boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
      }}>
        <h3 style={{ color: 'var(--content-primary)', fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>
          Send Packet (Ping)
        </h3>
        <p style={{ color: 'var(--content-muted)', fontSize: 12, margin: '0 0 20px' }}>
          Select source and destination devices
        </p>

        <label style={labelSt}>Source Device</label>
        <select value={src} onChange={(e) => setSrc(e.target.value)} style={selStyle}>
          <option value="">Select source…</option>
          {nodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.data.label} {n.data.ip ? '(' + n.data.ip + ')' : ''}
            </option>
          ))}
        </select>

        <label style={{ ...labelSt, marginTop: 12 }}>Destination Device</label>
        <select value={dst} onChange={(e) => setDst(e.target.value)} style={selStyle}>
          <option value="">Select destination…</option>
          {nodes.filter((n) => n.id !== src).map((n) => (
            <option key={n.id} value={n.id}>
              {n.data.label} {n.data.ip ? '(' + n.data.ip + ')' : ''}
            </option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button
            onClick={send}
            disabled={!src || !dst}
            style={{
              flex: 1, padding: '8px 0', background: 'var(--accent-primary)', color: '#fff',
              border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
              cursor: src && dst ? 'pointer' : 'not-allowed',
              opacity: src && dst ? 1 : 0.5,
            }}
          >
            Send Packet
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px', background: 'var(--surface-card)', color: 'var(--content-secondary)',
              border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 13, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const labelSt = { display: 'block', fontSize: 11, color: 'var(--content-muted)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 };

// ─── Save Topology Modal ──────────────────────────────────────────────────────
function SaveTopologyModal({ defaultName, onSave, onClose }) {
  const [name, setName] = useState(defaultName || '');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim());
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200,
    }}>
      <div style={{
        background: 'var(--surface-panel)', border: '1px solid var(--surface-card)',
        borderRadius: 16, padding: 24, width: 340,
        boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
      }}>
        <h3 style={{ color: 'var(--content-primary)', fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>
          Save Topology
        </h3>
        <p style={{ color: 'var(--content-muted)', fontSize: 12, margin: '0 0 20px' }}>
          Give your network topology a name
        </p>

        <label style={labelSt}>Topology Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Campus Network v2"
          style={{
            width: '100%', background: 'var(--surface-root)', border: '1px solid var(--border-default)',
            borderRadius: 6, padding: '8px 10px', color: 'var(--content-primary)', fontSize: 13,
            outline: 'none', boxSizing: 'border-box',
          }}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />

        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            style={{
              flex: 1, padding: '8px 0', background: '#16a34a', color: '#fff',
              border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
              cursor: name.trim() ? 'pointer' : 'not-allowed',
              opacity: name.trim() ? 1 : 0.5,
            }}
          >
            Save
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px', background: 'var(--surface-card)', color: 'var(--content-secondary)',
              border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 13, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main canvas component ────────────────────────────────────────────────────
const SimulatorCanvas = () => {
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
    addNode, removeNode,
    generateStar, generateRing, generateBus, clearCanvas,
    setSelectedNode, selectedNodeId,
    addLog,
    currentTopologyId, currentTopologyName,
    setCurrentTopologyId, setCurrentTopologyName,
  } = useSimulatorStore();

  const { fitView, screenToFlowPosition } = useReactFlow();
  const reactFlowWrapper = useRef(null);

  const [speed, setSpeed] = useState('normal');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animSrc, setAnimSrc] = useState(null);
  const [animDst, setAnimDst] = useState(null);
  const [isIpDrawerOpen, setIsIpDrawerOpen] = useState(false);
  const [showPacketModal, setShowPacketModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [dragType, setDragType] = useState(null);

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Keyboard: Delete selected node or edge ──
  useEffect(() => {
    const handler = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        // Only if not typing in an input
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
        removeNode(selectedNodeId);
        showToast('Node deleted', 'info');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNodeId, removeNode, showToast]);

  // ── Drag-drop from palette ──
  const onDragStart = (event, type) => {
    setDragType(type);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    if (!dragType) return;

    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!bounds) return;

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    addNode(dragType, { x: position.x - 60, y: position.y - 40 });
    setDragType(null);
  }, [dragType, addNode, screenToFlowPosition]);

  // ── Topology generators ──
  const handleGenerate = (type) => {
    if (type === 'star')  { generateStar();  showToast('Star topology — 1 switch, 6 PCs', 'success'); }
    if (type === 'ring')  { generateRing();  showToast('Ring topology — 6 PCs in a loop', 'success'); }
    if (type === 'bus')   { generateBus();   showToast('Bus topology — 5 PCs in a chain', 'success'); }
    setTimeout(() => fitView({ padding: 0.22, duration: 800 }), 80);
  };

  // ── Packet send ──
  const handleSendPacket = () => {
    if (nodes.length < 2) {
      showToast('Add at least 2 devices to the canvas first', 'error');
      addLog('error', 'Need at least 2 devices to simulate packet transfer.');
      return;
    }
    setShowPacketModal(true);
  };

  const startAnimation = (src, dst) => {
    setIsAnimating(false);
    setAnimSrc(src);
    setAnimDst(dst);
    setTimeout(() => setIsAnimating(true), 60);
  };

  // ── Save topology ──
  const handleSaveTopology = async (name) => {
    if (nodes.length === 0) {
      showToast('Cannot save an empty topology', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const nodesJson = JSON.stringify(nodes);
      const edgesJson = JSON.stringify(edges);

      if (currentTopologyId) {
        // Update existing topology
        const res = await api.put('/topologies/' + currentTopologyId, { name, nodesJson, edgesJson });
        setCurrentTopologyName(name);
        showToast('Topology "' + name + '" updated!', 'success');
        addLog('success', 'Topology "' + name + '" saved to server (updated).');
      } else {
        // Create new topology
        const res = await api.post('/topologies', { name, nodesJson, edgesJson });
        setCurrentTopologyId(res.data.id);
        setCurrentTopologyName(name);
        showToast('Topology "' + name + '" saved!', 'success');
        addLog('success', 'Topology "' + name + '" saved to server (new).');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save topology.';
      showToast(msg, 'error');
      addLog('error', 'Save failed: ' + msg);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Canvas click (deselect) ──
  const onPaneClick = () => setSelectedNode(null);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'absolute', bottom: 180, left: '50%',
          transform: 'translateX(-50%)', zIndex: 300,
          background: toastStyles[toast.type].bg,
          border: '1px solid ' + toastStyles[toast.type].border,
          color: toastStyles[toast.type].text,
          padding: '9px 20px', borderRadius: 10, fontSize: 13,
          fontWeight: 600, boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Save Topology Modal ── */}
      {showSaveModal && (
        <SaveTopologyModal
          defaultName={currentTopologyName}
          onSave={handleSaveTopology}
          onClose={() => setShowSaveModal(false)}
        />
      )}

      {/* ── Send Packet Modal ── */}
      {showPacketModal && (
        <PacketSendModal
          nodes={nodes}
          onSend={(src, dst) => startAnimation(src, dst)}
          onClose={() => setShowPacketModal(false)}
        />
      )}

      {/* ── Top Toolbar ── */}
      <div style={{
        height: 56, background: 'var(--surface-panel)', borderBottom: '1px solid var(--surface-card)',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12,
        position: 'relative', zIndex: 10, flexShrink: 0,
      }}>
        {/* Topology presets */}
        <div style={{ display: 'flex', gap: 2, background: 'var(--surface-card)', borderRadius: 8, padding: 3, border: '1px solid var(--border-default)' }}>
          {[
            { id: 'star', label: 'Star', color: '#818cf8', Icon: Star },
            { id: 'ring', label: 'Ring', color: '#22d3ee', Icon: Circle },
            { id: 'bus',  label: 'Bus',  color: '#f59e0b', Icon: GripHorizontal },
          ].map(({ id, label, color, Icon }) => (
            <button key={id} onClick={() => handleGenerate(id)}
              title={'Generate ' + label + ' topology'}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 6, border: 'none',
                background: 'transparent', color: 'var(--content-secondary)', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border-default)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--content-secondary)'; }}
            >
              <Icon size={13} color={color} />
              {label}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--surface-card)' }} />

        {/* Clear button */}
        <button onClick={clearCanvas}
          title="Clear canvas"
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', borderRadius: 7,
            background: 'var(--surface-card)', border: '1px solid var(--border-default)',
            color: 'var(--content-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = '#7f1d1d'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--content-secondary)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
        >
          <Trash2 size={13} /> Clear
        </button>

        <div style={{ flex: 1 }} />

        {/* Speed picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--content-muted)', fontWeight: 600 }}>Speed</span>
          <div style={{ display: 'flex', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 7, overflow: 'hidden' }}>
            {['slow', 'normal', 'fast'].map((s) => (
              <button key={s} onClick={() => setSpeed(s)} style={{
                padding: '4px 9px',
                background: speed === s ? 'var(--accent-primary)' : 'transparent',
                color: speed === s ? '#fff' : 'var(--content-muted)',
                border: 'none', fontSize: 11, fontWeight: 600,
                cursor: 'pointer', textTransform: 'capitalize',
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Send Packet */}
        <button onClick={handleSendPacket}
          disabled={isAnimating}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 8,
            background: isAnimating ? '#312e81' : 'var(--accent-primary)',
            color: '#fff', border: 'none', fontSize: 12, fontWeight: 700,
            cursor: isAnimating ? 'default' : 'pointer',
            boxShadow: '0 0 14px rgba(79,70,229,0.4)',
            opacity: isAnimating ? 0.7 : 1,
          }}>
          <Zap size={13} />
          {isAnimating ? 'Sending…' : 'Ping / Send Packet'}
        </button>

        {/* Save Topology */}
        <button
          onClick={() => {
            if (nodes.length === 0) {
              showToast('Cannot save an empty topology', 'error');
              return;
            }
            setShowSaveModal(true);
          }}
          disabled={isSaving}
          title="Save topology to server"
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', borderRadius: 7,
            background: '#052e16', border: '1px solid #16a34a',
            color: '#4ade80', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            opacity: isSaving ? 0.6 : 1,
          }}
        >
          <Save size={13} /> {isSaving ? 'Saving…' : (currentTopologyId ? 'Update' : 'Save')}
        </button>

        {/* IP Config */}
        <button onClick={() => setIsIpDrawerOpen(true)}
          title="IP Configuration"
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', borderRadius: 7,
            background: 'var(--surface-card)', border: '1px solid var(--border-default)',
            color: 'var(--content-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
          <Settings size={13} /> IP Config
        </button>

        <button onClick={() => fitView({ padding: 0.2, duration: 600 })}
          title="Fit to view"
          style={{
            padding: '5px 8px', borderRadius: 7,
            background: 'var(--surface-card)', border: '1px solid var(--border-default)',
            color: 'var(--content-muted)', cursor: 'pointer', display: 'flex',
          }}>
          <RotateCcw size={13} />
        </button>
      </div>

      {/* ── Hint strip ── */}
      {nodes.length > 0 && (
        <div style={{
          padding: '4px 16px', background: 'var(--surface-panel)', borderBottom: '1px solid var(--surface-card)',
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--border-default)', flexShrink: 0,
        }}>
          <Info size={11} color="var(--content-muted)" />
          <span>
            <b style={{ color: 'var(--content-muted)' }}>{nodes.length}</b> devices &nbsp;·&nbsp;
            <b style={{ color: 'var(--content-muted)' }}>{edges.length}</b> links &nbsp;·&nbsp;
            Click an edge to toggle link failure &nbsp;·&nbsp;
            Click a node to inspect &nbsp;·&nbsp;
            <span style={{ color: 'var(--border-default)' }}>Delete key removes selected device</span>
          </span>
        </div>
      )}

      {/* ── Middle row: Palette + Canvas ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Device Palette */}
        <DevicePalette onDragStart={onDragStart} />

        {/* Canvas */}
        <div
          ref={reactFlowWrapper}
          style={{ flex: 1, position: 'relative' }}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {nodes.length === 0 && <EmptyState />}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            proOptions={{ hideAttribution: true }}
            style={{ background: 'var(--surface-root)' }}
            fitViewOptions={{ padding: 0.2 }}
            deleteKeyCode={null}   // handled manually above
            connectionLineStyle={{ stroke: '#818cf8', strokeWidth: 2, strokeDasharray: '4 3' }}
            connectionLineType="bezier"
          >
            <Background color="#0d1f38" gap={22} size={1} />
            <Controls
              position="bottom-right"
              showInteractive={false}
              style={{ bottom: 16, right: 16 }}
            />
            <MiniMap
              position="bottom-right"
              nodeColor={(n) => {
                if (n.type === 'router') return '#f59e0b';
                if (n.type === 'switch') return '#2dd4bf';
                return '#818cf8';
              }}
              maskColor="rgba(2,8,23,0.75)"
              style={{ marginBottom: 110, marginRight: 0 }}
            />
          </ReactFlow>

          {/* Packet Animation */}
          {isAnimating && animSrc && animDst && (
            <PacketAnimator
              speed={speed}
              src={animSrc}
              dst={animDst}
              onComplete={() => {
                setIsAnimating(false);
              }}
            />
          )}

          {/* Node Properties Panel (overlaid on canvas) */}
          {selectedNodeId && <NodePropertiesPanel />}
        </div>

        {/* IP Config Drawer */}
        <IpConfigDrawer isOpen={isIpDrawerOpen} onClose={() => setIsIpDrawerOpen(false)} />
      </div>

      {/* ── Activity Log ── */}
      <ActivityLog height={160} />
    </div>
  );
};

export default function SimulatorPage() {
  return (
    <div style={{ display: 'flex', background: 'var(--surface-root)', minHeight: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <ReactFlowProvider>
        <SimulatorCanvas />
      </ReactFlowProvider>
    </div>
  );
}
