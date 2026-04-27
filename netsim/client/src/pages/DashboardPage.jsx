import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Network, Plus, Trash2, Clock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import useSimulatorStore from '../store/useSimulatorStore';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [topologies, setTopologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch saved topologies from the backend on mount
  useEffect(() => {
    const fetchTopologies = async () => {
      try {
        const res = await api.get('/topologies');
        setTopologies(res.data);
      } catch (err) {
        setError('Failed to load topologies.');
      } finally {
        setLoading(false);
      }
    };
    fetchTopologies();
  }, []);

  const loadTopology = (topology) => {
    // Parse the JSON and load into Zustand store, then navigate to simulator
    try {
      const nodes = JSON.parse(topology.nodesJson);
      const edges = JSON.parse(topology.edgesJson);
      const store = useSimulatorStore.getState();
      store.loadTopology(nodes, edges, topology.id, topology.name);
      navigate('/simulator');
    } catch (err) {
      // If JSON parsing fails, just go to simulator
      navigate('/simulator');
    }
  };

  const deleteTopology = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete('/topologies/' + id);
      setTopologies((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError('Failed to delete topology.');
    }
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return diffMins + ' min ago';
    if (diffHours < 24) return diffHours + ' hour' + (diffHours > 1 ? 's' : '') + ' ago';
    if (diffDays < 7) return diffDays + ' day' + (diffDays > 1 ? 's' : '') + ' ago';
    return date.toLocaleDateString();
  };

  // Determine topology type from nodes
  const getTopologyInfo = (topology) => {
    try {
      const nodes = JSON.parse(topology.nodesJson);
      return { nodesCount: nodes.length };
    } catch {
      return { nodesCount: 0 };
    }
  };

  return (
    <div className="flex bg-surface-root min-h-screen">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-content-primary mb-2">Saved Topologies</h1>
              <p className="text-content-secondary">Manage and load your previously designed networks.</p>
            </div>
            <button 
              onClick={() => navigate('/simulator')}
              className="flex items-center gap-2 bg-accent-primary hover:bg-indigo-500 text-content-primary px-5 py-2.5 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              New Topology
            </button>
          </header>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center p-16">
              <Loader2 className="w-10 h-10 text-accent-primary animate-spin mb-4" />
              <p className="text-content-secondary">Loading your topologies...</p>
            </div>
          ) : topologies.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 border border-dashed border-border-subtle rounded-2xl bg-surface-panel/50">
              <Network className="w-16 h-16 text-slate-600 mb-4" />
              <h3 className="text-xl font-medium text-content-primary mb-2">No topologies yet</h3>
              <p className="text-content-secondary">Head over to the simulator to create your first design.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topologies.map((top, idx) => {
                const info = getTopologyInfo(top);
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={top.id}
                    className="bg-surface-panel border border-border-subtle rounded-2xl p-5 hover:border-indigo-500/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all group cursor-pointer"
                    onClick={() => loadTopology(top)}
                  >
                    <div className="w-12 h-12 rounded-lg bg-surface-card flex items-center justify-center text-accent-primary mb-4 group-hover:scale-110 transition-transform">
                      <Network className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-content-primary mb-1">{top.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-content-secondary mb-4">
                      <span>{info.nodesCount} Nodes</span>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-border-subtle pt-4 mt-auto">
                      <div className="flex items-center gap-1.5 text-xs text-content-muted">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(top.updatedAt)}
                      </div>
                      <button 
                        onClick={(e) => deleteTopology(e, top.id)}
                        className="text-content-muted hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
