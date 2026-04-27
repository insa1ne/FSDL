import React from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';
import useSimulatorStore from '../../store/useSimulatorStore';

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
          stroke: isFailed ? '#ef4444' : 'var(--border-default)',
        }}
        interactionWidth={20}
      />

      {/* Animated dash overlay when active */}
      {isActive && (
        <path
          d={edgePath}
          fill="transparent"
          strokeWidth={3}
          stroke="#818cf8"
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
            }}
            className="px-2 py-1 bg-red-950 border border-red-500 rounded text-[10px] font-bold text-red-400 cursor-pointer select-none"
            onClick={() => toggleEdgeFailure(id)}
          >
            ⚠ LINK DOWN
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
