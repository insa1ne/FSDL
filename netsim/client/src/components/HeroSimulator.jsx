import React, { useEffect, useState } from 'react';
import { ReactFlow, Background, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import { Monitor, Router as RouterIcon } from 'lucide-react';

// Hero node — completely inline styles to avoid any tailwind template literal issues
const HeroNode = ({ data }) => (
  <div
    style={{
      padding: 12,
      borderRadius: 10,
      border: '1px solid',
      borderColor: data.type === 'switch' ? '#4338ca' : '#334155',
      background: data.type === 'switch' ? '#1e1b4b' : '#1e293b',
      color: data.type === 'switch' ? '#818cf8' : '#cbd5e1',
      boxShadow: data.type === 'switch' ? '0 0 16px rgba(99,102,241,0.4)' : '0 2px 8px rgba(0,0,0,0.5)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      width: 80,
      height: 76,
      justifyContent: 'center',
    }}
  >
    {data.type === 'switch' ? <RouterIcon size={26} /> : <Monitor size={22} />}
    <span style={{ fontSize: 11, fontWeight: 600 }}>{data.label}</span>
  </div>
);

const nodeTypes = { heroNode: HeroNode };

const initialNodes = [
  { id: 'center', type: 'heroNode', position: { x: 220, y: 130 }, data: { label: 'Switch', type: 'switch' } },
  { id: 'pc1', type: 'heroNode', position: { x: 60,  y: 20  }, data: { label: 'PC 1' } },
  { id: 'pc2', type: 'heroNode', position: { x: 380, y: 20  }, data: { label: 'PC 2' } },
  { id: 'pc3', type: 'heroNode', position: { x: 60,  y: 240 }, data: { label: 'PC 3' } },
  { id: 'pc4', type: 'heroNode', position: { x: 380, y: 240 }, data: { label: 'PC 4' } },
];

const initialEdges = [
  { id: 'e1', source: 'pc1', target: 'center', animated: true, style: { stroke: '#818cf8', strokeWidth: 2 } },
  { id: 'e2', source: 'pc2', target: 'center', animated: true, style: { stroke: '#818cf8', strokeWidth: 2 } },
  { id: 'e3', source: 'pc3', target: 'center', animated: true, style: { stroke: '#818cf8', strokeWidth: 2 } },
  { id: 'e4', source: 'pc4', target: 'center', animated: true, style: { stroke: '#818cf8', strokeWidth: 2 } },
];

// Repeating keyframe sequence: pc1 → center → pc2, then pc3 → center → pc4
const packetPaths = [
  { x: [105, 260, 425], y: [56, 166, 56] },
  { x: [105, 260, 425], y: [276, 166, 276] },
];

export default function HeroSimulator() {
  const [nodes] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);
  const [pathIdx, setPathIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPathIdx((prev) => (prev + 1) % packetPaths.length);
      setAnimKey((k) => k + 1);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const path = packetPaths[pathIdx];

  return (
    <div
      style={{
        width: '100%',
        height: 400,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid #1e293b',
        boxShadow: '0 0 40px -15px rgba(79,70,229,0.4)',
        position: 'relative',
      }}
    >
      {/* Gradient overlay bottom */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent 60%, rgba(2,8,23,0.85))',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
        style={{ background: '#020817' }}
      >
        <Background color="#1e293b" gap={16} />
      </ReactFlow>

      {/* Floating animated packet dot */}
      <motion.div
        key={animKey}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#38bdf8',
          boxShadow: '0 0 12px 4px rgba(56,189,248,0.7)',
          zIndex: 20,
          pointerEvents: 'none',
        }}
        animate={{ x: path.x, y: path.y, opacity: [0, 1, 1, 1, 0] }}
        transition={{ duration: 2.5, ease: 'easeInOut' }}
      />
    </div>
  );
}
