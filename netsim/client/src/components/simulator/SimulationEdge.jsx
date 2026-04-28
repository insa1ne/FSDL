import React from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';
import useSimulatorStore from '../../store/useSimulatorStore';
import useThemeStore from '../../store/useThemeStore';

export default function SimulationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const toggleEdgeFailure = useSimulatorStore((state) => state.toggleEdgeFailure);
  const theme = useThemeStore((s) => s.theme);
  const edgeBaseColor = theme === 'dark' ? '#475569' : '#94a3b8';

  const isFailed = data?.failed || false;
  const isActive = data?.active !== false && !isFailed;

  return (
    <>
      {/* Base grey/red background edge */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: 3,
          stroke: isFailed ? '#ef4444' : edgeBaseColor,
        }}
        interactionWidth={20}
      />

      {/* Animated dash overlay when active */}
      {isActive && (
        <path
          d={edgePath}
          fill="transparent"
          strokeWidth={3}
          stroke={theme === 'dark' ? '#818cf8' : '#4f46e5'}
          strokeDasharray="6 4"
          style={{ animation: 'dash 1.2s linear infinite' }}
        />
      )}

      {/* Invisible wide clickable overlay */}
      <path
        d={edgePath}
        fill="transparent"
        strokeWidth={30}
        stroke="transparent"
        style={{ cursor: 'pointer' }}
        onClick={() => toggleEdgeFailure(id)}
      />

      {isFailed && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              padding: '2px 8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              borderRadius: '4px',
              color: '#ef4444',
              fontSize: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              userSelect: 'none',
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => toggleEdgeFailure(id)}
          >
            ⚠ LINK DOWN
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
