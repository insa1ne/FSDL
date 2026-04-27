import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Network, Calculator, Info, LogOut, ActivitySquare } from 'lucide-react';
import api from '../api/axios';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {
      // Ignore errors — we're logging out regardless
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Saved Topologies', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Simulator', path: '/simulator', icon: Network },
    { name: 'Subnet Calc', path: '/subnet-calc', icon: Calculator },
    { name: 'About', path: '/about', icon: Info },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-2 text-white font-bold text-xl tracking-tight border-b border-slate-800">
        <ActivitySquare className="text-indigo-500" />
        NetSim<span className="text-indigo-500">.</span>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-4 py-3 rounded-xl font-medium bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent transition-colors'
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
