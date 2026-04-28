import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LogOut, Sun, Moon } from 'lucide-react';
import api from '../api/axios';
import useThemeStore from '../store/useThemeStore';


// Stitch sidebar: bg-[#120F17]/50 backdrop-blur-md border-r border-white/5
// Active: bg-purple-500/10 text-purple-400 border-r-2 border-purple-500

const navItems = [
  { name: 'Overview',     path: '/dashboard',   icon: 'dashboard' },
  { name: 'Live Sim',     path: '/simulator',   icon: 'hub' },
  { name: 'Subnet Tool',  path: '/subnet-calc', icon: 'calculate' },
  { name: 'About',        path: '/about',        icon: 'info' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 z-40 flex flex-col"
      style={{
        background: 'var(--panel-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* Brand — clicking navigates to home */}
      <Link
        to="/"
        className="p-6 border-b flex items-center gap-3 no-underline transition-opacity hover:opacity-80"
        style={{ textDecoration: 'none', borderColor: 'var(--border-subtle)' }}
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(to bottom right, var(--accent-primary), var(--accent-hover))' }}>
          <span className="material-symbols-outlined text-white" style={{ fontSize: 16 }}>memory</span>
        </div>
        <div>
          <h1 className="font-black text-sm uppercase tracking-wider"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--accent-primary)', letterSpacing: '0.1em' }}>
            NetSim
          </h1>
          <p className="text-xs" style={{ color: 'var(--content-muted)', fontFamily: "'Space Grotesk', sans-serif" }}>v2.4.0-stable</p>
        </div>
      </Link>


      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-4 py-3 text-sm transition-all duration-150'
                : 'flex items-center gap-3 px-4 py-3 text-sm transition-all duration-150 hover:bg-black/5 dark:hover:bg-white/5'
            }
            style={({ isActive }) => isActive
              ? {
                  color: 'var(--accent-primary)',
                  background: theme === 'dark' ? 'rgba(168,85,247,0.1)' : 'rgba(168,85,247,0.05)',
                  borderRight: '2px solid var(--accent-primary)',
                  fontFamily: "'Space Grotesk', sans-serif",
                }
              : {
                  color: 'var(--content-secondary)',
                  fontFamily: "'Space Grotesk', sans-serif",
                }
            }
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="py-3 border-t flex flex-col gap-1" style={{ borderColor: 'var(--border-subtle)' }}>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-2.5 w-full text-sm transition-all duration-150 hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: 'var(--content-secondary)', fontFamily: "'Space Grotesk', sans-serif" }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--content-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--content-secondary)'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full text-sm transition-all duration-150 hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: 'var(--content-secondary)', fontFamily: "'Space Grotesk', sans-serif" }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--content-secondary)'}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
