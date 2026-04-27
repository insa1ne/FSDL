import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useReactFlow, useViewport } from '@xyflow/react';
import useSimulatorStore from '../../store/useSimulatorStore';

/**
 * Sample N+1 evenly-spaced points along an SVG <path> element and convert them
 * from React Flow's flow-coordinate space to screen pixel space.
 *
 * React Flow draws edges inside a <g class="react-flow__viewport"> that has:
 *   transform: translate(viewport.x px, viewport.y px) scale(viewport.zoom)
 *
 * getPointAtLength() returns coordinates in the SVG element's local space
 * (which is the flow/canvas coordinate space). We convert by applying the
 * viewport transform: screenX = flowX * zoom + panX.
 */
function sampleEdgePath(edgeId, numSamples, viewport) {
  // React Flow renders: <g class="react-flow__edge" data-id="<edgeId>">
  //   <path />  ← animated/visible stroke
  //   <path />  ← invisible wide hit area (stroke="transparent")
  // We want the first non-transparent path.
  const edgeEl = document.querySelector('.react-flow__edge[data-id="' + edgeId + '"]');
  if (!edgeEl) return null;

  let pathEl = null;
  const paths = edgeEl.querySelectorAll('path');
  for (const p of paths) {
    const stroke = p.getAttribute('stroke');
    if (stroke && stroke !== 'transparent' && stroke !== 'none') {
      pathEl = p;
      break;
    }
  }
  // Fallback: use first path
  if (!pathEl && paths.length > 0) pathEl = paths[0];
  if (!pathEl) return null;

  const totalLen = pathEl.getTotalLength();
  if (totalLen === 0) return null;

  const points = [];
  for (let i = 0; i <= numSamples; i++) {
    const t = i / numSamples;
    const pt = pathEl.getPointAtLength(t * totalLen);
    // pt.x / pt.y are in flow-coordinate space → apply viewport transform
    points.push({
      x: pt.x * viewport.zoom + viewport.x,
      y: pt.y * viewport.zoom + viewport.y,
    });
  }
  return points;
}

/** Find the edge object connecting two node IDs (undirected). */
function findEdge(edges, uId, vId) {
  return edges.find(
    (e) =>
      (e.source === uId && e.target === vId) ||
      (e.source === vId && e.target === uId)
  );
}

export default function PacketAnimator({ speed, src, dst, onComplete }) {
  const { nodes, edges, addLog } = useSimulatorStore();
  const { getNode } = useReactFlow();
  const viewport = useViewport();

  const [animState, setAnimState] = useState(null);
  const [isLost, setIsLost] = useState(false);

  useEffect(() => {
    if (!src || !dst || src === dst) {
      addLog('error', 'Packet simulation requires two different source and destination devices.');
      onComplete?.();
      return;
    }

    const srcNode = nodes.find((n) => n.id === src);
    const dstNode = nodes.find((n) => n.id === dst);

    if (!srcNode || !dstNode) { onComplete?.(); return; }

    // Offline checks
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
    const linkStatus = {}; // 'u|v' → { failed, edgeId }
    nodes.forEach((n) => (adj[n.id] = []));
    edges.forEach((e) => {
      if (!adj[e.source] || !adj[e.target]) return;
      adj[e.source].push(e.target);
      adj[e.target].push(e.source);
      const link = { failed: e.data?.failed || false, id: e.id };
      linkStatus[e.source + '|' + e.target] = link;
      linkStatus[e.target + '|' + e.source] = link;
    });

    const queue = [[src]];
    const visited = new Set([src]);
    let finalPath = null;
    while (queue.length > 0) {
      const path = queue.shift();
      const cur = path[path.length - 1];
      if (cur === dst) { finalPath = path; break; }
      for (const nb of (adj[cur] || [])) {
        if (!visited.has(nb)) { visited.add(nb); queue.push([...path, nb]); }
      }
    }

    if (!finalPath) {
      addLog('error', 'No path: ' + srcNode.data.label + ' → ' + dstNode.data.label + ' — not connected!');
      onComplete?.();
      return;
    }

    addLog('info', 'Ping: ' + srcNode.data.label + ' (' + (srcNode.data.ip || '?') + ') → ' + dstNode.data.label + ' (' + (dstNode.data.ip || '?') + ')');
    addLog('info', 'Path: ' + finalPath.map((id) => nodes.find((n) => n.id === id)?.data?.label || id).join(' → '));

    // ── Build keyframes by sampling edge SVG paths ───────────────────────────
    // Use requestAnimationFrame to ensure React Flow has rendered the edges.
    const SAMPLES_PER_HOP = 40; // more = smoother curve tracing

    const buildKeyframes = () => {
      const allPoints = [];
      let failedAt = -1;
      let failedLinkLabel = '';

      for (let i = 0; i < finalPath.length - 1; i++) {
        const uId = finalPath[i];
        const vId = finalPath[i + 1];
        const linkKey = uId + '|' + vId;
        const link = linkStatus[linkKey];
        const edge = findEdge(edges, uId, vId);

        // Sample the actual SVG path of this edge
        let edgePoints = edge ? sampleEdgePath(edge.id, SAMPLES_PER_HOP, viewport) : null;

        if (!edgePoints || edgePoints.length === 0) {
          // Fallback: straight line between node centers
          const uNode = getNode(uId);
          const vNode = getNode(vId);
          if (uNode && vNode) {
            const uPx = { x: (uNode.position.x + 60) * viewport.zoom + viewport.x, y: (uNode.position.y + 40) * viewport.zoom + viewport.y };
            const vPx = { x: (vNode.position.x + 60) * viewport.zoom + viewport.x, y: (vNode.position.y + 40) * viewport.zoom + viewport.y };
            edgePoints = [uPx, vPx];
          } else {
            continue;
          }
        }

        // If the edge is oriented target→source in the DOM, reverse the sampled points
        // so the packet always travels in the BFS traversal direction (u → v).
        if (edge && edge.source === vId) {
          edgePoints = [...edgePoints].reverse();
        }

        if (link?.failed) {
          // Animate only to the midpoint of this link, then stop
          failedAt = i;
          const u = nodes.find((n) => n.id === uId);
          const v = nodes.find((n) => n.id === vId);
          failedLinkLabel = (u?.data.label || '?') + ' ↔ ' + (v?.data.label || '?');

          const half = Math.floor(edgePoints.length / 2);
          allPoints.push(...edgePoints.slice(0, half + 1));
          break;
        }

        // Add all but the last point (next hop starts at same position)
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

      setAnimState({
        keyframes: allPoints,
        failedAt,
        failedLinkLabel,
        srcNode,
        dstNode,
        hops: finalPath.length - 1,
      });
      setIsLost(false);
    };

    // Wait one animation frame so React Flow has rendered/updated the edges
    requestAnimationFrame(() => requestAnimationFrame(buildKeyframes));
  }, [src, dst]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!animState || animState.keyframes.length === 0) return null;

  const speeds = { slow: 3, normal: 1.4, fast: 0.5 };
  // Scale duration by actual number of keyframe points to keep visual speed consistent
  const totalPoints = animState.keyframes.length;
  const baseDur = (speeds[speed] || 1.4);
  // Approx: each hop gets `baseDur` seconds; more points doesn't mean slower
  const dur = baseDur * animState.hops;

  const startPt = animState.keyframes[0];
  const endPt   = animState.keyframes[animState.keyframes.length - 1];

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 50 }}>

      {/* ── Animated packet ── */}
      <motion.div
        key={src + dst + '-' + Date.now()}
        initial={{ x: startPt.x - 8, y: startPt.y - 8 }}
        animate={{
          x: animState.keyframes.map((p) => p.x - 8),
          y: animState.keyframes.map((p) => p.y - 8),
        }}
        transition={{ duration: dur, ease: 'linear' }}
        onAnimationComplete={() => {
          if (animState.failedAt !== -1) {
            setIsLost(true);
            addLog('error', 'Packet DROPPED — link is DOWN: ' + animState.failedLinkLabel);
          } else {
            addLog(
              'success',
              'Packet delivered! ' + animState.srcNode.data.label +
              ' → ' + animState.dstNode.data.label +
              ' in ' + animState.hops + ' hop' + (animState.hops !== 1 ? 's' : '') + '.'
            );
          }
          setTimeout(() => onComplete?.(), 1400);
        }}
        style={{
          position: 'absolute',
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: '#38bdf8',
          boxShadow: '0 0 16px 5px rgba(56,189,248,0.85)',
        }}
      />

      {/* ── Packet-lost popup ── */}
      {isLost && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          style={{
            position: 'absolute',
            left: endPt.x - 90,
            top: endPt.y + 20,
            background: '#450a0a',
            border: '1px solid #dc2626',
            borderRadius: 8,
            padding: '7px 14px',
            fontSize: 11,
            fontWeight: 700,
            color: '#fca5a5',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 24px rgba(220,38,38,0.5)',
          }}
        >
          ✕ Packet Lost — Link Down: {animState.failedLinkLabel}
        </motion.div>
      )}

      {/* ── Route label (top center) ── */}
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
          {animState.srcNode.data.ip || animState.srcNode.data.label}
        </span>
        {' ──► '}
        <span style={{ color: '#4ade80' }}>
          {animState.dstNode.data.ip || animState.dstNode.data.label}
        </span>
        <span style={{ color: 'var(--content-muted)', marginLeft: 8 }}>
          ({animState.hops} hop{animState.hops !== 1 ? 's' : ''})
        </span>
      </div>
    </div>
  );
}
