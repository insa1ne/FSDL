import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Network, Plus, Trash2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardPage = () => {
  const navigate = useNavigate();
  // Mock saved topologies
  const [topologies, setTopologies] = useState([
    { id: 1, name: 'Campus Data Center', type: 'Star', nodesCount: 5, date: '2 hours ago' },
    { id: 2, name: 'Lab 204 Network', type: 'Bus', nodesCount: 8, date: 'Yesterday' },
    { id: 3, name: 'Redundant Ring Test', type: 'Ring', nodesCount: 4, date: '3 days ago' },
  ]);

  const loadTopology = (id) => {
    // In actual implementation, we'd fetch the JSON and set Zustand state here.
    // For now we just route to simulator to pretend loading.
    navigate('/simulator');
  };

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Saved Topologies</h1>
              <p className="text-slate-400">Manage and load your previously designed networks.</p>
            </div>
            <button 
              onClick={() => navigate('/simulator')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              New Topology
            </button>
          </header>

          {topologies.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 border border-dashed border-slate-700 rounded-2xl bg-slate-900/50">
              <Network className="w-16 h-16 text-slate-600 mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No topologies yet</h3>
              <p className="text-slate-400">Head over to the simulator to create your first design.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topologies.map((top, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={top.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all group cursor-pointer"
                  onClick={() => loadTopology(top.id)}
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                    <Network className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{top.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                    <span>{top.type} Topology</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <span>{top.nodesCount} Nodes</span>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-auto">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {top.date}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setTopologies(prev => prev.filter(p => p.id !== top.id));
                      }}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
