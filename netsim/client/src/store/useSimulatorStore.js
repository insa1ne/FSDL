import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';

let nodeCounter = 1;

const getNextId = (type) => {
  return type + '-' + (nodeCounter++);
};

const validateConnection = (sourceType, targetType) => {
  // Rules: PC-to-PC direct is Layer-1 warning (possible but not recommended)
  // Router-to-Router is fine (WAN link)
  // Everything else is OK
  if (sourceType === 'pc' && targetType === 'pc') {
    return { valid: true, warning: 'Direct PC-to-PC connection (crossover cable). Consider using a switch.' };
  }
  return { valid: true, warning: null };
};

const useSimulatorStore = create((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  activityLog: [],
  packetSource: null,   // node id for packet source
  packetTarget: null,   // node id for packet target
  currentTopologyId: null,   // id from backend (null = unsaved)
  currentTopologyName: '',   // name of the current topology

  // ─── Load a saved topology into the canvas ──────────────────────────────────
  loadTopology: (nodes, edges, id, name) => {
    // Find the highest node counter from loaded nodes
    let maxCounter = 0;
    nodes.forEach((n) => {
      const parts = n.id.split('-');
      const num = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(num) && num > maxCounter) maxCounter = num;
    });
    nodeCounter = maxCounter + 1;

    set({
      nodes,
      edges,
      selectedNodeId: null,
      currentTopologyId: id || null,
      currentTopologyName: name || '',
    });
    get().addLog('info', 'Topology "' + (name || 'Untitled') + '" loaded.');
  },

  setCurrentTopologyId: (id) => set({ currentTopologyId: id }),
  setCurrentTopologyName: (name) => set({ currentTopologyName: name }),


  // ─── React Flow handlers ───────────────────────────────────────────────────

  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) }),

  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges) }),

  onConnect: (connection) => {
    const sourceNode = get().nodes.find((n) => n.id === connection.source);
    const targetNode = get().nodes.find((n) => n.id === connection.target);

    if (!sourceNode || !targetNode) return;

    if (connection.source === connection.target) {
      get().addLog('error', 'Cannot connect a device to itself.');
      return;
    }

    // Check duplicate edge
    const exists = get().edges.some(
      (e) =>
        (e.source === connection.source && e.target === connection.target) ||
        (e.source === connection.target && e.target === connection.source)
    );
    if (exists) {
      get().addLog('warning', sourceNode.data.label + ' ↔ ' + targetNode.data.label + ': Link already exists.');
      return;
    }

    const { valid, warning } = validateConnection(sourceNode.type, targetNode.type);
    if (warning) {
      get().addLog('warning', warning);
    }

    const edgeId = 'e-' + connection.source + '-' + connection.target;
    set({
      edges: addEdge(
        { ...connection, id: edgeId, type: 'simEdge', data: { active: true, failed: false } },
        get().edges
      ),
    });
    get().addLog('success', 'Link connected: ' + sourceNode.data.label + ' ↔ ' + targetNode.data.label);
  },

  // ─── Node management ──────────────────────────────────────────────────────

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (type, position) => {
    const id = getNextId(type);
    const labels = { pc: 'PC', router: 'Router', switch: 'Switch' };
    const label = labels[type] + ' ' + id.split('-')[1];

    const node = {
      id,
      type,
      position,
      data: { label, ip: '', hostname: label, status: 'online' },
    };

    const nextIp = get().getNextAvailableIp();
    node.data.ip = nextIp;

    set({ nodes: [...get().nodes, node] });
    get().addLog('info', label + ' added to canvas. IP auto-assigned: ' + nextIp);
    return id;
  },

  removeNode: (nodeId) => {
    const node = get().nodes.find((n) => n.id === nodeId);
    if (!node) return;
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      ),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    });
    get().addLog('info', node.data.label + ' removed from canvas.');
  },

  removeEdge: (edgeId) => {
    const edge = get().edges.find((e) => e.id === edgeId);
    if (!edge) return;
    const src = get().nodes.find((n) => n.id === edge.source);
    const tgt = get().nodes.find((n) => n.id === edge.target);
    set({ edges: get().edges.filter((e) => e.id !== edgeId) });
    if (src && tgt) {
      get().addLog('info', 'Link removed: ' + src.data.label + ' ↔ ' + tgt.data.label);
    }
  },

  updateNodeData: (nodeId, updates) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...updates } } : n
      ),
    });
  },

  updateNodeIp: (nodeId, newIp) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ip: newIp } } : n
      ),
    });
  },

  toggleEdgeFailure: (edgeId) => {
    const edge = get().edges.find((e) => e.id === edgeId);
    if (!edge) return;
    const willFail = !edge.data?.failed;
    const src = get().nodes.find((n) => n.id === edge.source);
    const tgt = get().nodes.find((n) => n.id === edge.target);

    set({
      edges: get().edges.map((e) =>
        e.id === edgeId ? { ...e, data: { ...e.data, failed: willFail } } : e
      ),
    });

    const label = src && tgt ? src.data.label + ' ↔ ' + tgt.data.label : edgeId;
    if (willFail) {
      get().addLog('error', 'Link DOWN: ' + label + '. Interface disconnected.');
    } else {
      get().addLog('success', 'Link UP: ' + label + '. Interface reconnected.');
    }
  },

  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

  // ─── IP helpers ───────────────────────────────────────────────────────────

  getNextAvailableIp: () => {
    const used = new Set(get().nodes.map((n) => n.data.ip).filter(Boolean));
    let suffix = 1;
    while (used.has('192.168.1.' + suffix)) suffix++;
    return '192.168.1.' + suffix;
  },

  autoAssignIps: (baseIp) => {
    if (!baseIp) baseIp = '192.168.1.0';
    const lastDot = baseIp.lastIndexOf('.');
    const prefix = baseIp.substring(0, lastDot);

    const newNodes = get().nodes.map((n, i) => ({
      ...n,
      data: { ...n.data, ip: prefix + '.' + (i + 1) },
    }));
    set({ nodes: newNodes });
    get().addLog('success', 'Auto-assigned IPs to ' + newNodes.length + ' devices using base ' + baseIp);
  },

  isIpInUse: (ip, excludeNodeId) => {
    if (!ip) return false;
    return get().nodes.some((n) => n.id !== excludeNodeId && n.data.ip === ip);
  },

  // ─── Packet source/target ─────────────────────────────────────────────────

  setPacketSource: (id) => set({ packetSource: id }),
  setPacketTarget: (id) => set({ packetTarget: id }),

  // ─── Activity log ─────────────────────────────────────────────────────────

  addLog: (type, message) => {
    const entry = {
      id: Date.now() + Math.random(),
      type,      // 'info' | 'success' | 'warning' | 'error'
      message,
      time: new Date().toLocaleTimeString(),
    };
    set({ activityLog: [entry, ...get().activityLog].slice(0, 100) });
  },

  clearLog: () => set({ activityLog: [] }),

  // ─── Topology generators ──────────────────────────────────────────────────

  clearCanvas: () => {
    nodeCounter = 1;
    set({ nodes: [], edges: [], selectedNodeId: null, currentTopologyId: null, currentTopologyName: '' });
    get().addLog('info', 'Canvas cleared.');
  },

  generateStar: () => {
    nodeCounter = 1;
    const cx = 400, cy = 300, r = 200;
    const numPCs = 6;

    const centerNode = {
      id: 'switch-1',
      type: 'switch',
      position: { x: cx - 60, y: cy - 40 },
      data: { label: 'Switch 1', ip: '192.168.1.1', hostname: 'SW1', status: 'online' },
    };

    const newNodes = [centerNode];
    const newEdges = [];
    nodeCounter = 2;

    for (let i = 0; i < numPCs; i++) {
      const angle = (i * 2 * Math.PI) / numPCs;
      const x = cx + r * Math.cos(angle) - 60;
      const y = cy + r * Math.sin(angle) - 40;
      const pcId = 'pc-' + (i + 1);
      const ipSuffix = i + 2;

      newNodes.push({
        id: pcId,
        type: 'pc',
        position: { x, y },
        data: { label: 'PC ' + (i + 1), ip: '192.168.1.' + ipSuffix, hostname: 'PC' + (i + 1), status: 'online' },
      });

      newEdges.push({
        id: 'e-' + pcId + '-switch-1',
        source: pcId,
        target: 'switch-1',
        sourceHandle: 'bottom',
        targetHandle: 'top-t',
        type: 'simEdge',
        data: { active: true, failed: false },
      });
    }

    nodeCounter = 10;
    set({ nodes: newNodes, edges: newEdges, selectedNodeId: null });
    get().addLog('success', 'Star topology generated — 1 switch, 6 PCs.');
  },

  generateRing: () => {
    nodeCounter = 1;
    const cx = 400, cy = 300, r = 200;
    const numPCs = 6;
    const newNodes = [];
    const newEdges = [];

    for (let i = 0; i < numPCs; i++) {
      const angle = (i * 2 * Math.PI) / numPCs;
      const x = cx + r * Math.cos(angle) - 60;
      const y = cy + r * Math.sin(angle) - 40;
      const pcId = 'pc-' + (i + 1);

      newNodes.push({
        id: pcId,
        type: 'pc',
        position: { x, y },
        data: { label: 'PC ' + (i + 1), ip: '192.168.1.' + (i + 1), hostname: 'PC' + (i + 1), status: 'online' },
      });

      const prevId = 'pc-' + (i === 0 ? numPCs : i);
      newEdges.push({
        id: 'e-' + prevId + '-' + pcId,
        source: prevId,
        target: pcId,
        sourceHandle: 'right',
        targetHandle: 'left-t',
        type: 'simEdge',
        data: { active: true, failed: false },
      });
    }

    nodeCounter = 10;
    set({ nodes: newNodes, edges: newEdges, selectedNodeId: null });
    get().addLog('success', 'Ring topology generated — 6 PCs in a ring.');
  },

  generateBus: () => {
    nodeCounter = 1;
    const numPCs = 5;
    const spacingX = 160;
    const startX = 60;
    const y = 260;
    const newNodes = [];
    const newEdges = [];

    for (let i = 0; i < numPCs; i++) {
      const pcId = 'pc-' + (i + 1);
      newNodes.push({
        id: pcId,
        type: 'pc',
        position: { x: startX + i * spacingX, y },
        data: { label: 'PC ' + (i + 1), ip: '192.168.1.' + (i + 1), hostname: 'PC' + (i + 1), status: 'online' },
      });

      if (i > 0) {
        const prevId = 'pc-' + i;
        newEdges.push({
          id: 'e-' + prevId + '-' + pcId,
          source: prevId,
          target: pcId,
          sourceHandle: 'right',
          targetHandle: 'left-t',
          type: 'simEdge',
          data: { active: true, failed: false },
        });
      }
    }

    nodeCounter = 10;
    set({ nodes: newNodes, edges: newEdges, selectedNodeId: null });
    get().addLog('success', 'Bus topology generated — 5 PCs in a chain.');
  },
}));

export default useSimulatorStore;
