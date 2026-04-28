import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Loader2, RefreshCw } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import useSimulatorStore from '../store/useSimulatorStore';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [topologies, setTopologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTopologies = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/topologies');
      setTopologies(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please sign in again.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot reach server. Make sure the backend is running on port 3001.');
      } else {
        setError(err.response?.data?.message || 'Failed to load topologies.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchTopologies();
  }, [fetchTopologies]);

  // Re-fetch whenever the user focuses this tab/window (e.g. after saving in simulator)
  useEffect(() => {
    const onFocus = () => fetchTopologies();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchTopologies]);

  const loadTopology = (topology) => {
    try {
      const nodes = JSON.parse(topology.nodesJson);
      const edges = JSON.parse(topology.edgesJson);
      const store = useSimulatorStore.getState();
      store.loadTopology(nodes, edges, topology.id, topology.name);
      navigate('/simulator');
    } catch (err) {
      navigate('/simulator');
    }
  };

  const deleteTopology = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this topology?')) return;
    try {
      await api.delete('/topologies/' + id);
      setTopologies((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError('Failed to delete topology.');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return diffMins + ' min ago';
    if (diffHours < 24) return diffHours + 'h ago';
    if (diffDays < 7) return diffDays + 'd ago';
    return date.toLocaleDateString();
  };

  const getNodeCount = (topology) => {
    try { return JSON.parse(topology.nodesJson).length; }
    catch { return 0; }
  };

  const sgFont = { fontFamily: "'Space Grotesk', sans-serif" };

  return (
    <div className="flex min-h-screen" style={{ background: 'transparent' }}>
      <Sidebar />

      <main className="flex-1 p-16" style={{ marginLeft: 256 }}>
        {/* Header */}
        <header className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-semibold mb-1"
              style={{ ...sgFont, color: 'var(--content-primary)', letterSpacing: '-0.02em' }}>
              Saved Topologies
            </h2>
            <p className="text-sm" style={{ color: 'var(--content-secondary)' }}>
              {loading ? 'Loading…' : `${topologies.length} topology${topologies.length !== 1 ? 's' : ''} saved`}
            </p>
          </div>
          <div className="flex gap-3">
            {/* Refresh */}
            <button
              onClick={fetchTopologies}
              disabled={loading}
              className="glass-panel px-4 py-2 rounded flex items-center gap-2 text-sm transition-all hover:opacity-80 disabled:opacity-50"
              style={{ color: 'var(--content-primary)', ...sgFont }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {/* Go to simulator */}
            <button
              onClick={() => navigate('/simulator')}
              className="btn-primary-gradient px-5 py-2 rounded flex items-center gap-2 text-sm text-white"
              style={sgFont}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
              New Topology
            </button>
          </div>
        </header>

        {/* Error state */}
        {error && (
          <div className="mb-8 p-4 rounded-xl border flex items-start gap-3"
            style={{
              background: 'rgba(255,180,171,0.06)',
              borderColor: 'rgba(255,180,171,0.2)',
              color: '#ffb4ab',
            }}>
            <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: 18 }}>error</span>
            <div>
              <p className="text-sm font-medium" style={sgFont}>{error}</p>
              <button onClick={fetchTopologies}
                className="text-xs mt-1 underline underline-offset-2 opacity-70 hover:opacity-100"
                style={sgFont}>
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: 'var(--accent-primary)' }} />
            <p style={{ color: 'var(--content-secondary)', ...sgFont }}>Fetching your topologies…</p>
          </div>
        ) : !error && topologies.length === 0 ? (
          /* Empty state */
          <div
            className="glass-panel rounded-xl border-dashed flex flex-col items-center justify-center py-28 cursor-pointer transition-all"
            style={{ borderColor: 'var(--border-default)', borderStyle: 'dashed' }}
            onClick={() => navigate('/simulator')}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-hover)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
          >
            <span className="material-symbols-outlined mb-4 text-4xl" style={{ color: 'var(--border-default)', fontSize: 36 }}>lan</span>
            <h3 className="text-lg font-semibold mb-2" style={{ ...sgFont, color: 'var(--content-primary)' }}>No topologies yet</h3>
            <p className="text-sm text-center max-w-xs mb-6" style={{ color: 'var(--content-muted)' }}>
              Go to the simulator, build a network, then click <strong style={{ color: 'var(--accent-primary)' }}>Save</strong> to see it here.
            </p>
            <button className="btn-primary-gradient px-6 py-2 rounded text-sm text-white" style={sgFont}>
              Open Simulator →
            </button>
          </div>
        ) : (
          /* Topology grid */
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {topologies.map((top, idx) => (
              <motion.div
                key={top.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                className="glass-panel card-hover-glow rounded-xl overflow-hidden cursor-pointer"
                onClick={() => loadTopology(top)}
              >
                {/* Card banner */}
                <div className="h-24 relative flex items-center justify-center overflow-hidden"
                  style={{ background: 'var(--surface-card)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to bottom right, rgba(183,109,255,0.12), transparent)' }} />
                  <span className="material-symbols-outlined relative z-10"
                    style={{ fontSize: 32, color: 'var(--accent-primary)', fontVariationSettings: "'FILL' 1" }}>lan</span>
                </div>

                {/* Card body */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-base mb-1" style={{ ...sgFont, color: 'var(--content-primary)' }}>{top.name}</h3>
                      <p className="text-xs font-mono" style={{ color: 'var(--border-default)' }}>
                        #{top.id}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs uppercase tracking-wider border"
                      style={{
                        background: 'rgba(183,109,255,0.1)',
                        color: 'var(--accent-primary)',
                        borderColor: 'rgba(183,109,255,0.2)',
                        ...sgFont,
                      }}>
                      Active
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-2.5 rounded-lg" style={{ background: 'var(--surface-card)' }}>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--border-default)', ...sgFont }}>Nodes</p>
                      <p className="text-sm font-mono font-semibold" style={{ color: 'var(--content-primary)' }}>{getNodeCount(top)}</p>
                    </div>
                    <div className="p-2.5 rounded-lg" style={{ background: 'var(--surface-card)' }}>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--border-default)', ...sgFont }}>Saved</p>
                      <p className="text-sm font-mono" style={{ color: 'var(--content-primary)' }}>{formatDate(top.updatedAt)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      className="flex-1 py-2 rounded flex items-center justify-center gap-2 text-sm border transition-all"
                      style={{ ...sgFont, color: 'var(--content-primary)', background: 'var(--surface-hover)', borderColor: 'var(--border-subtle)' }}
                      onClick={(e) => { e.stopPropagation(); loadTopology(top); }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(183,109,255,0.4)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>play_arrow</span>
                      Open
                    </button>
                    <button
                      onClick={(e) => deleteTopology(e, top.id)}
                      className="p-2 rounded border transition-all"
                      style={{ background: 'var(--surface-hover)', borderColor: 'var(--border-subtle)', color: 'var(--content-muted)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#ffb4ab'; e.currentTarget.style.borderColor = 'rgba(255,180,171,0.3)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--content-muted)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Add new card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: topologies.length * 0.07 }}
              className="glass-panel rounded-xl border-dashed flex flex-col items-center justify-center py-16 cursor-pointer transition-all"
              style={{ borderColor: 'var(--border-default)', borderStyle: 'dashed', minHeight: 260 }}
              onClick={() => navigate('/simulator')}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-hover)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
            >
              <span className="material-symbols-outlined mb-3" style={{ color: 'var(--border-default)', fontSize: 28 }}>add</span>
              <h3 className="font-semibold mb-1" style={{ ...sgFont, color: 'var(--content-primary)' }}>New Topology</h3>
              <p className="text-xs text-center px-6" style={{ color: 'var(--content-muted)' }}>Start from scratch in the simulator</p>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
