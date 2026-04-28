import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import HeroSimulator from '../components/HeroSimulator';
import useThemeStore from '../store/useThemeStore';

const FeatureCard = ({ icon, title, desc, accent = '#ddb7ff' }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="glass-panel card-hover-glow rounded-xl p-8 flex flex-col gap-4 relative overflow-hidden group cursor-default"
  >
    <div className="absolute right-0 top-0 w-48 h-48 rounded-full blur-[60px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{ background: `${accent}18` }} />
    <div className="flex items-center justify-center w-11 h-11 rounded-lg border"
      style={{
        background: 'var(--surface-card)',
        borderColor: 'var(--border-default)',
        color: accent,
      }}>
      <span className="material-symbols-outlined" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
    </div>
    <h3 className="text-lg font-semibold" style={{ color: 'var(--content-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h3>
    <p className="text-sm leading-relaxed" style={{ color: 'var(--content-secondary)' }}>{desc}</p>
    <div className="mt-auto pt-4 border-t flex justify-between items-center text-xs font-medium"
      style={{ borderColor: 'var(--border-subtle)', color: accent, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.04em' }}>
      <span>Explore →</span>
    </div>
  </motion.div>
);

const LandingPage = () => {
  const { theme, toggleTheme } = useThemeStore();
  return (
    <div className="min-h-screen">
      {/* ── Top Navigation (Stitch style) ── */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16 border-b"
        style={{
          background: 'var(--panel-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'var(--border-subtle)',
          boxShadow: '0 0 20px rgba(168,85,247,0.12)',
        }}>
        <div className="flex items-center gap-8">
          <span className="text-2xl font-bold tracking-tighter uppercase"
            style={{ color: 'var(--content-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>
            NetSim
          </span>
          <div className="hidden md:flex gap-1">
            {['Dashboard', 'Simulator', 'Calculator', 'About'].map((label, i) => {
              const paths = ['/dashboard', '/simulator', '/subnet-calc', '/about'];
              return (
                <Link key={label} to={paths[i]}
                  className="transition-all px-3 py-2 rounded text-sm hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 duration-150"
                  style={{ color: 'var(--content-secondary)', fontFamily: "'Space Grotesk', sans-serif" }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--content-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--content-secondary)'}>
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center"
            style={{ color: 'var(--content-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--content-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--content-secondary)'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link to="/login"
            className="text-sm px-4 py-2 rounded transition-all hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: 'var(--content-secondary)', fontFamily: "'Space Grotesk', sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--content-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--content-secondary)'}>
            Sign in
          </Link>
          <Link to="/register"
            className="text-sm px-5 py-2 rounded-lg text-white font-medium transition-all btn-primary-gradient"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <main className="pt-[120px] pb-20 px-8 max-w-[1200px] mx-auto flex flex-col gap-20">
        <section className="flex flex-col items-center text-center gap-8 py-16 relative">
          {/* Hero glow blob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none -z-10"
            style={{ background: 'rgba(183,109,255,0.12)' }} />

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm"
            style={{
              borderColor: 'rgba(221,183,255,0.2)',
              background: 'rgba(221,183,255,0.05)',
              color: '#ddb7ff',
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: '0.05em',
            }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#ddb7ff' }} />
            NetSim Engine v2.4.0 is live
          </motion.div>

          {/* Hero Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="flex flex-col gap-4 max-w-3xl">
            <h1 className="font-bold leading-tight"
              style={{ color: 'var(--content-primary)', fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(40px,6vw,68px)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Architect Networks with <br />
              <span className="text-gradient">Mathematical Precision</span>
            </h1>
            <p className="text-lg leading-relaxed mx-auto max-w-2xl" style={{ color: 'var(--content-secondary)' }}>
              Design, simulate, and analyze complex topologies in real-time.
              Built for engineers who demand extreme accuracy and zero compromises.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="flex items-center gap-4">
            <Link to="/simulator"
              className="btn-primary-gradient px-8 py-4 rounded-lg font-medium text-sm text-white flex items-center gap-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.04em' }}>
              Start Simulating
              <span className="material-symbols-outlined text-sm" style={{ fontFamily: "'Material Symbols Outlined'" }}>arrow_forward</span>
            </Link>
            <Link to="/about"
              className="px-8 py-4 rounded-lg text-sm font-medium border transition-all hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
              style={{ borderColor: 'var(--border-default)', color: 'var(--content-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>
              <span className="material-symbols-outlined text-sm" style={{ fontFamily: "'Material Symbols Outlined'" }}>info</span>
              About Team
            </Link>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="relative w-full max-w-4xl mt-4">
            <div className="absolute -inset-6 rounded-full blur-3xl -z-10"
              style={{ background: 'linear-gradient(to right, #b76dff22, #92049822)' }} />
            <HeroSimulator />
          </motion.div>
        </section>

        {/* ── Feature Bento Grid ── */}
        <section className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon="hub"
            title="Live Topology Mapping"
            desc="Instantly visualize routing loops, bottlenecks, and failover paths. Watch packets traverse your synthetic network in real-time."
            accent="#ddb7ff"
          />
          <FeatureCard
            icon="send"
            title="Animated Packet Tracer"
            desc="Our BFS-driven engine routes packets across the active graph, lighting up connections hop by hop in real-time with animations."
            accent="#ffaaf8"
          />
          <FeatureCard
            icon="calculate"
            title="Subnet Calculator"
            desc="Integrated tools for VLSM calculation, wildcard mask generation, and instant route aggregation logic. Zero latency, client-side."
            accent="#dcb8ff"
          />
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full flex flex-col items-center gap-4 py-12 border-t mt-8"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-panel)' }}>
        <div className="flex gap-8">
          {['API Reference', 'Status Page', 'Security', 'Privacy'].map(label => (
            <a key={label} href="#"
              className="text-xs uppercase tracking-widest transition-colors hover:text-purple-400"
              style={{ color: 'var(--content-muted)', fontFamily: "'Space Grotesk', sans-serif" }}>
              {label}
            </a>
          ))}
        </div>
        <p className="text-xs" style={{ color: 'var(--content-muted)', fontFamily: "'Space Grotesk', sans-serif" }}>
          © 2024 NetSim Engineering. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
