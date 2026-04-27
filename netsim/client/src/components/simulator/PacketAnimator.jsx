import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import useSimulatorStore from '../../store/useSimulatorStore';

/**
 * Sample N+1 evenly-spaced points along an SVG <path> element and convert them
 * from React Flow's flow-coordinate space to screen pixel space.
 */
function sampleEdgePath(edgeId, numSamples, viewport) {
  const edgeEl = document.querySelector('.react-flow__edge[data-id="' + edgeId + '"]');
  if (!edgeEl) return null;

  let pathEl = null;
  const paths = edgeEl.querySelectorAll('path');
  for (const p of paths) {
    const stroke = p.getAttribute('stroke');
    if (!stroke || stroke === 'transparent' || stroke === 'none') continue;
    if (p.getAttribute('stroke-dasharray') || p.style.animation) continue;
    pathEl = p;
    break;
  }
  if (!pathEl) {
    for (const p of paths) {
      const stroke = p.getAttribute('stroke');
      if (stroke && stroke !== 'transparent' && stroke !== 'none') { pathEl = p; break; }
    }
  }
  if (!pathEl && paths.length > 0) pathEl = paths[0];
  if (!pathEl) return null;

  const totalLen = pathEl.getTotalLength();
  if (totalLen === 0) return null;

  const points = [];
  for (let i = 0; i <= numSamples; i++) {
    const t = i / numSamples;
    const pt = pathEl.getPointAtLength(t * totalLen);
    points.push({
      x: pt.x * viewport.zoom + viewport.x,
      y: pt.y * viewport.zoom + viewport.y,
    });
  }
  return points;
}

function findEdge(edges, uId, vId) {
  return edges.find(
    (e) =>
      (e.source === uId && e.target === vId) ||
      (e.source === vId && e.target === uId)
  );
}

/** Interpolate a position along a polyline of points at progress t ∈ [0, 1]. */
function interpolatePath(points, t) {
  if (t <= 0) return points[0];
  if (t >= 1) return points[points.length - 1];
  const total = points.length - 1;
  const scaled = t * total;
  const idx = Math.floor(scaled);
  const frac = scaled - idx;
  const a = points[idx];
  const b = points[Math.min(idx + 1, points.length - 1)];
  return { x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac };
}

export default function PacketAnimator({ speed, src, dst, onComplete }) {
  // Only subscribe to addLog (stable fn reference) — NOT the whole store.
  // Subscribing to the whole store causes re-renders on every addLog() call.
  const addLog = useSimulatorStore((s) => s.addLog);
  const { getNode, getViewport } = useReactFlow();

  // The dot position driven by rAF — null means not animating yet
  const [dotPos, setDotPos] = useState(null);
  const [routeLabel, setRouteLabel] = useState(null);

  // rAF state kept in refs so we never trigger re-renders from inside the loop
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const pathPointsRef = useRef(null);
  const durationRef = useRef(0);
  const completedRef = useRef(false);

  const cancelRaf = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  useEffect(() => {
    // Clean up any previous animation
    cancelRaf();
    completedRef.current = false;
    startTimeRef.current = null;
    pathPointsRef.current = null;
    setDotPos(null);
    setRouteLabel(null);

    if (!src || !dst || src === dst) {
      addLog('error', 'Packet simulation requires two different source and destination devices.');
      onComplete?.();
      return;
    }

    // Read nodes & edges non-reactively — snapshot at send time only.
    const { nodes, edges } = useSimulatorStore.getState();

    const srcNode = nodes.find((n) => n.id === src);
    const dstNode = nodes.find((n) => n.id === dst);

    if (!srcNode || !dstNode) { onComplete?.(); return; }

    if (srcNode.data.status === 'offline') {
      addLog('error', srcNode.data.label + ' is OFFLINE — cannot send packet.');
      onComplete?.();
      return;
    }
    if (dstNode.data.status === 'offline') {
      addLog('warning', dstNode.data.label + ' is OFFLINE — packet may be dropped at destination.');
    }

    // ── BFS ──────────────────────────────────────────────────────────────────
    const adj = {};
    nodes.forEach((n) => (adj[n.id] = []));
    edges.forEach((e) => {
      if (!adj[e.source] || !adj[e.target]) return;
      if (e.data?.failed) return;
      adj[e.source].push(e.target);
      adj[e.target].push(e.source);
    });

    const queue = [[src]];
    const visited = new Set([src]);
    let finalPath = null;
    while (queue.length > 0) {
      const path = queue.shift();
      const cur = path[path.length - 1];
      if (cur === dst) { finalPath = path; break; }
      for (const nb of (adj[cur] || [])) {
        if (!visited.has(nb)) {
          const nbNode = nodes.find((n) => n.id === nb);
          if (nb !== dst && nbNode?.data?.status === 'offline') continue;
          visited.add(nb);
          queue.push([...path, nb]);
        }
      }
    }

    if (!finalPath) {
      addLog('error', 'No path: ' + srcNode.data.label + ' → ' + dstNode.data.label + ' — not connected!');
      onComplete?.();
      return;
    }

    const hops = finalPath.length - 1;
    addLog('info', 'Ping: ' + srcNode.data.label + ' (' + (srcNode.data.ip || '?') + ') → ' + dstNode.data.label + ' (' + (dstNode.data.ip || '?') + ')');
    addLog('info', 'Path: ' + finalPath.map((id) => nodes.find((n) => n.id === id)?.data?.label || id).join(' → '));

    // ── Build path points ────────────────────────────────────────────────────
    const SAMPLES_PER_HOP = 40;
    const speeds = { slow: 3000, normal: 1400, fast: 500 };
    const msPerHop = speeds[speed] || 1400;
    const totalMs = msPerHop * hops;

    const buildAndStart = () => {
      const viewport = getViewport();
      const allPoints = [];

      for (let i = 0; i < finalPath.length - 1; i++) {
        const uId = finalPath[i];
        const vId = finalPath[i + 1];
        const edge = findEdge(edges, uId, vId);

        let edgePoints = edge ? sampleEdgePath(edge.id, SAMPLES_PER_HOP, viewport) : null;

        if (!edgePoints || edgePoints.length === 0) {
          const uNode = getNode(uId);
          const vNode = getNode(vId);
          if (uNode && vNode) {
            edgePoints = [
              { x: (uNode.position.x + 60) * viewport.zoom + viewport.x, y: (uNode.position.y + 40) * viewport.zoom + viewport.y },
              { x: (vNode.position.x + 60) * viewport.zoom + viewport.x, y: (vNode.position.y + 40) * viewport.zoom + viewport.y },
            ];
          } else { continue; }
        }

        if (edge && edge.source === vId) {
          edgePoints = [...edgePoints].reverse();
        }

        if (i < finalPath.length - 2) {
          allPoints.push(...edgePoints.slice(0, -1));
        } else {
          allPoints.push(...edgePoints);
        }
      }

      if (allPoints.length < 2) {
        addLog('error', 'Could not compute animation path — please try again.');
        onComplete?.();
        return;
      }

      pathPointsRef.current = allPoints;
      durationRef.current = totalMs;

      setRouteLabel({ srcNode, dstNode, hops });
      setDotPos({ x: allPoints[0].x - 7, y: allPoints[0].y - 7 });

      // ── rAF loop — plays ONCE from t=0 to t=1, then stops ────────────────
      const tick = (timestamp) => {
        if (completedRef.current) return;

        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        const t = Math.min(elapsed / durationRef.current, 1);

        const pos = interpolatePath(pathPointsRef.current, t);
        setDotPos({ x: pos.x - 7, y: pos.y - 7 });

        if (t < 1) {
          // Still animating — schedule next frame
          rafRef.current = requestAnimationFrame(tick);
        } else {
          // Reached destination — done
          rafRef.current = null;
          completedRef.current = true;
          addLog('success', 'Packet delivered! ' + srcNode.data.label + ' → ' + dstNode.data.label + ' in ' + hops + ' hop' + (hops !== 1 ? 's' : '') + '.');
          setTimeout(() => onComplete?.('delivered', hops), 800);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    // Wait two frames so React Flow has rendered the edges
    requestAnimationFrame(() => requestAnimationFrame(buildAndStart));

    // Cleanup: cancel rAF if component unmounts mid-flight
    return () => cancelRaf();
  }, [src, dst]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!dotPos) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 50 }}>

      {/* ── Packet dot — positioned via inline style, driven by rAF ── */}
      <div
        style={{
          position: 'absolute',
          left: dotPos.x,
          top: dotPos.y,
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: '#38bdf8',
          boxShadow: '0 0 16px 5px rgba(56,189,248,0.85)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Route label (top center) ── */}
      {routeLabel && (
        <div style={{
          position: 'absolute',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15,23,42,0.92)',
          border: '1px solid var(--border-default)',
          borderRadius: 8,
          padding: '5px 14px',
          fontSize: 11,
          color: 'var(--content-secondary)',
          fontFamily: 'monospace',
          boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
          whiteSpace: 'nowrap',
        }}>
          <span style={{ color: '#38bdf8' }}>
            {routeLabel.srcNode.data.ip || routeLabel.srcNode.data.label}
          </span>
          {' ──► '}
          <span style={{ color: '#4ade80' }}>
            {routeLabel.dstNode.data.ip || routeLabel.dstNode.data.label}
          </span>
          <span style={{ color: 'var(--content-muted)', marginLeft: 8 }}>
            ({routeLabel.hops} hop{routeLabel.hops !== 1 ? 's' : ''})
          </span>
        </div>
      )}
    </div>
  );
}
