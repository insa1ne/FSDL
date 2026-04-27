import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Network, Calculator, Info, LogOut, ActivitySquare, Moon, Sun } from 'lucide-react';
import api from '../api/axios';
import useThemeStore from '../store/useThemeStore';

const Sidebar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();

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
    <div className="w-64 bg-surface-panel border-r border-border-subtle h-screen flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-2 text-content-primary font-bold text-xl tracking-tight border-b border-border-subtle">
        <ActivitySquare className="text-accent-primary" />
        NetSim<span className="text-accent-primary">.</span>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-4 py-3 rounded-xl font-medium bg-accent-primary/10 text-accent-primary border border-accent-primary/20'
                : 'flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-content-secondary hover:bg-surface-hover hover:text-content-primary border border-transparent transition-colors'
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border-subtle flex flex-col gap-2">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-content-secondary hover:text-content-primary hover:bg-surface-hover rounded-xl transition-colors font-medium"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-content-secondary hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
